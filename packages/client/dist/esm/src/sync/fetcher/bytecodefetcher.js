import { CODEHASH_PREFIX, MerkleStateManager } from '@ethereumjs/statemanager';
import { BIGINT_0, bytesToHex, bytesToUnprefixedHex, concatBytes, equalsBytes, } from '@ethereumjs/util';
import debug from 'debug';
import { keccak256 } from 'ethereum-cryptography/keccak.js';
import { Fetcher } from "./fetcher.js";
import { getInitFetcherDoneFlags } from "./types.js";
export class ByteCodeFetcher extends Fetcher {
    /**
     * Create new block fetcher
     */
    constructor(options) {
        super(options);
        this.hashes = options.hashes ?? [];
        this.stateManager = options.stateManager ?? new MerkleStateManager();
        this.fetcherDoneFlags = options.fetcherDoneFlags ?? getInitFetcherDoneFlags();
        this.fetcherDoneFlags.byteCodeFetcher.count = BigInt(this.hashes.length);
        this.codeDB = this.stateManager['_getCodeDB']();
        this.keccakFunction = this.config.chainCommon.customCrypto.keccak256 ?? keccak256;
        this.debug = debug('client:fetcher:bytecode');
        if (this.hashes.length > 0) {
            const fullJob = { task: { hashes: this.hashes } };
            this.DEBUG &&
                this.debug(`Bytecode fetcher instantiated ${fullJob.task.hashes.length} hash requests destroyWhenDone=${this.destroyWhenDone}`);
        }
    }
    setDestroyWhenDone() {
        this.destroyWhenDone = true;
    }
    /**
     * Request results from peer for the given job.
     * Resolves with the raw result
     * If `undefined` is returned, re-queue the job.
     * @param job
     * @param peer
     */
    async request(job) {
        const { task, peer } = job;
        // Currently this is the only safe place to call peer.latest() without interfering with the fetcher
        // TODOs:
        // 1. Properly rewrite Fetcher with async/await -> allow to at least place in Fetcher.next()
        // 2. Properly implement ETH request IDs -> allow to call on non-idle in Peer Pool
        await peer?.latest();
        this.DEBUG &&
            this.debug(`requested code hashes: ${Array.from(task.hashes).map((h) => bytesToHex(h))}`);
        const rangeResult = await peer.snap.getByteCodes({
            hashes: Array.from(task.hashes),
            bytes: BigInt(this.config.maxRangeBytes),
        });
        // Response is valid, but check if peer is signalling that it does not have
        // the requested data. For bytecode range queries that means the peer is not
        // yet synced.
        if (rangeResult === undefined || task.hashes.length < rangeResult.codes.length) {
            this.DEBUG && this.debug(`Peer rejected bytecode request`);
            return undefined;
        }
        // Cross reference the requested bytecodes with the response to find gaps
        // that the serving node is missing
        const receivedCodes = new Map();
        const missingCodeHashes = [];
        // While results are in the same order as requested hashes but there could be gaps/misses in the results
        // if the node doesn't has the bytecode. We need an index to move forward through the hashes which are
        // absent in the received responses
        let requestedHashIndex = 0;
        for (let i = 0; i < rangeResult.codes.length; i++) {
            const receivedCode = rangeResult.codes[i];
            const receivedHash = this.keccakFunction(receivedCode);
            // move forward requestedHashIndex till the match has been found
            while (requestedHashIndex < task.hashes.length &&
                !equalsBytes(receivedHash, task.hashes[requestedHashIndex])) {
                // requestedHashIndex 's hash is skipped in response
                missingCodeHashes.push(task.hashes[requestedHashIndex]);
                requestedHashIndex++;
            }
            if (requestedHashIndex >= task.hashes.length) {
                // no more matches
                break;
            }
            else {
                // match found
                receivedCodes.set(bytesToUnprefixedHex(receivedHash), receivedCode);
            }
        }
        // requeue missed requests for fetching
        if (missingCodeHashes.length > 0) {
            this.DEBUG &&
                this.debug(`${missingCodeHashes.length} missed requests adding them to request backlog`);
            this.hashes.push(...missingCodeHashes);
        }
        return Object.assign([], [receivedCodes], { completed: true });
    }
    /**
     * Process the reply for the given job.
     * If the reply contains unexpected data, return `undefined`,
     * this re-queues the job.
     * @param job fetch job
     * @param result result data
     */
    process(job, result) {
        const fullResult = (job.partialResult ?? []).concat(result);
        job.partialResult = undefined;
        if (result.completed === true) {
            return fullResult;
        }
        else {
            // Save partial result to re-request missing items.
            job.partialResult = fullResult;
        }
    }
    /**
     * Store fetch result. Resolves once store operation is complete.
     * @param result fetch result
     */
    async store(result) {
        const codeHashToByteCode = result[0];
        const ops = [];
        let storeCount = 0;
        for (const [_, value] of codeHashToByteCode) {
            const codeHash = this.keccakFunction(value);
            const computedKey = concatBytes(CODEHASH_PREFIX, codeHash);
            ops.push({
                type: 'put',
                key: computedKey,
                value,
            });
            storeCount += 1;
        }
        await this.codeDB.batch(ops);
        this.fetcherDoneFlags.byteCodeFetcher.first += BigInt(codeHashToByteCode.size);
        // no idea why first starts exceeding count, may be because of missed hashes thing, so resort to this
        // weird method of tracking the count
        this.fetcherDoneFlags.byteCodeFetcher.count =
            this.fetcherDoneFlags.byteCodeFetcher.first + BigInt(this.hashes.length);
        this.DEBUG && this.debug(`Stored ${storeCount} bytecode in code trie`);
    }
    /**
     * Create new tasks based on a provided list of block numbers.
     *
     * If numbers are sequential the request is created as bulk request.
     *
     * If there are no tasks in the fetcher and `min` is behind head,
     * inserts the requests for the missing blocks first.
     *
     * @param numberList List of block numbers
     * @param min Start block number
     */
    enqueueByByteCodeRequestList(byteCodeRequestList) {
        this.hashes.push(...byteCodeRequestList);
        // no idea why first starts exceeding count, may be because of missed hashes thing, so resort to this
        // weird method of tracking the count
        this.fetcherDoneFlags.byteCodeFetcher.count =
            this.fetcherDoneFlags.byteCodeFetcher.first + BigInt(this.hashes.length);
        this.DEBUG &&
            this.debug(`Number of bytecode fetch requests added to fetcher queue: ${byteCodeRequestList.length}`);
        this.nextTasks();
    }
    /**
     * Generate list of tasks to fetch. Modifies `first` and `count` to indicate
     * remaining items apart from the tasks it pushes in the queue
     */
    tasks(maxTasks = this.config.maxFetcherJobs) {
        const max = this.config.maxPerRequest;
        const tasks = [];
        while (tasks.length < maxTasks && this.hashes.length > 0) {
            tasks.push({ hashes: this.hashes.splice(0, max) });
        }
        this.DEBUG && this.debug(`Created new tasks num=${tasks.length}`);
        return tasks;
    }
    nextTasks() {
        this.DEBUG &&
            this.debug(`Entering nextTasks with hash request queue length of ${this.hashes.length}`);
        this.DEBUG && this.debug('Bytecode requests in primary queue:');
        for (const h of this.hashes) {
            this.DEBUG && this.debug(`\tCode hash: ${bytesToHex(h)}`);
            this.DEBUG && this.debug('\t---');
        }
        try {
            if (this.in.length === 0 && this.hashes.length > 0) {
                const fullJob = { task: { hashes: this.hashes } };
                const tasks = this.tasks();
                for (const task of tasks) {
                    this.enqueueTask(task, true);
                }
                this.DEBUG &&
                    this.debug(`Fetcher pending with ${fullJob.task.hashes.length} code hashes requested`);
            }
        }
        catch (err) {
            this.DEBUG && this.debug(err);
        }
    }
    /**
     * Clears all outstanding tasks from the fetcher
     */
    clear() {
        return;
    }
    /**
     * Returns an idle peer that can process a next job.
     */
    peer() {
        return this.pool.idle((peer) => 'snap' in peer);
    }
    processStoreError(error, _task) {
        const stepBack = BIGINT_0;
        const destroyFetcher = !error.message.includes(`InvalidRangeProof`) &&
            !error.message.includes(`InvalidAccountRange`);
        const banPeer = true;
        return { destroyFetcher, banPeer, stepBack };
    }
    /**
     * Job log format helper.
     * @param job
     * @param withIndex pass true to additionally output job.index
     */
    jobStr(job, withIndex = false) {
        let str = '';
        if (withIndex) {
            str += `index=${job.index} `;
        }
        str += `${job.task.hashes.length} hash requests`;
        return str;
    }
}
//# sourceMappingURL=bytecodefetcher.js.map
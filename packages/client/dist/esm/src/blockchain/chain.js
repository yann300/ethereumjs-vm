import { createBlockFromBytesArray, createBlockHeaderFromBytesArray } from '@ethereumjs/block';
import { CliqueConsensus, createBlockchain } from '@ethereumjs/blockchain';
import { ConsensusAlgorithm, Hardfork } from '@ethereumjs/common';
import { BIGINT_0, EthereumJSErrorWithoutCode, equalsBytes } from '@ethereumjs/util';
import { LevelDB } from "../execution/level.js";
import { Event } from "../types.js";
/**
 * Blockchain
 * @memberof module:blockchain
 */
export class Chain {
    /**
     * Safe creation of a Chain object awaiting the initialization
     * of the underlying Blockchain object.
     *
     * @param options
     */
    static async create(options) {
        let validateConsensus = false;
        const consensusDict = {};
        if (options.config.chainCommon.consensusAlgorithm() === ConsensusAlgorithm.Clique) {
            consensusDict[ConsensusAlgorithm.Clique] = new CliqueConsensus();
            validateConsensus = true;
        }
        options.blockchain =
            options.blockchain ??
                (await createBlockchain({
                    db: new LevelDB(options.chainDB),
                    common: options.config.chainCommon,
                    hardforkByHeadBlockNumber: true,
                    validateBlocks: true,
                    validateConsensus,
                    consensusDict,
                    genesisState: options.genesisState,
                    genesisStateRoot: options.genesisStateRoot,
                }));
        return new this(options);
    }
    /**
     * Creates new chain
     *
     * Do not use directly but instead use the static async `create()` constructor
     * for concurrency safe initialization.
     *
     * @param options
     */
    constructor(options) {
        this._headers = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
        this._blocks = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
        this.config = options.config;
        this.blockchain = options.blockchain;
        this.blockCache = {
            remoteBlocks: new Map(),
            executedBlocks: new Map(),
            invalidBlocks: new Map(),
        };
        this.chainDB = this.blockchain.db;
        this._customGenesisState = options.genesisState;
        this._customGenesisStateRoot = options.genesisStateRoot;
        this.opened = false;
    }
    /**
     * Resets _header, _blocks
     */
    reset() {
        this._headers = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
        this._blocks = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
    }
    /**
     * Chain ID
     */
    get chainId() {
        return this.config.chainCommon.chainId();
    }
    /**
     * Genesis block for the chain
     */
    get genesis() {
        return this.blockchain.genesisBlock;
    }
    /**
     * Returns properties of the canonical headerchain.
     */
    get headers() {
        return { ...this._headers };
    }
    /**
     * Returns properties of the canonical blockchain.
     */
    get blocks() {
        return { ...this._blocks };
    }
    /**
     * Open blockchain and wait for database to load
     * @returns false if chain is already open, otherwise void
     */
    async open() {
        if (this.opened)
            return false;
        await this.blockchain.db.open();
        this.opened = true;
        await this.update(false);
        this.config.chainCommon.events.on('hardforkChanged', async (hardfork) => {
            const block = this.config.chainCommon.hardforkBlock();
            this.config.superMsg(`New hardfork reached 🪢 ! hardfork=${hardfork} ${block !== null ? `block=${block}` : ''}`);
        });
    }
    /**
     * Closes chain
     * @returns false if chain is closed, otherwise void
     */
    async close() {
        if (!this.opened)
            return false;
        this.reset();
        await this.blockchain.db?.close?.();
        this.opened = false;
    }
    /**
     * Resets the chain to canonicalHead number
     */
    async resetCanonicalHead(canonicalHead) {
        if (!this.opened)
            return false;
        await this.blockchain.resetCanonicalHead(canonicalHead);
        return this.update(false);
    }
    /**
     * Update blockchain properties (latest block, td, height, etc...)
     * @param emit Emit a `CHAIN_UPDATED` event
     * @returns false if chain is closed, otherwise void
     */
    async update(emit = true) {
        if (!this.opened)
            return false;
        const headers = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
        const blocks = {
            latest: null,
            finalized: null,
            safe: null,
            vm: null,
            td: BIGINT_0,
            height: BIGINT_0,
        };
        blocks.latest = await this.getCanonicalHeadBlock();
        blocks.finalized = (await this.getCanonicalFinalizedBlock()) ?? null;
        blocks.safe = (await this.getCanonicalSafeBlock()) ?? null;
        blocks.vm = await this.getCanonicalVmHead();
        headers.latest = await this.getCanonicalHeadHeader();
        // finalized and safe are always blocks since they have to have valid execution
        // before they can be saved in chain
        headers.finalized = blocks.finalized?.header ?? null;
        headers.safe = blocks.safe?.header ?? null;
        headers.vm = blocks.vm.header;
        headers.height = headers.latest.number;
        blocks.height = blocks.latest.header.number;
        headers.td = await this.getTd(headers.latest.hash(), headers.height);
        blocks.td = await this.getTd(blocks.latest.hash(), blocks.height);
        this._headers = headers;
        this._blocks = blocks;
        this.config.chainCommon.setHardforkBy({
            blockNumber: headers.latest.number,
            timestamp: headers.latest.timestamp,
        });
        if (emit) {
            this.config.events.emit(Event.CHAIN_UPDATED);
        }
    }
    /**
     * Get blocks from blockchain
     * @param block hash or number to start from
     * @param max maximum number of blocks to get
     * @param skip number of blocks to skip
     * @param reverse get blocks in reverse
     * @returns an array of the blocks
     */
    async getBlocks(block, max = 1, skip = 0, reverse = false) {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getBlocks(block, max, skip, reverse);
    }
    /**
     * Get a block by its hash or number
     * @param block block hash or number
     * @throws if block is not found
     */
    async getBlock(block) {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getBlock(block);
    }
    /**
     * Insert new blocks into blockchain
     * @param blocks list of blocks to add
     * @param fromEngine pass true to process post-merge blocks, otherwise they will be skipped
     * @returns number of blocks added
     */
    async putBlocks(blocks, fromEngine = false, skipUpdateEmit = false) {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        if (blocks.length === 0)
            return 0;
        let numAdded = 0;
        // filter out finalized blocks
        const newBlocks = [];
        for (const block of blocks) {
            if (this.headers.finalized !== null && block.header.number <= this.headers.finalized.number) {
                const canonicalBlock = await this.getBlock(block.header.number);
                if (!equalsBytes(canonicalBlock.hash(), block.hash())) {
                    throw Error(`Invalid putBlock for block=${block.header.number} before finalized=${this.headers.finalized.number}`);
                }
            }
            else {
                newBlocks.push(block);
            }
        }
        for (const [i, b] of newBlocks.entries()) {
            if (!fromEngine && this.config.chainCommon.gteHardfork(Hardfork.Paris)) {
                if (i > 0) {
                    // emitOnLast below won't be reached, so run an update here
                    await this.update(!skipUpdateEmit);
                }
                break;
            }
            if (b.header.number <= this.headers.height) {
                await this.blockchain.checkAndTransitionHardForkByNumber(b.header.number, b.header.timestamp);
                await this.blockchain.consensus?.setup({ blockchain: this.blockchain });
            }
            const block = createBlockFromBytesArray(b.raw(), {
                common: this.config.chainCommon,
                setHardfork: true,
            });
            await this.blockchain.putBlock(block);
            numAdded++;
            const emitOnLast = newBlocks.length === numAdded;
            await this.update(emitOnLast && !skipUpdateEmit);
        }
        return numAdded;
    }
    /**
     * Get headers from blockchain
     * @param block hash or number to start from
     * @param max maximum number of headers to get
     * @param skip number of headers to skip
     * @param reverse get headers in reverse
     * @returns list of block headers
     */
    async getHeaders(block, max, skip, reverse) {
        const blocks = await this.getBlocks(block, max, skip, reverse);
        return blocks.map((b) => b.header);
    }
    /**
     * Insert new headers into blockchain
     * @param headers
     * @param mergeIncludes skip adding headers after merge
     * @returns number of headers added
     */
    async putHeaders(headers, mergeIncludes = false) {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        if (headers.length === 0)
            return 0;
        let numAdded = 0;
        for (const [i, h] of headers.entries()) {
            if (!mergeIncludes && this.config.chainCommon.gteHardfork(Hardfork.Paris)) {
                if (i > 0) {
                    // emitOnLast below won't be reached, so run an update here
                    await this.update(true);
                }
                break;
            }
            const header = createBlockHeaderFromBytesArray(h.raw(), {
                common: this.config.chainCommon,
                setHardfork: true,
            });
            await this.blockchain.putHeader(header);
            numAdded++;
            const emitOnLast = headers.length === numAdded;
            await this.update(emitOnLast);
        }
        return numAdded;
    }
    /**
     * Gets the latest header in the canonical chain
     */
    async getCanonicalHeadHeader() {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getCanonicalHeadHeader();
    }
    /**
     * Gets the latest block in the canonical chain
     */
    async getCanonicalHeadBlock() {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getCanonicalHeadBlock();
    }
    /**
     * Gets the latest block in the canonical chain
     */
    async getCanonicalSafeBlock() {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getIteratorHeadSafe('safe');
    }
    /**
     * Gets the latest block in the canonical chain
     */
    async getCanonicalFinalizedBlock() {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getIteratorHeadSafe('finalized');
    }
    /**
     * Gets the latest block in the canonical chain
     */
    async getCanonicalVmHead() {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getIteratorHead();
    }
    /**
     * Gets total difficulty for a block
     * @param hash the block hash
     * @param num the block number
     * @returns the td
     */
    async getTd(hash, num) {
        if (!this.opened)
            throw EthereumJSErrorWithoutCode('Chain closed');
        return this.blockchain.getTotalDifficulty(hash, num);
    }
}
//# sourceMappingURL=chain.js.map
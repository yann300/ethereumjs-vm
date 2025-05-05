import { Hardfork } from '@ethereumjs/common';
import { BIGINT_0 } from '@ethereumjs/util';
import { Event } from "../types.js";
import { wait } from "../util/wait.js";
/**
 * Base class for blockchain synchronizers
 * @memberof module:sync
 */
export class Synchronizer {
    /**
     * Create new node
     */
    constructor(options) {
        // Time (in ms) after which the synced state is reset
        this.SYNCED_STATE_REMOVAL_PERIOD = 60000;
        this.config = options.config;
        this.pool = options.pool;
        this.chain = options.chain;
        this._fetcher = null;
        this.interval = options.interval ?? 1000;
        this.opened = false;
        this.running = false;
        this.forceSync = false;
        this.startingBlock = BIGINT_0;
        this.config.events.on(Event.POOL_PEER_ADDED, (peer) => {
            if (this.syncable(peer)) {
                this.config.logger?.debug(`Found ${this.type} peer: ${peer}`);
            }
        });
        this.config.events.on(Event.CHAIN_UPDATED, () => {
            this.config.updateSynchronizedState(this.chain.headers.latest, true);
        });
    }
    /**
     * Returns synchronizer type
     */
    get type() {
        return 'sync';
    }
    get fetcher() {
        return this._fetcher;
    }
    set fetcher(fetcher) {
        this._fetcher = fetcher;
    }
    /**
     * Open synchronizer. Must be called before sync() is called
     */
    async open() {
        this.opened = true;
    }
    /**
     * Returns true if peer can be used for syncing
     */
    syncable(_peer) {
        // TODO: evaluate syncability of peer
        return true;
    }
    /**
     * Start synchronization
     */
    async start() {
        if (this.running || this.config.chainCommon.gteHardfork(Hardfork.Paris)) {
            return false;
        }
        this.running = true;
        this._syncedStatusCheckInterval = setInterval(this._syncedStatusCheck.bind(this), this.SYNCED_STATE_REMOVAL_PERIOD);
        const timeout = setTimeout(() => {
            this.forceSync = true;
        }, this.interval * 30);
        while (this.running && !this.config.chainCommon.gteHardfork(Hardfork.Paris)) {
            try {
                await this.sync();
            }
            catch (error) {
                this.config.events.emit(Event.SYNC_ERROR, error);
            }
            await wait(this.interval);
        }
        this.running = false;
        clearTimeout(timeout);
    }
    resolveSync(height) {
        this.clearFetcher();
        const heightStr = typeof height === 'bigint' && height !== BIGINT_0 ? ` height=${height}` : '';
        this.config.logger?.debug(`Finishing up sync with the current fetcher ${heightStr}`);
        return true;
    }
    async syncWithFetcher() {
        try {
            if (this._fetcher) {
                await this._fetcher.blockingFetch();
            }
            this.config.logger?.debug(`Fetcher finished fetching...`);
            return this.resolveSync();
        }
        catch (error) {
            this.config.logger?.error(`Received sync error, stopping sync and clearing fetcher: ${error.message ?? error}`);
            this.clearFetcher();
            throw error;
        }
    }
    /**
     * Fetch all blocks from current height up to highest found amongst peers
     * @returns when sync is completed
     */
    async sync() {
        let peer = await this.best();
        let numAttempts = 1;
        while (!peer && this.opened) {
            this.config.logger?.debug(`Waiting for best peer (attempt #${numAttempts})`);
            await wait(5000);
            peer = await this.best();
            numAttempts += 1;
        }
        if (!(await this.syncWithPeer(peer)))
            return false;
        // syncWithFetcher should auto resolve when sync completes even if from any other independent
        // fetcher. We shouldn't be auto resolving the fetchers on sync events because SYNC events are
        // not precision based but we need precision to resolve the fetchers
        //
        // TODO: check this for the forward fetcher that it resolves on being close/on head or post merge
        return this.syncWithFetcher();
    }
    /**
     * Clears and removes the fetcher.
     */
    clearFetcher() {
        if (this._fetcher) {
            this._fetcher.clear();
            this._fetcher.destroy();
            this._fetcher = null;
        }
    }
    /**
     * Stop synchronizer.
     */
    async stop() {
        this.clearFetcher();
        if (!this.running) {
            return false;
        }
        clearInterval(this._syncedStatusCheckInterval);
        await new Promise((resolve) => setTimeout(resolve, this.interval));
        this.running = false;
        this.config.logger?.info('Stopped synchronization.');
        return true;
    }
    /**
     * Close synchronizer.
     */
    async close() {
        this.opened = false;
    }
    /**
     * Reset synced status after a certain time with no chain updates
     */
    _syncedStatusCheck() {
        this.config.updateSynchronizedState();
    }
}
//# sourceMappingURL=sync.js.map
import { Chain } from "./blockchain/index.js";
import { FullEthereumService } from "./service/index.js";
import { Event } from "./types.js";
import { getPackageJSON } from "./util/index.js";
/**
 * Represents the top-level ethereum node, and is responsible for managing the
 * lifecycle of included services.
 * @memberof module:node
 */
export class EthereumClient {
    /**
     * Main entrypoint for client initialization.
     *
     * Safe creation of a Chain object awaiting the initialization
     * of the underlying Blockchain object.
     */
    static async create(options) {
        const chain = await Chain.create(options);
        return new this(chain, options);
    }
    /**
     * Create new node
     */
    constructor(chain, options) {
        this.config = options.config;
        this.chain = chain;
        this.service = new FullEthereumService({
            config: this.config,
            chainDB: options.chainDB,
            stateDB: options.stateDB,
            metaDB: options.metaDB,
            chain,
        });
        this.opened = false;
        this.started = false;
    }
    /**
     * Open node. Must be called before node is started
     */
    async open() {
        if (this.opened) {
            return false;
        }
        const name = this.config.chainCommon.chainName();
        const chainId = this.config.chainCommon.chainId();
        const packageJSON = getPackageJSON();
        this.config.logger?.info(`Initializing Ethereumjs client version=v${packageJSON.version} network=${name} chainId=${chainId}`);
        this.config.events.on(Event.SERVER_ERROR, (error) => {
            this.config.logger?.warn(`Server error: ${error.name} - ${error.message}`);
        });
        this.config.events.on(Event.SERVER_LISTENING, (details) => {
            this.config.logger?.info(`Server listener up transport=${details.transport} url=${details.url}`);
        });
        await this.service.open();
        this.opened = true;
    }
    /**
     * Starts node and all services and network servers.
     */
    async start() {
        if (this.started) {
            return false;
        }
        this.config.logger?.info('Setup networking and services.');
        await this.service.start();
        this.config.server && (await this.config.server.start());
        // Only call bootstrap if servers are actually started
        this.config.server && this.config.server.started && (await this.config.server.bootstrap());
        this.started = true;
    }
    /**
     * Stops node and all services and network servers.
     */
    async stop() {
        if (!this.started) {
            return false;
        }
        this.config.events.emit(Event.CLIENT_SHUTDOWN);
        await this.service.stop();
        this.config.server && this.config.server.started && (await this.config.server.stop());
        this.started = false;
    }
    /**
     *
     * @returns the RLPx server (if it exists)
     */
    server() {
        return this.config.server;
    }
}
//# sourceMappingURL=client.js.map
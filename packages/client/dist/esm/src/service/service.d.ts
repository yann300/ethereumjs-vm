import { Chain } from '../blockchain/index.ts';
import { PeerPool } from '../net/peerpool.ts';
import type { AbstractLevel } from 'abstract-level';
import type { Config } from '../config.ts';
import type { Peer } from '../net/peer/peer.ts';
import type { Protocol } from '../net/protocol/index.ts';
import type { Synchronizer } from '../sync/index.ts';
export interface ServiceOptions {
    config: Config;
    chain: Chain;
    chainDB?: AbstractLevel<string | Uint8Array, string | Uint8Array, string | Uint8Array>;
    stateDB?: AbstractLevel<string | Uint8Array, string | Uint8Array, string | Uint8Array>;
    metaDB?: AbstractLevel<string | Uint8Array, string | Uint8Array, string | Uint8Array>;
    interval?: number;
    timeout?: number;
}
/**
 * Base class for all services
 * @memberof module:service
 */
export declare class Service {
    config: Config;
    opened: boolean;
    running: boolean;
    pool: PeerPool;
    chain: Chain;
    interval: number;
    timeout: number;
    synchronizer?: Synchronizer;
    private v8Engine;
    /**
     * Interval for client stats output (e.g. memory) (in ms)
     * for debug log level
     *
     * (for info there will be somewhat reduced output)
     */
    private STATS_INTERVAL;
    /**
     * Shutdown the client when memory threshold is reached (in percent)
     *
     */
    private MEMORY_SHUTDOWN_THRESHOLD;
    private _statsInterval;
    private _statsCounter;
    /**
     * Create new service and associated peer pool
     */
    constructor(options: ServiceOptions);
    /**
     * Service name
     */
    get name(): string;
    /**
     * Returns all protocols required by this service
     */
    get protocols(): Protocol[];
    /**
     * Open service. Must be called before service is running
     */
    open(): Promise<boolean>;
    /**
     * Close service.
     */
    close(): Promise<void>;
    /**
     * Start service
     */
    start(): Promise<boolean>;
    /**
     * Stop service
     */
    stop(): Promise<boolean>;
    stats(): void;
    /**
     * Handles incoming request from connected peer
     * @param message message object
     * @param protocol protocol name
     * @param peer peer
     */
    handle(_message: any, _protocol: string, _peer: Peer): Promise<any>;
}
//# sourceMappingURL=service.d.ts.map
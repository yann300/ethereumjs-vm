import { VMExecution } from '../execution/index.ts';
import { Miner } from '../miner/index.ts';
import { BeaconSynchronizer, FullSynchronizer, SnapSynchronizer } from '../sync/index.ts';
import { Service } from './service.ts';
import { Skeleton } from './skeleton.ts';
import { TxPool } from './txpool.ts';
import type { Peer } from '../net/peer/peer.ts';
import type { Protocol } from '../net/protocol/index.ts';
import type { ServiceOptions } from './service.ts';
/**
 * Full Ethereum service
 * @memberof module:service
 */
export declare class FullEthereumService extends Service {
    synchronizer?: BeaconSynchronizer | FullSynchronizer;
    miner: Miner | undefined;
    txPool: TxPool;
    skeleton?: Skeleton;
    snapsync?: SnapSynchronizer;
    execution: VMExecution;
    /** building head state via snapsync or vmexecution */
    private building;
    /**
     * Create new ETH service
     */
    constructor(options: ServiceOptions);
    /**
     * Public accessor for {@link BeaconSynchronizer}. Returns undefined if unavailable.
     */
    get beaconSync(): BeaconSynchronizer | undefined;
    /**
     * Helper to switch to {@link BeaconSynchronizer}
     */
    switchToBeaconSync(skipOpen?: boolean): Promise<void>;
    open(): Promise<boolean>;
    /**
     * Start service
     */
    start(): Promise<boolean>;
    /**
     * if the vm head is not recent enough, trigger building a recent state by snapsync or by running
     * vm execution
     */
    buildHeadState(): Promise<void>;
    /**
     * Stop service
     */
    stop(): Promise<boolean>;
    /**
     * Close service
     */
    close(): Promise<void>;
    /**
     * Returns all protocols required by this service
     */
    get protocols(): Protocol[];
    /**
     * Handles incoming message from connected peer
     * @param message message object
     * @param protocol protocol name
     * @param peer peer
     */
    handle(message: any, protocol: string, peer: Peer): Promise<any>;
    /**
     * Handles incoming ETH message from connected peer
     * @param message message object
     * @param peer peer
     */
    handleEth(message: any, peer: Peer): Promise<void>;
}
//# sourceMappingURL=fullethereumservice.d.ts.map
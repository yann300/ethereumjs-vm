import { EventEmitter } from 'eventemitter3';
import { BoundEthProtocol, BoundSnapProtocol } from '../protocol/index.ts';
import type { BlockHeader } from '@ethereumjs/block';
import type { Config } from '../../config.ts';
import type { BoundProtocol, Protocol, Sender } from '../protocol/index.ts';
import type { Server } from '../server/index.ts';
export interface PeerOptions {
    config: Config;
    id?: string;
    address: string;
    transport: string;
    inbound?: boolean;
    protocols?: Protocol[];
    server?: Server;
}
/**
 * Network peer
 * @memberof module:net/peer
 */
export declare abstract class Peer extends EventEmitter {
    config: Config;
    id: string;
    address: string;
    inbound: boolean;
    server: Server | undefined;
    protected transport: string;
    protected protocols: Protocol[];
    protected boundProtocols: BoundProtocol[];
    private _idle;
    eth?: BoundEthProtocol;
    snap?: BoundSnapProtocol;
    pooled: boolean;
    /**
     * Create new peer
     */
    constructor(options: PeerOptions);
    /**
     * Get idle state of peer
     */
    get idle(): boolean;
    /**
     * Set idle state of peer
     */
    set idle(value: boolean);
    abstract connect(): Promise<void>;
    /**
     * Eventually updates and returns the latest header of peer
     */
    latest(): Promise<BlockHeader | undefined>;
    /**
     * Returns a potential best block header number for the peer
     * (not necessarily verified by block request) derived from
     * either the client-wide sync target height or the last best
     * header timestamp "forward-calculated" by block/slot times (12s).
     */
    getPotentialBestHeaderNum(): bigint;
    /**
     * Handle unhandled messages along handshake
     */
    handleMessageQueue(): void;
    addProtocol(sender: Sender, protocol: Protocol): Promise<void>;
    toString(withFullId?: boolean): string;
}
//# sourceMappingURL=peer.d.ts.map
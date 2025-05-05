import type { EthereumClient } from '../../index.ts';
/**
 * net_* RPC module
 * @memberof module:rpc/modules
 */
export declare class Net {
    private _chain;
    private _client;
    private _peerPool;
    private _rpcDebug;
    /**
     * Create net_* RPC module
     * @param client Client to which the module binds
     */
    constructor(client: EthereumClient, rpcDebug: boolean);
    /**
     * Returns the current network id
     */
    version(): string;
    /**
     * Returns true if client is actively listening for network connections
     */
    listening(): boolean;
    /**
     * Returns number of peers currently connected to the client
     */
    peerCount(): `0x${string}`;
}
//# sourceMappingURL=net.d.ts.map
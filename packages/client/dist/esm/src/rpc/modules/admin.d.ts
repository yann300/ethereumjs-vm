import type { Chain } from '../../blockchain/index.ts';
import type { EthereumClient } from '../../client.ts';
/**
 * admin_* RPC module
 * @memberof module:rpc/modules
 */
export declare class Admin {
    readonly _chain: Chain;
    readonly _client: EthereumClient;
    private _rpcDebug;
    /**
     * Create admin_* RPC module
     * @param client Client to which the module binds
     */
    constructor(client: EthereumClient, rpcDebug: boolean);
    /**
     * Returns information about the currently running node.
     * see for reference: https://geth.ethereum.org/docs/interacting-with-geth/rpc/ns-admin#admin_peers
     */
    nodeInfo(): Promise<{
        name: string;
        enode: string | undefined;
        id: string | undefined;
        ip: string;
        listenAddr: string;
        ports: {
            discovery: number | undefined;
            listener: number | undefined;
        };
        protocols: {
            eth: {
                difficulty: string;
                genesis: `0x${string}`;
                head: `0x${string}`;
                network: string;
            };
        };
    }>;
    /**
     * Returns information about currently connected peers
     * @returns an array of objects containing information about peers (including id, eth protocol versions supported, client name, etc.)
     */
    peers(): Promise<{
        id: string;
        name: string | null;
        protocols: {
            eth: {
                head: `0x${string}`;
                difficulty: any;
                version: number | null;
            };
        };
        caps: string[] | undefined;
        network: {
            remoteAddress: string;
        };
    }[]>;
    /**
     * Attempts to add a peer to client service peer pool using the RLPx server address and port
     * e.g. `.admin_addPeer [{"address": "127.0.0.1", "tcpPort": 30303, "udpPort": 30303}]`
     * @param params An object containing an address, tcpPort, and udpPort for target server to connect to
     */
    addPeer(params: [object]): Promise<boolean>;
}
//# sourceMappingURL=admin.d.ts.map
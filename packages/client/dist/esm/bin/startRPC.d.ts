import type { Server } from 'jayson/promise/index.js';
import type { EthereumClient } from '../src/client.ts';
export type RPCArgs = {
    rpc: boolean;
    rpcAddr: string;
    rpcPort: number;
    ws: boolean;
    wsPort: number;
    wsAddr: string;
    rpcEngine: boolean;
    rpcEngineAddr: string;
    rpcEnginePort: number;
    wsEngineAddr: string;
    wsEnginePort: number;
    rpcDebug: string;
    rpcDebugVerbose: string;
    helpRPC: boolean;
    jwtSecret?: string;
    rpcEngineAuth: boolean;
    rpcCors: string;
};
/**
 * Starts and returns enabled RPCServers
 */
export declare function startRPCServers(client: EthereumClient, args: RPCArgs): Server[];
/**
 * Output RPC help and exit
 */
export declare function helpRPC(): void;
//# sourceMappingURL=startRPC.d.ts.map
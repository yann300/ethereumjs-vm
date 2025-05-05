import jayson from 'jayson/promise/index.js';
import type { IncomingMessage } from 'connect';
import type { Logger } from '../logging.ts';
import type { RPCManager } from '../rpc/index.ts';
type CreateRPCServerOpts = {
    methodConfig: MethodConfig;
    rpcDebug: string;
    rpcDebugVerbose: string;
    logger?: Logger;
};
type CreateRPCServerReturn = {
    server: jayson.Server;
    methods: {
        [key: string]: Function;
    };
    namespaces: string;
};
type CreateRPCServerListenerOpts = {
    RPCCors?: string;
    server: any;
    withEngineMiddleware?: WithEngineMiddleware;
};
type CreateWSServerOpts = CreateRPCServerListenerOpts & {
    httpServer?: jayson.HttpServer;
};
type WithEngineMiddleware = {
    jwtSecret: Uint8Array;
    unlessFn?: (req: IncomingMessage) => boolean;
};
export type MethodConfig = (typeof MethodConfig)[keyof typeof MethodConfig];
export declare const MethodConfig: {
    readonly WithEngine: "withengine";
    readonly WithoutEngine: "withoutengine";
    readonly EngineOnly: "engineonly";
};
/**
 * Internal util to pretty print params for logging.
 */
export declare function inspectParams(params: any, shorten?: number): string;
export declare function createRPCServer(manager: RPCManager, opts: CreateRPCServerOpts): CreateRPCServerReturn;
export declare function createRPCServerListener(opts: CreateRPCServerListenerOpts): jayson.HttpServer;
export declare function createWsRPCServerListener(opts: CreateWSServerOpts): jayson.HttpServer | undefined;
export {};
//# sourceMappingURL=rpc.d.ts.map
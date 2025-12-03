import type { Block, BlockHeader } from '@ethereumjs/block';
import type { MerkleStateManager } from '@ethereumjs/statemanager';
import type { Address } from '@ethereumjs/util';
import type { Multiaddr } from '@multiformats/multiaddr';
import type * as promClient from 'prom-client';
import type { SyncMode } from './index.ts';
import type { Peer } from './net/peer/index.ts';
import type { Server } from './net/server/index.ts';
export type Event = (typeof Event)[keyof typeof Event];
/**
 * Types for the central event bus, emitted
 * by different components of the client.
 */
export declare const Event: {
    readonly CHAIN_UPDATED: "blockchain:chain:updated";
    readonly CLIENT_SHUTDOWN: "client:shutdown";
    readonly SYNC_EXECUTION_VM_ERROR: "sync:execution:vm:error";
    readonly SYNC_FETCHED_BLOCKS: "sync:fetcher:fetched_blocks";
    readonly SYNC_FETCHED_HEADERS: "sync:fetcher:fetched_headers";
    readonly SYNC_SYNCHRONIZED: "sync:synchronized";
    readonly SYNC_ERROR: "sync:error";
    readonly SYNC_FETCHER_ERROR: "sync:fetcher:error";
    readonly SYNC_SNAPSYNC_COMPLETE: "sync:snapsync:complete";
    readonly PEER_CONNECTED: "peer:connected";
    readonly PEER_DISCONNECTED: "peer:disconnected";
    readonly PEER_ERROR: "peer:error";
    readonly SERVER_LISTENING: "server:listening";
    readonly SERVER_ERROR: "server:error";
    readonly POOL_PEER_ADDED: "pool:peer:added";
    readonly POOL_PEER_REMOVED: "pool:peer:removed";
    readonly POOL_PEER_BANNED: "pool:peer:banned";
    readonly PROTOCOL_ERROR: "protocol:error";
    readonly PROTOCOL_MESSAGE: "protocol:message";
};
export interface EventParams {
    [Event.CHAIN_UPDATED]: [];
    [Event.CLIENT_SHUTDOWN]: [];
    [Event.SYNC_EXECUTION_VM_ERROR]: [vmError: Error];
    [Event.SYNC_FETCHED_BLOCKS]: [blocks: Block[]];
    [Event.SYNC_FETCHED_HEADERS]: [headers: BlockHeader[]];
    [Event.SYNC_SYNCHRONIZED]: [chainHeight: bigint];
    [Event.SYNC_SNAPSYNC_COMPLETE]: [stateRoot: Uint8Array, stateManager: MerkleStateManager];
    [Event.SYNC_ERROR]: [syncError: Error];
    [Event.SYNC_FETCHER_ERROR]: [fetchError: Error, task: any, peer: Peer | null | undefined];
    [Event.PEER_CONNECTED]: [connectedPeer: Peer];
    [Event.PEER_DISCONNECTED]: [disconnectedPeer: Peer];
    [Event.PEER_ERROR]: [error: Error, peerCausingError: Peer];
    [Event.SERVER_LISTENING]: [{
        transport: string;
        url: string;
    }];
    [Event.SERVER_ERROR]: [serverError: Error, serverCausingError: Server];
    [Event.POOL_PEER_ADDED]: [addedPeer: Peer];
    [Event.POOL_PEER_REMOVED]: [removedPeer: Peer];
    [Event.POOL_PEER_BANNED]: [bannedPeer: Peer];
    [Event.PROTOCOL_ERROR]: [boundProtocolError: Error, peerCausingError: Peer];
    [Event.PROTOCOL_MESSAGE]: [messageDetails: any, protocolName: string, sendingPeer: Peer];
}
/**
 * Like types
 */
export type Key = Uint8Array;
export type KeyLike = string | Key;
export type MultiaddrLike = string | string[] | Multiaddr | Multiaddr[];
/**
 * DNS
 */
export type DnsNetwork = string;
export interface ClientOpts {
    network?: string;
    chainId?: number;
    networkId?: number;
    sync?: SyncMode;
    dataDir?: string;
    customChain?: string;
    customGenesisState?: string;
    gethGenesis?: string;
    trustedSetup?: string;
    bootnodes?: string | string[];
    port?: number;
    extIP?: string;
    multiaddrs?: string | string[];
    rpc?: boolean;
    rpcPort?: number;
    rpcAddr?: string;
    ws?: boolean;
    wsPort?: number;
    wsAddr?: string;
    rpcEngine?: boolean;
    rpcEnginePort?: number;
    rpcEngineAddr?: string;
    wsEnginePort?: number;
    wsEngineAddr?: string;
    rpcEngineAuth?: boolean;
    jwtSecret?: string;
    helpRPC?: boolean;
    logLevel?: string;
    logFile?: boolean | string;
    logLevelFile?: string;
    logRotate?: boolean;
    logMaxFiles?: number;
    prometheus?: boolean;
    prometheusPort?: number;
    rpcDebug?: string;
    rpcDebugVerbose?: string;
    rpcCors?: string;
    maxPerRequest?: number;
    maxFetcherJobs?: number;
    minPeers?: number;
    maxPeers?: number;
    dnsAddr?: string;
    execution?: boolean;
    numBlocksPerIteration?: number;
    accountCache?: number;
    storageCache?: number;
    codeCache?: number;
    trieCache?: number;
    dnsNetworks?: string[];
    executeBlocks?: string;
    debugCode?: boolean;
    discDns?: boolean;
    discV4?: boolean;
    mine?: boolean;
    unlock?: string;
    dev?: boolean | string;
    minerCoinbase?: Address;
    saveReceipts?: boolean;
    prefixStorageTrieKeys?: boolean;
    snap?: boolean;
    useStringValueTrieDB?: boolean;
    txLookupLimit?: number;
    startBlock?: number;
    isSingleNode?: boolean;
    vmProfileBlocks?: boolean;
    vmProfileTxs?: boolean;
    loadBlocksFromRlp?: string[];
    pruneEngineCache?: boolean;
    savePreimages?: boolean;
    engineNewpayloadMaxExecute?: number;
    skipEngineExec?: boolean;
    useJsCrypto?: boolean;
}
export type PrometheusMetrics = {
    legacyTxGauge: promClient.Gauge<string>;
    accessListEIP2930TxGauge: promClient.Gauge<string>;
    feeMarketEIP1559TxGauge: promClient.Gauge<string>;
    blobEIP4844TxGauge: promClient.Gauge<string>;
    blobEIP7594TxGauge: promClient.Gauge<string>;
};
//# sourceMappingURL=types.d.ts.map
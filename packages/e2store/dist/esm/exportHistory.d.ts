import { Level } from 'level';
import type { BlockBodyBytes } from '@ethereumjs/block';
export type DBTarget = (typeof DBTarget)[keyof typeof DBTarget];
export declare const DBTarget: {
    readonly NumberToHash: 4;
    readonly TotalDifficulty: 5;
    readonly Body: 6;
    readonly Header: 7;
};
export type DBKey = (typeof DBKey)[keyof typeof DBKey];
export declare const DBKey: {
    readonly Receipts: 0;
};
type BlockDB = Level<string | Uint8Array, string | Uint8Array>;
export declare function numberToHash(DB: BlockDB, number: bigint): Promise<Uint8Array>;
export declare function getHeader(DB: BlockDB, hash: Uint8Array, number: bigint): Promise<Uint8Array<ArrayBufferLike>>;
/**
 * Fetches body of a block given its hash and number.
 */
export declare function getBody(DB: BlockDB, blockHash: Uint8Array, blockNumber: bigint): Promise<BlockBodyBytes | undefined>;
export declare function getTotalDifficulty(DB: BlockDB, hash: Uint8Array, number: bigint): Promise<bigint>;
export declare function getBlock(DB: BlockDB, number: bigint): Promise<{
    header: Uint8Array<ArrayBufferLike>;
    body: Uint8Array<ArrayBufferLike>;
}>;
export declare function getBlockReceipts(DB: BlockDB, blockHash: Uint8Array): Promise<Uint8Array>;
export declare function getBlockTuple(chainDB: BlockDB, metaDB: BlockDB, number: bigint): Promise<{
    blockHash: Uint8Array<ArrayBufferLike>;
    header: Uint8Array<ArrayBufferLike>;
    body: Uint8Array<ArrayBufferLike>;
    totalDifficulty: bigint;
    receipts: Uint8Array<ArrayBufferLike>;
}>;
export declare function getBlocks(chainDB: BlockDB, metaDB: BlockDB, start: bigint, number: number): Promise<{
    blockHash: Uint8Array;
    header: Uint8Array;
    body: Uint8Array;
    totalDifficulty: bigint;
    receipts: Uint8Array;
}[]>;
export declare function exportEpochAsEra1(epoch: number, dataDir: string, outputDir?: string, chain?: string): Promise<void>;
export {};
//# sourceMappingURL=exportHistory.d.ts.map
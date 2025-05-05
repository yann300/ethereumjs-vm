/**
 * Format era1 from epoch of history data
 * @param blockTuples header, body, receipts, totalDifficulty
 * @param headerRecords array of Header Records { blockHash: Uint8Array, totalDifficulty: bigint }
 * @param epoch epoch index
 * @returns serialized era1 file
 */
export declare const formatEra1: (blockTuples: {
    header: Uint8Array;
    body: Uint8Array;
    receipts: Uint8Array;
    totalDifficulty: bigint;
}[], headerRecords: {
    blockHash: Uint8Array;
    totalDifficulty: bigint;
}[], epoch: number) => Promise<Uint8Array<ArrayBufferLike>>;
export declare function readBlockTuplesFromERA1(bytes: Uint8Array, count: number, offsets: number[], recordStart: number): AsyncGenerator<{
    headerEntry: import("../types.ts").e2StoreEntry;
    bodyEntry: import("../types.ts").e2StoreEntry;
    receiptsEntry: import("../types.ts").e2StoreEntry;
    totalDifficultyEntry: import("../types.ts").e2StoreEntry;
}, void, unknown>;
export declare function readOtherEntries(bytes: Uint8Array): Promise<{
    accumulatorRoot: Uint8Array<ArrayBufferLike>;
    otherEntries: import("../types.ts").e2StoreEntry[];
}>;
export declare function readAccumulatorRoot(bytes: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
export declare function readERA1(bytes: Uint8Array): Promise<AsyncGenerator<{
    headerEntry: import("../types.ts").e2StoreEntry;
    bodyEntry: import("../types.ts").e2StoreEntry;
    receiptsEntry: import("../types.ts").e2StoreEntry;
    totalDifficultyEntry: import("../types.ts").e2StoreEntry;
}, void, unknown>>;
export declare function getHeaderRecords(bytes: Uint8Array): Promise<{
    blockHash: Uint8Array<ArrayBufferLike>;
    totalDifficulty: any;
}[]>;
export declare function validateERA1(bytes: Uint8Array): Promise<boolean>;
//# sourceMappingURL=era1.d.ts.map
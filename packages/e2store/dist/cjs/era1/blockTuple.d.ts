import { type Block } from '@ethereumjs/block';
import type { e2StoreEntry } from '../index.ts';
export declare function createBlockTuples(blocks: Block[], blockReceipts: Uint8Array[], td: bigint): Promise<{
    headerRecords: {
        blockHash: Uint8Array;
        totalDifficulty: bigint;
    }[];
    blockTuples: {
        header: Uint8Array;
        body: Uint8Array;
        receipts: Uint8Array;
        totalDifficulty: bigint;
    }[];
    totalDifficulty: bigint;
}>;
export declare function parseBlockTuple({ headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry, }: {
    headerEntry: e2StoreEntry;
    bodyEntry: e2StoreEntry;
    receiptsEntry: e2StoreEntry;
    totalDifficultyEntry: e2StoreEntry;
}): Promise<{
    header: any;
    body: any;
    receipts: any;
    totalDifficulty: any;
}>;
export declare function readBlockTupleAtOffset(bytes: Uint8Array, recordStart: number, offset: number): {
    headerEntry: e2StoreEntry;
    bodyEntry: e2StoreEntry;
    receiptsEntry: e2StoreEntry;
    totalDifficultyEntry: e2StoreEntry;
    length: number;
};
export declare function blockFromTuple({ header, body }: {
    header: any;
    body: any;
}): Block;
//# sourceMappingURL=blockTuple.d.ts.map
/**
 * Format E2HS
 * @param data array of block tuples
 * @param epoch epoch index
 * @returns serialized E2HS
 */
export declare const formatE2HS: (data: Array<{
    headerWithProof: Uint8Array;
    body: Uint8Array;
    receipts: Uint8Array;
}>, epoch: number) => Promise<Uint8Array<ArrayBuffer>>;
export declare function readTuplesFromE2HS(bytes: Uint8Array): AsyncGenerator<{
    headerWithProofEntry: import("../types.ts").e2StoreEntry;
    bodyEntry: import("../types.ts").e2StoreEntry;
    receiptsEntry: import("../types.ts").e2StoreEntry;
}, void, unknown>;
export declare function readE2HSTupleAtIndex(bytes: Uint8Array, index: number): Promise<{
    headerWithProofEntry: import("../types.ts").e2StoreEntry;
    bodyEntry: import("../types.ts").e2StoreEntry;
    receiptsEntry: import("../types.ts").e2StoreEntry;
}>;
//# sourceMappingURL=e2hs.d.ts.map
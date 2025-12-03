export declare function getBlockIndex(bytes: Uint8Array): {
    data: Uint8Array<ArrayBufferLike>;
    type: Uint8Array<ArrayBufferLike>;
    count: number;
    recordStart: number;
};
export declare function readBlockIndex(data: Uint8Array, count: number): {
    startingNumber: number;
    offsets: number[];
};
export declare function createBlockIndex(blockTuples: Uint8Array[], startingNumber: bigint): Promise<Uint8Array<ArrayBuffer>>;
//# sourceMappingURL=blockIndex.d.ts.map
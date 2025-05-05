/**
 * Compress data using snappy
 * @param uncompressedData
 * @returns compressed data
 */
export declare function compressData(uncompressedData: Uint8Array): Promise<Uint8Array>;
export declare function decompressData(compressedData: Uint8Array): Promise<Uint8Array<ArrayBufferLike>>;
//# sourceMappingURL=snappy.d.ts.map
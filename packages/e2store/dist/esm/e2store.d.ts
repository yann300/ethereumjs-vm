import type { e2StoreEntry } from './types.ts';
export declare function parseEntry(entry: e2StoreEntry): Promise<{
    type: Uint8Array<ArrayBufferLike>;
    data: number | bigint;
} | {
    type: Uint8Array<ArrayBufferLike>;
    data: Uint8Array<ArrayBufferLike> | import("@ethereumjs/rlp").NestedUint8Array | {
        txs: number | import("@ethereumjs/rlp").NestedUint8Array | Uint8Array<ArrayBufferLike>;
        uncles: number | import("@ethereumjs/rlp").NestedUint8Array | Uint8Array<ArrayBufferLike>;
        withdrawals: number | import("@ethereumjs/rlp").NestedUint8Array | Uint8Array<ArrayBufferLike>;
    };
}>;
/**
 * Reads the first e2Store formatted entry from a string of bytes
 * @param bytes a Uint8Array containing one or more serialized {@link e2StoreEntry}
 * @returns a deserialized {@link e2StoreEntry}
 * @throws if the length of the entry read is greater than the possible number of bytes in the data element
 */
export declare const readEntry: (bytes: Uint8Array) => e2StoreEntry;
/**
 * Format e2store entry
 * @param entry { type: entry type, data: uncompressed data }
 * @returns serialized entry
 */
export declare const formatEntry: ({ type, data, }: {
    type: Uint8Array;
    data: Uint8Array;
}) => Promise<Uint8Array<ArrayBuffer>>;
//# sourceMappingURL=e2store.d.ts.map
import type { NestedUint8Array } from '@ethereumjs/util';
import type { e2StoreEntry } from '../types.ts';
export declare function decompressE2HSTuple({ headerWithProofEntry, bodyEntry, receiptsEntry, }: {
    headerWithProofEntry: e2StoreEntry;
    bodyEntry: e2StoreEntry;
    receiptsEntry: e2StoreEntry;
}): Promise<EncodedBlockTuple>;
export declare function readE2HSTupleAtOffset(bytes: Uint8Array, offset: number): {
    headerWithProofEntry: e2StoreEntry;
    bodyEntry: e2StoreEntry;
    receiptsEntry: e2StoreEntry;
};
export declare const sszHeaderWithProof: import("micro-packed").BytesCoderStream<{
    header: Uint8Array<ArrayBufferLike>;
    proof: Uint8Array<ArrayBufferLike>;
}> & import("micro-packed").BytesCoder<{
    header: Uint8Array<ArrayBufferLike>;
    proof: Uint8Array<ArrayBufferLike>;
}> & {
    default: {
        header: Uint8Array<ArrayBufferLike>;
        proof: Uint8Array<ArrayBufferLike>;
    };
    info: {
        type: string;
    };
    composite: boolean;
    chunkCount: number;
    chunks: (value: {
        header: Uint8Array<ArrayBufferLike>;
        proof: Uint8Array<ArrayBufferLike>;
    }) => Uint8Array[];
    merkleRoot: (value: {
        header: Uint8Array<ArrayBufferLike>;
        proof: Uint8Array<ArrayBufferLike>;
    }) => Uint8Array;
    _isStableCompat: (other: import("micro-eth-signer/ssz").SSZCoder<any>) => boolean;
} & {
    info: {
        type: "container";
        fields: {
            header: import("micro-packed").BytesCoderStream<Uint8Array<ArrayBufferLike>> & import("micro-packed").BytesCoder<Uint8Array<ArrayBufferLike>> & {
                default: Uint8Array<ArrayBufferLike>;
                info: {
                    type: string;
                };
                composite: boolean;
                chunkCount: number;
                chunks: (value: Uint8Array<ArrayBufferLike>) => Uint8Array[];
                merkleRoot: (value: Uint8Array<ArrayBufferLike>) => Uint8Array;
                _isStableCompat: (other: import("micro-eth-signer/ssz").SSZCoder<any>) => boolean;
            } & {
                info: {
                    type: "list";
                    N: number;
                    inner: typeof import("micro-eth-signer/ssz").byte;
                };
            };
            proof: import("micro-packed").BytesCoderStream<Uint8Array<ArrayBufferLike>> & import("micro-packed").BytesCoder<Uint8Array<ArrayBufferLike>> & {
                default: Uint8Array<ArrayBufferLike>;
                info: {
                    type: string;
                };
                composite: boolean;
                chunkCount: number;
                chunks: (value: Uint8Array<ArrayBufferLike>) => Uint8Array[];
                merkleRoot: (value: Uint8Array<ArrayBufferLike>) => Uint8Array;
                _isStableCompat: (other: import("micro-eth-signer/ssz").SSZCoder<any>) => boolean;
            } & {
                info: {
                    type: "list";
                    N: number;
                    inner: typeof import("micro-eth-signer/ssz").byte;
                };
            };
        };
    };
};
type HeaderWithProof = {
    header: Uint8Array;
    proof: Uint8Array;
};
type RawBlockTuple = {
    headerWithProof: HeaderWithProof;
    body: Uint8Array | NestedUint8Array;
    receipts: Uint8Array | NestedUint8Array;
};
type EncodedBlockTuple = {
    headerWithProof: Uint8Array;
    body: Uint8Array;
    receipts: Uint8Array;
};
export declare function parseEH2SBlockTuple(tuple: EncodedBlockTuple): RawBlockTuple;
export {};
//# sourceMappingURL=blockTuple.d.ts.map
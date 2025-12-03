import * as ssz from 'micro-eth-signer/ssz.js';
export type e2StoreEntry = {
    type: Uint8Array;
    data: Uint8Array;
};
export declare const CommonTypes: {
    readonly Version: Uint8Array<ArrayBuffer>;
    readonly BlockIndex: Uint8Array<ArrayBuffer>;
};
/** Era 1 Type Identifiers */
export declare const Era1Types: {
    readonly CompressedHeader: Uint8Array<ArrayBuffer>;
    readonly CompressedBody: Uint8Array<ArrayBuffer>;
    readonly CompressedReceipts: Uint8Array<ArrayBuffer>;
    readonly TotalDifficulty: Uint8Array<ArrayBuffer>;
    readonly AccumulatorRoot: Uint8Array<ArrayBuffer>;
};
export declare const VERSION: {
    type: Uint8Array<ArrayBuffer>;
    data: Uint8Array<ArrayBuffer>;
};
/** Era1 SSZ containers */
export declare const HeaderRecord: ssz.SSZCoder<{
    blockHash: Uint8Array;
    totalDifficulty: bigint;
}>;
export declare const EpochAccumulator: ssz.SSZCoder<Array<{
    blockHash: Uint8Array;
    totalDifficulty: bigint;
}>>;
/** Era Type Identifiers */
export declare const EraTypes: {
    CompressedSignedBeaconBlockType: Uint8Array<ArrayBuffer>;
    CompressedBeaconState: Uint8Array<ArrayBuffer>;
    Empty: Uint8Array<ArrayBuffer>;
    SlotIndex: Uint8Array<ArrayBuffer>;
};
export type SlotIndex = {
    startSlot: number;
    recordStart: number;
    slotOffsets: number[];
};
/**
 * E2HS Type Identifiers
 * Version                     = { type: [0x65, 0x32], data: nil }
 * CompressedHeaderWithProof   = { type: [0x03, 0x01], data: snappyFramed(ssz(header_with_proof)) }
 * CompressedBody              = { type: [0x04, 0x00], data: snappyFramed(rlp(body)) }
 * CompressedReceipts          = { type: [0x05, 0x00], data: snappyFramed(rlp(receipts)) }
 * BlockIndex                  = { type: [0x66, 0x32], data: block-index }
 */
export declare const E2HSTypes: {
    readonly Version: Uint8Array<ArrayBuffer>;
    readonly CompressedHeaderWithProof: Uint8Array<ArrayBuffer>;
    readonly CompressedBody: Uint8Array<ArrayBuffer>;
    readonly CompressedReceipts: Uint8Array<ArrayBuffer>;
    readonly BlockIndex: Uint8Array<ArrayBuffer>;
};
//# sourceMappingURL=types.d.ts.map
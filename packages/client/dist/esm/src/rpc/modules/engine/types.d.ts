import type { Block, ExecutionPayload } from '@ethereumjs/block';
import type { PrefixedHexString } from '@ethereumjs/util';
import type { Skeleton } from '../../../service/index.ts';
export type Status = (typeof Status)[keyof typeof Status];
export declare const Status: {
    readonly ACCEPTED: "ACCEPTED";
    readonly INVALID: "INVALID";
    readonly INVALID_BLOCK_HASH: "INVALID_BLOCK_HASH";
    readonly SYNCING: "SYNCING";
    readonly VALID: "VALID";
};
export type Bytes8 = PrefixedHexString;
export type Bytes20 = PrefixedHexString;
export type Bytes32 = PrefixedHexString;
export type Blob = PrefixedHexString;
export type Bytes48 = PrefixedHexString;
export type Uint64 = PrefixedHexString;
export type Uint256 = PrefixedHexString;
type WithdrawalV1 = Exclude<ExecutionPayload['withdrawals'], undefined>[number];
export type ExecutionPayloadV1 = ExecutionPayload;
export type ExecutionPayloadV2 = ExecutionPayloadV1 & {
    withdrawals: WithdrawalV1[];
};
export type ExecutionPayloadV3 = ExecutionPayloadV2 & {
    excessBlobGas: Uint64;
    blobGasUsed: Uint64;
};
export type ForkchoiceStateV1 = {
    headBlockHash: Bytes32;
    safeBlockHash: Bytes32;
    finalizedBlockHash: Bytes32;
};
export type PayloadAttributes = {
    timestamp: Uint64;
    prevRandao: Bytes32;
    suggestedFeeRecipient: Bytes20;
    withdrawals?: WithdrawalV1[];
    parentBeaconBlockRoot?: Bytes32;
};
export type PayloadAttributesV1 = Omit<PayloadAttributes, 'withdrawals' | 'parentBeaconBlockRoot'>;
export type PayloadAttributesV2 = PayloadAttributesV1 & {
    withdrawals: WithdrawalV1[];
};
export type PayloadAttributesV3 = PayloadAttributesV2 & {
    parentBeaconBlockRoot: Bytes32;
};
export type PayloadStatusV1 = {
    status: Status;
    latestValidHash: Bytes32 | null;
    validationError: string | null;
};
export type ForkchoiceResponseV1 = {
    payloadStatus: PayloadStatusV1;
    payloadId: Bytes8 | null;
};
export type BlobsBundleV1 = {
    commitments: Bytes48[];
    blobs: Blob[];
    proofs: Bytes48[];
};
export type ExecutionPayloadBodyV1 = {
    transactions: string[];
    withdrawals: WithdrawalV1[] | null;
};
export type BlobAndProofV1 = {
    blob: PrefixedHexString;
    proof: PrefixedHexString;
};
export type ChainCache = {
    remoteBlocks: Map<string, Block>;
    executedBlocks: Map<string, Block>;
    invalidBlocks: Map<string, Error>;
    skeleton: Skeleton;
};
export declare const EngineError: {
    UnknownPayload: {
        code: number;
        message: string;
    };
};
export {};
//# sourceMappingURL=types.d.ts.map
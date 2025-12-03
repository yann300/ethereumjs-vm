import type { Block, ExecutionPayload } from '@ethereumjs/block';
import type { CLRequest, CLRequestType } from '@ethereumjs/util';
import type { BlobsBundle } from '../../../../miner/index.ts';
import type { BlobsBundleV1OrV2 } from '../types.ts';
/**
 * Formats a block to {@link ExecutionPayloadV1}.
 */
export declare const blockToExecutionPayload: (block: Block, value: bigint, bundle?: BlobsBundle, requests?: CLRequest<CLRequestType>[]) => {
    executionPayload: ExecutionPayload;
    executionRequests: string[] | undefined;
    blockValue: `0x${string}`;
    blobsBundle: BlobsBundleV1OrV2 | undefined;
    shouldOverrideBuilder: boolean;
};
//# sourceMappingURL=getPayload.d.ts.map
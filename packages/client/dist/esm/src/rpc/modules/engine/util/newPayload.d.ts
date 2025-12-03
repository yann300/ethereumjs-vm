import type { Block, ExecutionPayload } from '@ethereumjs/block';
import type { Common } from '@ethereumjs/common';
import type { PrefixedHexString } from '@ethereumjs/util';
import type { Chain } from '../../../../blockchain/index.ts';
import type { ChainCache, PayloadStatusV1 } from '../types.ts';
type CLData = {
    parentBeaconBlockRoot?: PrefixedHexString;
    blobVersionedHashes?: PrefixedHexString[];
    executionRequests?: PrefixedHexString[];
};
export declare const validate4844BlobVersionedHashes: (headBlock: Block, blobVersionedHashes: PrefixedHexString[]) => string | null;
export declare const validateAndGen7685RequestsHash: (common: Common, executionRequests: PrefixedHexString[]) => PrefixedHexString;
/**
 * Returns a block from a payload.
 * If errors, returns {@link PayloadStatusV1}
 */
export declare const assembleBlock: (payload: Omit<ExecutionPayload, "requestsHash" | "parentBeaconBlockRoot">, clValidationData: CLData, chain: Chain, chainCache: ChainCache) => Promise<{
    block?: Block;
    error?: PayloadStatusV1;
}>;
export {};
//# sourceMappingURL=newPayload.d.ts.map
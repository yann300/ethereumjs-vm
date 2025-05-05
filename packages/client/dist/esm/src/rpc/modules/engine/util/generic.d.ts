import { Block } from '@ethereumjs/block';
import { type ChainCache } from '../types.ts';
import type { Common, Hardfork } from '@ethereumjs/common';
import type { PrefixedHexString } from '@ethereumjs/util';
import type { Chain } from '../../../../blockchain/index.ts';
/**
 * Recursively finds parent blocks starting from the parentHash.
 */
export declare const recursivelyFindParents: (vmHeadHash: Uint8Array, parentHash: Uint8Array, chain: Chain) => Promise<Block[]>;
/**
 * Returns the block hash as a 0x-prefixed hex string if found valid in the blockchain, otherwise returns null.
 */
export declare const validExecutedChainBlock: (blockOrHash: Uint8Array | Block, chain: Chain) => Promise<Block | null>;
/**
 * Returns the block hash as a 0x-prefixed hex string if found valid in the blockchain, otherwise returns null.
 */
export declare const validHash: (hash: Uint8Array, chain: Chain, chainCache: ChainCache) => Promise<PrefixedHexString | null>;
export declare function validateHardforkRange(chainCommon: Common, methodVersion: number, checkNotBeforeHf: Hardfork | null, checkNotAfterHf: Hardfork | null, timestamp: bigint): void;
//# sourceMappingURL=generic.d.ts.map
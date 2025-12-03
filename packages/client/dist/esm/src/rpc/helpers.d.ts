import type { Block } from '@ethereumjs/block';
import type { JSONRPCTx, TypedTransaction } from '@ethereumjs/tx';
import type { Chain } from '../blockchain/index.ts';
import type { RPCMethod } from './types.ts';
export declare function callWithStackTrace(handler: Function, debug: boolean): RPCMethod;
/**
 * Returns tx formatted to the standard JSON-RPC fields
 */
export declare const toJSONRPCTx: (tx: TypedTransaction, block?: Block, txIndex?: number) => JSONRPCTx;
/**
 * Get block by option
 */
export declare const getBlockByOption: (blockOpt: string, chain: Chain) => Promise<Block>;
//# sourceMappingURL=helpers.d.ts.map
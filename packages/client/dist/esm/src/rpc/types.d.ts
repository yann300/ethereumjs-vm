import type { PrefixedHexString } from '@ethereumjs/util';
export interface RPCTx {
    from?: PrefixedHexString;
    to?: PrefixedHexString;
    gas?: PrefixedHexString;
    gasPrice?: PrefixedHexString;
    value?: PrefixedHexString;
    data?: PrefixedHexString;
    input?: PrefixedHexString;
    maxPriorityFeePerGas?: PrefixedHexString;
    maxFeePerGas?: PrefixedHexString;
    type?: PrefixedHexString;
}
export interface RPCTxRes {
    from: PrefixedHexString;
    to?: PrefixedHexString;
    gas: PrefixedHexString;
    gasPrice: PrefixedHexString;
    value: PrefixedHexString;
    input?: PrefixedHexString;
    data?: PrefixedHexString;
    maxPriorityFeePerGas: PrefixedHexString;
    maxFeePerGas: PrefixedHexString;
    type: PrefixedHexString;
}
/**
 * Convert the return value from eth_getTransactionByHash to a {@link RPCTx} interface
 */
export type TxResult = Record<string, string> & RPCTxRes;
export declare function toRPCTx(t: TxResult): RPCTx;
export type RPCMethod = (...params: any) => any;
//# sourceMappingURL=types.d.ts.map
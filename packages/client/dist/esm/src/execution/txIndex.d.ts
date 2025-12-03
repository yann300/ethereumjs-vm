import { MetaDBManager } from '../util/metaDBManager.ts';
export type TxHashIndex = [blockHash: Uint8Array, txIndex: number];
export type IndexType = (typeof IndexType)[keyof typeof IndexType];
export declare const IndexType: {
    readonly TxHash: "txhash";
};
export type IndexOperation = (typeof IndexOperation)[keyof typeof IndexOperation];
export declare const IndexOperation: {
    readonly Save: "save";
    readonly Delete: "delete";
};
export type rlpTxHash = [blockHash: Uint8Array, txIndex: Uint8Array];
export declare class TxIndex extends MetaDBManager {
    private rlpEncode;
    private rlpDecode;
    updateIndex(operation: IndexOperation, type: IndexType, value: any): Promise<void>;
    /**
     * Returns the value for an index or null if not found
     * @param value for {@link IndexType.TxHash}, the txHash to get
     */
    getIndex(value: Uint8Array): Promise<TxHashIndex | null>;
}
//# sourceMappingURL=txIndex.d.ts.map
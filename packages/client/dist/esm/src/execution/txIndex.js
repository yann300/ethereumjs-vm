import { RLP } from '@ethereumjs/rlp';
import { BIGINT_0, bytesToInt, intToBytes } from '@ethereumjs/util';
import { DBKey, MetaDBManager } from "../util/metaDBManager.js";
export const IndexType = {
    TxHash: 'txhash',
};
export const IndexOperation = {
    Save: 'save',
    Delete: 'delete',
};
export class TxIndex extends MetaDBManager {
    rlpEncode(value) {
        const [blockHash, txIndex] = value;
        return RLP.encode([blockHash, intToBytes(txIndex)]);
    }
    rlpDecode(value) {
        const [blockHash, txIndex] = RLP.decode(value);
        return [blockHash, bytesToInt(txIndex)];
    }
    async updateIndex(operation, type, value) {
        switch (type) {
            case IndexType.TxHash: {
                const block = value;
                if (operation === IndexOperation.Save) {
                    const withinTxLookupLimit = this.config.txLookupLimit === 0 ||
                        this.chain.headers.height - BigInt(this.config.txLookupLimit) < block.header.number;
                    if (withinTxLookupLimit) {
                        for (const [i, tx] of block.transactions.entries()) {
                            const index = [block.hash(), i];
                            const encoded = this.rlpEncode(index);
                            await this.put(DBKey.TxHash, tx.hash(), encoded);
                        }
                    }
                    if (this.config.txLookupLimit > 0) {
                        // Remove tx hashes for one block past txLookupLimit
                        const limit = this.chain.headers.height - BigInt(this.config.txLookupLimit);
                        if (limit < BIGINT_0)
                            return;
                        const blockDelIndexes = await this.chain.getBlock(limit);
                        void this.updateIndex(IndexOperation.Delete, IndexType.TxHash, blockDelIndexes);
                    }
                }
                else if (operation === IndexOperation.Delete) {
                    for (const tx of block.transactions) {
                        await this.delete(DBKey.TxHash, tx.hash());
                    }
                }
                break;
            }
        }
    }
    /**
     * Returns the value for an index or null if not found
     * @param value for {@link IndexType.TxHash}, the txHash to get
     */
    async getIndex(value) {
        const encoded = await this.get(DBKey.TxHash, value);
        if (encoded === null)
            return null;
        return this.rlpDecode(encoded);
    }
}
//# sourceMappingURL=txIndex.js.map
import { RLP } from '@ethereumjs/rlp';
import { EthereumJSErrorWithoutCode, bigIntToBytes, bytesToBigInt, bytesToInt, equalsBytes, intToBytes, utf8ToBytes, } from '@ethereumjs/util';
import { Bloom } from '@ethereumjs/vm';
import { DBKey, MetaDBManager } from "../util/metaDBManager.js";
export const RlpConvert = {
    Encode: 'encode',
    Decode: 'decode',
};
export const RlpType = {
    Receipts: 'receipts',
    Logs: 'logs',
};
export class ReceiptsManager extends MetaDBManager {
    constructor() {
        super(...arguments);
        /**
         * Limit of logs to return in getLogs
         */
        this.GET_LOGS_LIMIT = 10000;
        /**
         * Size limit for the getLogs response in megabytes
         */
        this.GET_LOGS_LIMIT_MEGABYTES = 150;
        /**
         * Block range limit for getLogs
         */
        this.GET_LOGS_BLOCK_RANGE_LIMIT = 2500;
    }
    /**
     * Saves receipts to db. Also saves tx hash indexes if within txLookupLimit,
     * and removes tx hash indexes for one block past txLookupLimit.
     * @param block the block to save receipts for
     * @param receipts the receipts to save
     */
    async saveReceipts(block, receipts) {
        const encoded = this.rlp(RlpConvert.Encode, RlpType.Receipts, receipts);
        await this.put(DBKey.Receipts, block.hash(), encoded);
    }
    async deleteReceipts(block) {
        await this.delete(DBKey.Receipts, block.hash());
    }
    async getReceipts(blockHash, calcBloom = false, includeTxType = false) {
        const encoded = await this.get(DBKey.Receipts, blockHash);
        if (!encoded)
            return [];
        let receipts = this.rlp(RlpConvert.Decode, RlpType.Receipts, encoded);
        if (calcBloom) {
            receipts = receipts.map((r) => {
                r.bitvector = this.logsBloom(r.logs).bitvector;
                return r;
            });
        }
        if (includeTxType) {
            const block = await this.chain.getBlock(blockHash);
            receipts = receipts.map((r, i) => {
                r.txType = block.transactions[i].type;
                return r;
            });
        }
        return receipts;
    }
    /**
     * Returns receipt by tx hash with additional metadata for the JSON RPC response, or null if not found
     * @param txHash the tx hash
     */
    async getReceiptByTxHashIndex(txHashIndex) {
        const [blockHash, txIndex] = txHashIndex;
        const receipts = await this.getReceipts(blockHash);
        if (receipts.length === 0)
            return null;
        let logIndex = 0;
        receipts.slice(0, txIndex).map((r) => (logIndex += r.logs.length));
        const receipt = receipts[txIndex];
        receipt.bitvector = this.logsBloom(receipt.logs).bitvector;
        return [receipt, blockHash, txIndex, logIndex];
    }
    /**
     * Returns logs as specified by the eth_getLogs JSON RPC query parameters
     */
    async getLogs(from, to, addresses, topics = []) {
        const returnedLogs = [];
        let returnedLogsSize = 0;
        for (let i = from.header.number; i <= to.header.number; i++) {
            const block = await this.chain.getBlock(i);
            const receipts = await this.getReceipts(block.hash());
            if (receipts.length === 0)
                continue;
            let logs = [];
            let logIndex = 0;
            for (const [receiptIndex, receipt] of receipts.entries()) {
                logs.push(...receipt.logs.map((log) => ({
                    log,
                    block,
                    tx: block.transactions[receiptIndex],
                    txIndex: receiptIndex,
                    logIndex: logIndex++,
                })));
            }
            if (addresses && addresses.length > 0) {
                logs = logs.filter((l) => addresses.some((a) => equalsBytes(a, l.log[0])));
            }
            if (topics.length > 0) {
                // From https://ethereum.org/en/developers/docs/apis/json-rpc/#eth_newfilter/:
                // Topics are order-dependent. A transaction with a log with topics
                // [A, B] will be matched by the following topic filters:
                //  * [] - anything
                //  * [A] - A in first position (and anything after)
                //  * [null, B] - anything in first position AND B in second position (and anything after)
                //  * [A, B] - A in first position AND B in second position (and anything after)
                //  * [[A, B], [A, B]] - (A OR B) in first position AND (A OR B) in second position (and anything after)
                // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                logs = logs.filter((l) => {
                    for (const [i, topic] of topics.entries()) {
                        if (Array.isArray(topic)) {
                            // Can match any items in this array
                            if (!topic.find((t) => equalsBytes(t, l.log[1][i])))
                                return false;
                        }
                        else if (!topic) {
                            // If null then can match any
                        }
                        else {
                            // If a value is specified then it must match
                            if (!equalsBytes(topic, l.log[1][i]))
                                return false;
                        }
                        return true;
                    }
                });
            }
            returnedLogs.push(...logs);
            returnedLogsSize += utf8ToBytes(JSON.stringify(logs)).byteLength;
            if (returnedLogs.length >= this.GET_LOGS_LIMIT ||
                returnedLogsSize >= this.GET_LOGS_LIMIT_MEGABYTES * 1048576) {
                break;
            }
        }
        return returnedLogs;
    }
    rlp(conversion, type, value) {
        switch (type) {
            case RlpType.Receipts:
                if (conversion === RlpConvert.Encode) {
                    value = value;
                    return RLP.encode(value.map((r) => [
                        r.stateRoot ??
                            intToBytes(r.status),
                        bigIntToBytes(r.cumulativeBlockGasUsed),
                        this.rlp(RlpConvert.Encode, RlpType.Logs, r.logs),
                    ]));
                }
                else {
                    const decoded = RLP.decode(value);
                    return decoded.map((r) => {
                        const gasUsed = r[1];
                        const logs = this.rlp(RlpConvert.Decode, RlpType.Logs, r[2]);
                        if (r[0].length === 32) {
                            // Pre-Byzantium Receipt
                            return {
                                stateRoot: r[0],
                                cumulativeBlockGasUsed: bytesToBigInt(gasUsed),
                                logs,
                            };
                        }
                        else {
                            // Post-Byzantium Receipt
                            return {
                                status: bytesToInt(r[0]),
                                cumulativeBlockGasUsed: bytesToBigInt(gasUsed),
                                logs,
                            };
                        }
                    });
                }
            case RlpType.Logs:
                if (conversion === RlpConvert.Encode) {
                    return RLP.encode(value);
                }
                else {
                    return RLP.decode(value);
                }
            default:
                throw EthereumJSErrorWithoutCode('Unknown rlp conversion');
        }
    }
    /**
     * Returns the logs bloom for a receipt's logs
     * @param logs
     */
    logsBloom(logs) {
        const bloom = new Bloom();
        for (let i = 0; i < logs.length; i++) {
            const log = logs[i];
            // add the address
            bloom.add(log[0]);
            // add the topics
            const topics = log[1];
            for (let q = 0; q < topics.length; q++) {
                bloom.add(topics[q]);
            }
        }
        return bloom;
    }
}
//# sourceMappingURL=receipt.js.map
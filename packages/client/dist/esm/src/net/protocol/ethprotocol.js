import { createBlockFromBytesArray, createBlockHeaderFromBytesArray } from '@ethereumjs/block';
import { RLP } from '@ethereumjs/rlp';
import { Blob4844Tx, createBlob4844TxFromSerializedNetworkWrapper, createTxFromBlockBodyData, createTxFromRLP, isAccessList2930Tx, isBlob4844Tx, isEOACode7702Tx, isFeeMarket1559Tx, isLegacyTx, } from '@ethereumjs/tx';
import { BIGINT_0, EthereumJSErrorWithoutCode, bigIntToUnpaddedBytes, bytesToBigInt, bytesToHex, bytesToInt, hexToBytes, intToUnpaddedBytes, isNestedUint8Array, } from '@ethereumjs/util';
import { encodeReceipt } from '@ethereumjs/vm';
import { Protocol } from "./protocol.js";
function exhaustiveTypeGuard(_value, errorMsg) {
    throw EthereumJSErrorWithoutCode(errorMsg);
}
/**
 * Implements eth/66 protocol
 * @memberof module:net/protocol
 */
export class EthProtocol extends Protocol {
    /**
     * Create eth protocol
     */
    constructor(options) {
        super(options);
        this.nextReqId = BIGINT_0;
        this.protocolMessages = [
            {
                name: 'NewBlockHashes',
                code: 0x01,
                encode: (hashes) => hashes.map((hn) => [hn[0], bigIntToUnpaddedBytes(hn[1])]),
                decode: (hashes) => hashes.map((hn) => [hn[0], bytesToBigInt(hn[1])]),
            },
            {
                name: 'Transactions',
                code: 0x02,
                encode: (txs) => {
                    const serializedTxs = [];
                    for (const tx of txs) {
                        // Don't automatically broadcast blob transactions - they should only be announced using NewPooledTransactionHashes
                        if (tx instanceof Blob4844Tx)
                            continue;
                        serializedTxs.push(tx.serialize());
                    }
                    return serializedTxs;
                },
                decode: (txs) => {
                    if (!this.config.synchronized)
                        return;
                    const common = this.config.chainCommon.copy();
                    common.setHardforkBy({
                        blockNumber: this.chain.headers.latest?.number ?? // Use latest header number if available OR
                            this.config.syncTargetHeight ?? // Use sync target height if available OR
                            common.hardforkBlock(common.hardfork()) ?? // Use current hardfork block number OR
                            BIGINT_0, // Use chainstart,
                        timestamp: this.chain.headers.latest?.timestamp ?? Math.floor(Date.now() / 1000),
                    });
                    return txs.map((txData) => createTxFromRLP(txData, { common }));
                },
            },
            {
                name: 'GetBlockHeaders',
                code: 0x03,
                response: 0x04,
                encode: ({ reqId, block, max, skip = 0, reverse = false }) => [
                    bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                    [
                        typeof block === 'bigint' ? bigIntToUnpaddedBytes(block) : block,
                        intToUnpaddedBytes(max),
                        intToUnpaddedBytes(skip),
                        intToUnpaddedBytes(!reverse ? 0 : 1),
                    ],
                ],
                decode: ([reqId, [block, max, skip, reverse]]) => ({
                    reqId: bytesToBigInt(reqId),
                    block: block.length === 32 ? block : bytesToBigInt(block),
                    max: bytesToInt(max),
                    skip: bytesToInt(skip),
                    reverse: bytesToInt(reverse) === 0 ? false : true,
                }),
            },
            {
                name: 'BlockHeaders',
                code: 0x04,
                encode: ({ reqId, headers }) => [
                    bigIntToUnpaddedBytes(reqId),
                    headers.map((h) => h.raw()),
                ],
                decode: ([reqId, headers]) => [
                    bytesToBigInt(reqId),
                    headers.map((h) => {
                        const common = this.config.chainCommon;
                        const header = createBlockHeaderFromBytesArray(h, { common, setHardfork: true });
                        return header;
                    }),
                ],
            },
            {
                name: 'GetBlockBodies',
                code: 0x05,
                response: 0x06,
                encode: ({ reqId, hashes }) => [
                    bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                    hashes,
                ],
                decode: ([reqId, hashes]) => ({
                    reqId: bytesToBigInt(reqId),
                    hashes,
                }),
            },
            {
                name: 'BlockBodies',
                code: 0x06,
                encode: ({ reqId, bodies }) => [
                    bigIntToUnpaddedBytes(reqId),
                    bodies,
                ],
                decode: ([reqId, bodies]) => [bytesToBigInt(reqId), bodies],
            },
            {
                name: 'NewBlock',
                code: 0x07,
                encode: ([block, td]) => [block.raw(), bigIntToUnpaddedBytes(td)],
                decode: ([block, td]) => [
                    createBlockFromBytesArray(block, {
                        common: this.config.chainCommon,
                        setHardfork: true,
                    }),
                    td,
                ],
            },
            {
                name: 'NewPooledTransactionHashes',
                code: 0x08,
                // If eth protocol is eth/68, the parameter list for `NewPooledTransactionHashes` changes from
                // `hashes: Uint8Array[]` to an tuple of arrays of `types, sizes, hashes`, where types corresponds to the
                // transaction type, sizes is the size of each encoded transaction in bytes, and the transaction hashes
                encode: (params) => {
                    return isNestedUint8Array(params) === true
                        ? params
                        : [
                            bytesToHex(new Uint8Array(params[0])), // This matches the Geth implementation of this parameter (which is currently different than the spec)
                            params[1],
                            params[2],
                        ];
                },
                decode: (params) => {
                    if (isNestedUint8Array(params) === true) {
                        return params;
                    }
                    else {
                        const [types, sizes, hashes] = params;
                        return [hexToBytes(types), sizes.map((size) => BigInt(size)), hashes];
                    }
                },
            },
            {
                name: 'GetPooledTransactions',
                code: 0x09,
                response: 0x0a,
                encode: ({ reqId, hashes }) => [
                    bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                    hashes,
                ],
                decode: ([reqId, hashes]) => ({
                    reqId: bytesToBigInt(reqId),
                    hashes,
                }),
            },
            {
                name: 'PooledTransactions',
                code: 0x0a,
                encode: ({ reqId, txs }) => {
                    const serializedTxs = [];
                    for (const tx of txs) {
                        // serialize txs as per type
                        if (isBlob4844Tx(tx)) {
                            serializedTxs.push(tx.serializeNetworkWrapper());
                        }
                        else if (isFeeMarket1559Tx(tx) || isAccessList2930Tx(tx) || isEOACode7702Tx(tx)) {
                            serializedTxs.push(tx.serialize());
                        }
                        else if (isLegacyTx(tx)) {
                            serializedTxs.push(tx.raw());
                        }
                        else {
                            // Dual use for this typeguard:
                            // 1. to enable typescript to throw build errors if any tx is missing above
                            // 2. to throw error in runtime if some corruption happens
                            exhaustiveTypeGuard(tx, `Invalid transaction type=${tx.type}`);
                        }
                    }
                    return [bigIntToUnpaddedBytes(reqId), serializedTxs];
                },
                decode: ([reqId, txs]) => {
                    const common = this.config.chainCommon.copy();
                    common.setHardforkBy({
                        blockNumber: this.chain.headers.latest?.number ?? // Use latest header number if available OR
                            this.config.syncTargetHeight ?? // Use sync target height if available OR
                            common.hardforkBlock(common.hardfork()) ?? // Use current hardfork block number OR
                            BIGINT_0, // Use chainstart,
                        timestamp: this.chain.headers.latest?.timestamp ?? Math.floor(Date.now() / 1000),
                    });
                    return [
                        bytesToBigInt(reqId),
                        txs.map((txData) => {
                            // Blob transactions are deserialized with network wrapper
                            if (txData[0] === 3) {
                                return createBlob4844TxFromSerializedNetworkWrapper(txData, { common });
                            }
                            else {
                                return createTxFromBlockBodyData(txData, { common });
                            }
                        }),
                    ];
                },
            },
            {
                name: 'GetReceipts',
                code: 0x0f,
                response: 0x10,
                encode: ({ reqId, hashes }) => [
                    bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                    hashes,
                ],
                decode: ([reqId, hashes]) => ({
                    reqId: bytesToBigInt(reqId),
                    hashes,
                }),
            },
            {
                name: 'Receipts',
                code: 0x10,
                encode: ({ reqId, receipts }) => {
                    const serializedReceipts = [];
                    for (const receipt of receipts) {
                        const encodedReceipt = encodeReceipt(receipt, receipt.txType);
                        serializedReceipts.push(encodedReceipt);
                    }
                    return [bigIntToUnpaddedBytes(reqId), serializedReceipts];
                },
                decode: ([reqId, receipts]) => [
                    bytesToBigInt(reqId),
                    receipts.map((r) => {
                        // Legacy receipt if r[0] >= 0xc0, otherwise typed receipt with first byte as TransactionType
                        const decoded = RLP.decode(r[0] >= 0xc0 ? r : r.subarray(1));
                        const [stateRootOrStatus, cumulativeGasUsed, logsBloom, logs] = decoded;
                        const receipt = {
                            cumulativeBlockGasUsed: bytesToBigInt(cumulativeGasUsed),
                            bitvector: logsBloom,
                            logs,
                        };
                        if (stateRootOrStatus.length === 32) {
                            ;
                            receipt.stateRoot = stateRootOrStatus;
                        }
                        else {
                            ;
                            receipt.status = bytesToInt(stateRootOrStatus);
                        }
                        return receipt;
                    }),
                ],
            },
        ];
        this.chain = options.chain;
    }
    /**
     * Name of protocol
     */
    get name() {
        return 'eth';
    }
    /**
     * Protocol versions supported
     */
    get versions() {
        return [66, 67, 68];
    }
    /**
     * Messages defined by this protocol
     */
    get messages() {
        return this.protocolMessages;
    }
    /**
     * Opens protocol and any associated dependencies
     */
    async open() {
        if (this.opened) {
            return false;
        }
        await this.chain.open();
        this.opened = true;
    }
    /**
     * Encodes status into ETH status message payload
     */
    encodeStatus() {
        return {
            chainId: bigIntToUnpaddedBytes(this.chain.chainId),
            td: bigIntToUnpaddedBytes(this.chain.blocks.td),
            bestHash: this.chain.blocks.latest.hash(),
            genesisHash: this.chain.genesis.hash(),
            latestBlock: bigIntToUnpaddedBytes(this.chain.blocks.latest.header.number),
        };
    }
    /**
     * Decodes ETH status message payload into a status object
     * @param status status message payload
     */
    decodeStatus(status) {
        return {
            chainId: bytesToBigInt(status.chainId),
            td: bytesToBigInt(status.td),
            bestHash: status.bestHash,
            genesisHash: status.genesisHash,
        };
    }
}
//# sourceMappingURL=ethprotocol.js.map
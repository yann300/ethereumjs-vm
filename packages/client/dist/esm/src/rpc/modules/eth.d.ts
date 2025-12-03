import type { JSONRPCBlock } from '@ethereumjs/block';
import type { Proof } from '@ethereumjs/statemanager';
import type { PrefixedHexString } from '@ethereumjs/util';
import type { EthereumClient } from '../../index.ts';
import type { RPCTx } from '../types.ts';
type GetLogsParams = {
    fromBlock?: string;
    toBlock?: string;
    address?: PrefixedHexString;
    topics?: PrefixedHexString[];
    blockHash?: PrefixedHexString;
};
type JSONRPCReceipt = {
    transactionHash: string;
    transactionIndex: string;
    blockHash: string;
    blockNumber: string;
    from: string;
    to: string | null;
    cumulativeGasUsed: string;
    effectiveGasPrice: string;
    gasUsed: string;
    contractAddress: string | null;
    logs: JSONRPCLog[];
    logsBloom: string;
    root?: string;
    status?: string;
    blobGasUsed?: string;
    blobGasPrice?: string;
    type: string;
};
type JSONRPCLog = {
    removed: boolean;
    logIndex: string | null;
    transactionIndex: string | null;
    transactionHash: string | null;
    blockHash: string | null;
    blockNumber: string | null;
    blockTimestamp: string | null;
    address: string;
    data: string;
    topics: string[];
};
/**
 * eth_* RPC module
 * @memberof module:rpc/modules
 */
export declare class Eth {
    private client;
    private service;
    private receiptsManager;
    private txIndex;
    private _chain;
    private _vm;
    private _rpcDebug;
    ethVersion: number;
    /**
     * Create eth_* RPC module
     * @param client Client to which the module binds
     */
    constructor(client: EthereumClient, rpcDebug: boolean);
    /**
     * Returns number of the most recent block.
     */
    blockNumber(): Promise<`0x${string}`>;
    /**
     * Executes a new message call immediately without creating a transaction on the block chain.
     * @param params An array of two parameters:
     *   1. The transaction object
     *       * from (optional) - The address the transaction is sent from
     *       * to - The address the transaction is directed to
     *       * gas (optional) - Integer of the gas provided for the transaction execution
     *       * gasPrice (optional) - Integer of the gasPrice used for each paid gas
     *       * value (optional) - Integer of the value sent with this transaction
     *       * data (optional) - Hash of the method signature and encoded parameters.
     *   2. integer block number, or the string "latest", "earliest" or "pending"
     * @returns The return value of the executed contract.
     */
    call(params: [RPCTx, string]): Promise<`0x${string}`>;
    /**
     * Returns the currently configured chain id, a value used in replay-protected transaction signing as introduced by EIP-155.
     * @returns The chain ID.
     */
    chainId(): Promise<`0x${string}`>;
    /**
     * Returns an estimate for max priority fee per gas for a tx to be included in a block.
     * @returns The max priority fee per gas.
     */
    maxPriorityFeePerGas(): Promise<`0x${string}`>;
    /**
     * Generates and returns an estimate of how much gas is necessary to allow the transaction to complete.
     * The transaction will not be added to the blockchain.
     * Note that the estimate may be significantly more than the amount of gas actually used by the transaction,
     * for a variety of reasons including EVM mechanics and node performance.
     * @param params An array of two parameters:
     *   1. The transaction object
     *       * from (optional) - The address the transaction is sent from
     *       * to - The address the transaction is directed to
     *       * gas (optional) - Integer of the gas provided for the transaction execution
     *       * gasPrice (optional) - Integer of the gasPrice used for each paid gas
     *       * value (optional) - Integer of the value sent with this transaction
     *       * data (optional) - Hash of the method signature and encoded parameters.
     *   2. integer block number, or the string "latest", "earliest" or "pending" (optional)
     * @returns The amount of gas used.
     */
    estimateGas(params: [RPCTx, string?]): Promise<string>;
    /**
     * Returns the balance of the account at the given address.
     * @param params An array of two parameters:
     *   1. address of the account
     *   2. integer block number, or the string "latest", "earliest" or "pending"
     */
    getBalance(params: [string, string]): Promise<`0x${string}`>;
    /**
     * Returns the currently configured coinbase address.
     * @returns The chain ID.
     */
    coinbase(): Promise<`0x${string}`>;
    /**
     * Returns information about a block by hash.
     * @param params An array of two parameters:
     *   1. a block hash
     *   2. boolean - if true returns the full transaction objects, if false only the hashes of the transactions.
     */
    getBlockByHash(params: [PrefixedHexString, boolean]): Promise<JSONRPCBlock | null>;
    /**
     * Returns information about a block by block number.
     * @param params An array of two parameters:
     *   1. integer of a block number, or the string "latest", "earliest" or "pending"
     *   2. boolean - if true returns the full transaction objects, if false only the hashes of the transactions.
     */
    getBlockByNumber(params: [string, boolean]): Promise<JSONRPCBlock | null>;
    /**
     * Returns the transaction count for a block given by the block hash.
     * @param params An array of one parameter: A block hash
     */
    getBlockTransactionCountByHash(params: [PrefixedHexString]): Promise<`0x${string}`>;
    /**
     * Returns code of the account at the given address.
     * @param params An array of two parameters:
     *   1. address of the account
     *   2. integer block number, or the string "latest", "earliest" or "pending"
     */
    getCode(params: [string, string]): Promise<`0x${string}`>;
    /**
     * Returns the value from a storage position at a given address.
     * @param params An array of three parameters:
     *   1. address of the storage
     *   2. integer of the position in the storage
     *   3. integer block number, or the string "latest", "earliest" or "pending"
     */
    getStorageAt(params: [string, PrefixedHexString, string]): Promise<string>;
    /**
     * Returns information about a transaction given a block hash and a transaction's index position.
     * @param params An array of two parameter:
     *   1. a block hash
     *   2. an integer of the transaction index position encoded as a hexadecimal.
     */
    getTransactionByBlockHashAndIndex(params: [PrefixedHexString, string]): Promise<import("@ethereumjs/tx").JSONRPCTx | null>;
    /**
     * Returns information about a transaction given a block hash and a transaction's index position.
     * @param params An array of two parameter:
     *   1. a block number
     *   2. an integer of the transaction index position encoded as a hexadecimal.
     */
    getTransactionByBlockNumberAndIndex(params: [PrefixedHexString, string]): Promise<import("@ethereumjs/tx").JSONRPCTx | null>;
    /**
     * Returns the transaction by hash when available within `--txLookupLimit`
     * @param params An array of one parameter:
     *   1. hash of the transaction
     */
    getTransactionByHash(params: [PrefixedHexString]): Promise<import("@ethereumjs/tx").JSONRPCTx | null>;
    /**
     * Returns the number of transactions sent from an address.
     * @param params An array of two parameters:
     *   1. address of the account
     *   2. integer block number, or the string "latest", "earliest" or "pending"
     */
    getTransactionCount(params: [string, string]): Promise<`0x${string}`>;
    /**
     * Returns the current ethereum protocol version as a hex-encoded string
     */
    protocolVersion(): `0x${string}`;
    /**
     * Returns the number of uncles in a block from a block matching the given block number
     * @param params An array of one parameter:
     *   1: hexadecimal representation of a block number
     */
    getUncleCountByBlockNumber(params: [string]): Promise<number>;
    getBlockReceipts(params: [string]): Promise<JSONRPCReceipt[] | null>;
    /**
     * Returns the receipt of a transaction by transaction hash.
     * *Note* That the receipt is not available for pending transactions.
     * Only available with `--saveReceipts` enabled
     * Will return empty if tx is past set `--txLookupLimit`
     * (default = 2350000 = about one year, 0 = entire chain)
     * @param params An array of one parameter:
     *  1: Transaction hash
     */
    getTransactionReceipt(params: [PrefixedHexString]): Promise<JSONRPCReceipt | null>;
    /**
     * Returns an array of all logs matching a given filter object.
     * Only available with `--saveReceipts` enabled
     * @param params An object of the filter options {@link GetLogsParams}
     */
    getLogs(params: [GetLogsParams]): Promise<JSONRPCLog[]>;
    /**
     * Creates new message call transaction or a contract creation for signed transactions.
     * @param params An array of one parameter:
     *   1. the signed transaction data
     * @returns a 32-byte tx hash or the zero hash if the tx is not yet available.
     */
    sendRawTransaction(params: [PrefixedHexString]): Promise<`0x${string}`>;
    /**
     * Returns an account object along with data about the proof.
     * @param params An array of three parameters:
     *   1. address of the account
     *   2. array of storage keys which should be proofed and included
     *   3. integer block number, or the string "latest" or "earliest"
     * @returns The {@link Proof}
     */
    getProof(params: [PrefixedHexString, PrefixedHexString[], PrefixedHexString]): Promise<Proof>;
    /**
     * Returns an object with data about the sync status or false.
     * @returns An object with sync status data or false (when not syncing)
     *   * startingBlock - The block at which the import started (will only be reset after the sync reached his head)
     *   * currentBlock - The current block, same as eth_blockNumber
     *   * highestBlock - The estimated highest block
     */
    syncing(): Promise<false | {
        startingBlock: `0x${string}`;
        currentBlock: `0x${string}`;
        highestBlock: `0x${string}`;
    }>;
    /**
     * Returns the transaction count for a block given by the block number.
     * @param params An array of one parameter:
     *  1. integer of a block number, or the string "latest", "earliest" or "pending"
     */
    getBlockTransactionCountByNumber(params: [string]): Promise<`0x${string}`>;
    /**
     * Gas price oracle.
     *
     * Returns a suggested gas price.
     * @returns a hex code of an integer representing the suggested gas price in wei.
     */
    gasPrice(): Promise<`0x${string}`>;
    feeHistory(params: [string | number | bigint, string, [number]?]): Promise<{
        baseFeePerGas: `0x${string}`[];
        gasUsedRatio: number[];
        baseFeePerBlobGas: `0x${string}`[];
        blobGasUsedRatio: number[];
        oldestBlock: `0x${string}`;
        reward: `0x${string}`[][];
    }>;
    /**
     *
     * @returns the blob base fee for the next/pending block in wei
     */
    blobBaseFee(): Promise<`0x${string}`>;
}
export {};
//# sourceMappingURL=eth.d.ts.map
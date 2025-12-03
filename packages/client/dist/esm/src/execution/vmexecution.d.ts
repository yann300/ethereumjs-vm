import { Execution } from './execution.ts';
import { PreimagesManager } from './preimage.ts';
import { ReceiptsManager } from './receipt.ts';
import { TxIndex } from './txIndex.ts';
import type { Block } from '@ethereumjs/block';
import type { PrefixedHexString } from '@ethereumjs/util';
import type { RunBlockOpts, TxReceipt, VM } from '@ethereumjs/vm';
import type { ExecutionOptions } from './execution.ts';
export type ExecStatus = (typeof ExecStatus)[keyof typeof ExecStatus];
export declare const ExecStatus: {
    readonly VALID: "VALID";
    readonly INVALID: "INVALID";
    readonly IGNORE_INVALID: "IGNORE_INVALID";
};
type ChainStatus = {
    height: bigint;
    status: ExecStatus;
    hash: Uint8Array;
    root: Uint8Array;
};
export declare class VMExecution extends Execution {
    private _lock;
    vm: VM;
    merkleVM: VM | undefined;
    hardfork: string;
    chainStatus: ChainStatus | null;
    receiptsManager?: ReceiptsManager;
    preimagesManager?: PreimagesManager;
    txIndex?: TxIndex;
    private pendingReceipts?;
    private vmPromise?;
    /** Maximally tolerated block time before giving a warning on console */
    private MAX_TOLERATED_BLOCK_TIME;
    /**
     * Interval for client execution stats output (in ms)
     * for debug log level
     *
     */
    private STATS_INTERVAL;
    private _statsInterval;
    private _statsVM;
    /**
     * Run a function after acquiring a lock. It is implied that we have already
     * initialized the module (or we are calling this from the init function, like
     * `_setCanonicalGenesisBlock`)
     * @param action - function to run after acquiring a lock
     * @hidden
     */
    private runWithLock;
    /**
     * Create new VM execution module
     */
    constructor(options: ExecutionOptions);
    setupMerkleVM(): Promise<void>;
    /**
     * Initializes VM execution. Must be called before run() is called
     */
    open(): Promise<void>;
    /**
     * Reset the execution after the chain has been reset back
     */
    checkAndReset(headBlock: Block): Promise<void>;
    /**
     * Executes the block, runs the necessary verification on it,
     * and persists the block and the associate state into the database.
     * The key difference is it won't do the canonical chain updating.
     * It relies on the additional {@link VMExecution.setHead} call to finalize
     * the entire procedure.
     * @param receipts If we built this block, pass the receipts to not need to run the block again
     * @param optional param if runWithoutSetHead should block for execution
     * @param optional param if runWithoutSetHead should skip putting block into chain
     * @returns if the block was executed or not, throws on block execution failure
     */
    runWithoutSetHead(opts: RunBlockOpts & {
        parentBlock?: Block;
    }, receipts?: TxReceipt[], blocking?: boolean, skipBlockchain?: boolean): Promise<boolean>;
    savePreimages(preimages: Map<PrefixedHexString, Uint8Array>): Promise<void>;
    /**
     * Sets the chain to a new head block.
     * Should only be used after {@link VMExecution.runWithoutSetHead}
     * @param blocks Array of blocks to save pending receipts and set the last block as the head
     */
    setHead(blocks: Block[], { finalizedBlock, safeBlock }?: {
        finalizedBlock?: Block;
        safeBlock?: Block;
    }): Promise<boolean>;
    jumpVmHead(jumpToHash: Uint8Array, jumpToNumber?: bigint): Promise<void>;
    /**
     * Runs the VM execution
     * @param loop Whether to continue iterating until vm head equals chain head (default: true)
     * @returns number of blocks executed
     */
    run(loop?: boolean, runOnlyBatched?: boolean): Promise<number>;
    /**
     * Start execution
     */
    start(): Promise<boolean>;
    /**
     * Stop VM execution. Returns a promise that resolves once its stopped.
     */
    stop(): Promise<boolean>;
    /**
     * Execute a range of blocks on a copy of the VM
     * without changing any chain or client state
     *
     * Possible input formats:
     *
     * - Single block, '5'
     * - Range of blocks, '5-10'
     */
    executeBlocks(first: number, last: number, txHashes: string[]): Promise<void>;
    stats(): void;
}
export {};
//# sourceMappingURL=vmexecution.d.ts.map
import { callWithStackTrace, toJSONRPCTx } from "../helpers.js";
/**
 * web3_* RPC module
 * @memberof module:rpc/modules
 */
export class TxPool {
    /**
     * Create web3_* RPC module
     * @param client Client to which the module binds
     */
    constructor(client, rpcDebug) {
        const service = client.service;
        this._txpool = service.txPool;
        this._vm = service.execution.vm;
        this._rpcDebug = rpcDebug;
        this.content = callWithStackTrace(this.content.bind(this), this._rpcDebug);
    }
    /**
     * Returns the contents of the transaction pool
     */
    content() {
        const pending = new Map();
        for (const pool of this._txpool.pool) {
            const pendingForAcct = new Map();
            for (const tx of pool[1]) {
                pendingForAcct.set(tx.tx.nonce, toJSONRPCTx(tx.tx));
            }
            if (pendingForAcct.size > 0)
                pending.set('0x' + pool[0], Object.fromEntries(pendingForAcct));
        }
        return {
            pending: Object.fromEntries(pending),
        };
    }
}
//# sourceMappingURL=txpool.js.map
import { bytesToHex, hexToBytes } from '@ethereumjs/util';
import { keccak256 } from 'ethereum-cryptography/keccak.js';
import { getClientVersion } from "../../util/index.js";
import { callWithStackTrace } from "../helpers.js";
import { middleware, validators } from "../validation.js";
/**
 * web3_* RPC module
 * @memberof module:rpc/modules
 */
export class Web3 {
    /**
     * Create web3_* RPC module
     * @param client Client to which the module binds
     */
    constructor(client, rpcDebug) {
        const service = client.service;
        this._chain = service.chain;
        this._rpcDebug = rpcDebug;
        this.clientVersion = middleware(this.clientVersion.bind(this), 0, []);
        this.sha3 = middleware(callWithStackTrace(this.sha3.bind(this), this._rpcDebug), 1, [
            [validators.hex],
        ]);
    }
    /**
     * Returns the current client version
     * @param params An empty array
     */
    clientVersion(_params = []) {
        return getClientVersion();
    }
    /**
     * Returns Keccak-256 (not the standardized SHA3-256) of the given data
     * @param params The data to convert into a SHA3 hash
     */
    sha3(params) {
        const hexEncodedDigest = bytesToHex(keccak256(hexToBytes(params[0])));
        return hexEncodedDigest;
    }
}
//# sourceMappingURL=web3.js.map
import { BIGINT_0, accountBodyFromSlim, accountBodyToSlim, bigIntToUnpaddedBytes, bytesToBigInt, setLengthLeft, } from '@ethereumjs/util';
import { Protocol } from "./protocol.js";
/**
 * Implements snap/1 protocol
 * @memberof module:net/protocol
 */
export class SnapProtocol extends Protocol {
    /**
     * Create snap protocol
     */
    constructor(options) {
        super(options);
        this.nextReqId = BIGINT_0;
        this.protocolMessages = [
            {
                name: 'GetAccountRange',
                code: 0x00,
                response: 0x01,
                // [reqID: P, rootHash: B_32, startingHash: B_32, limitHash: B_32, responseBytes: P]
                encode: ({ reqId, root, origin, limit, bytes }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        setLengthLeft(root, 32),
                        setLengthLeft(origin, 32),
                        setLengthLeft(limit, 32),
                        bigIntToUnpaddedBytes(bytes),
                    ];
                },
                decode: ([reqId, root, origin, limit, bytes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        root,
                        origin,
                        limit,
                        bytes: bytesToBigInt(bytes),
                    };
                },
            },
            {
                name: 'AccountRange',
                code: 0x01,
                // [reqID: P, accounts: [[accHash: B_32, accBody: B], ...], proof: [node_1: B, node_2, ...]]
                encode: ({ reqId, accounts, proof, }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        accounts.map((account) => [
                            setLengthLeft(account.hash, 32),
                            accountBodyToSlim(account.body),
                        ]),
                        proof,
                    ];
                },
                decode: ([reqId, accounts, proof]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        accounts: accounts.map(([hash, body]) => ({
                            hash,
                            body: this.convertSlimBody === true ? accountBodyFromSlim(body) : body,
                        })),
                        proof,
                    };
                },
            },
            {
                name: 'GetStorageRanges',
                code: 0x02,
                response: 0x03,
                // [reqID: P, rootHash: B_32, accountHashes: [B_32], startingHash: B, limitHash: B, responseBytes: P]
                encode: ({ reqId, root, accounts, origin, limit, bytes }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        setLengthLeft(root, 32),
                        accounts.map((acc) => setLengthLeft(acc, 32)),
                        origin,
                        limit,
                        bigIntToUnpaddedBytes(bytes),
                    ];
                },
                decode: ([reqId, root, accounts, origin, limit, bytes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        root,
                        accounts,
                        origin,
                        limit,
                        bytes: bytesToBigInt(bytes),
                    };
                },
            },
            {
                name: 'StorageRanges',
                code: 0x03,
                // [reqID: P, slots: [[[slotHash: B_32, slotData: B], ...], ...], proof: [node_1: B, node_2, ...]]
                encode: ({ reqId, slots, proof, }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        slots.map((accSlots) => accSlots.map((slotData) => [setLengthLeft(slotData.hash, 32), slotData.body])),
                        proof,
                    ];
                },
                decode: ([reqId, slots, proof]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        slots: slots.map((accSlots) => accSlots.map(([hash, body]) => ({ hash, body }))),
                        proof,
                    };
                },
            },
            {
                name: 'GetByteCodes',
                code: 0x04,
                response: 0x05,
                // [reqID: P, hashes: [hash1: B_32, hash2: B_32, ...], bytes: P]
                encode: ({ reqId, hashes, bytes }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        hashes.map((hash) => setLengthLeft(hash, 32)),
                        bigIntToUnpaddedBytes(bytes),
                    ];
                },
                decode: ([reqId, hashes, bytes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        hashes,
                        bytes: bytesToBigInt(bytes),
                    };
                },
            },
            {
                name: 'ByteCodes',
                code: 0x05,
                // [reqID: P, codes: [code1: B, code2: B, ...]]
                encode: ({ reqId, codes }) => {
                    return [bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId), codes];
                },
                decode: ([reqId, codes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        codes,
                    };
                },
            },
            {
                name: 'GetTrieNodes',
                code: 0x06,
                response: 0x07,
                // [reqID: P, rootHash: B_32, paths: [[accPath: B, slotPath1: B, slotPath2: B, ...]...], bytes: P]
                encode: ({ reqId, root, paths, bytes }) => {
                    return [
                        bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId),
                        setLengthLeft(root, 32),
                        paths,
                        bigIntToUnpaddedBytes(bytes),
                    ];
                },
                decode: ([reqId, root, paths, bytes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        root,
                        paths,
                        bytes: bytesToBigInt(bytes),
                    };
                },
            },
            {
                name: 'TrieNodes',
                code: 0x07,
                // [reqID: P, nodes: [node1: B, node2: B, ...]]
                encode: ({ reqId, nodes }) => {
                    return [bigIntToUnpaddedBytes(reqId ?? ++this.nextReqId), nodes];
                },
                decode: ([reqId, nodes]) => {
                    return {
                        reqId: bytesToBigInt(reqId),
                        nodes,
                    };
                },
            },
        ];
        this.chain = options.chain;
        this.convertSlimBody = options.convertSlimBody;
    }
    /**
     * Name of protocol
     */
    get name() {
        return 'snap';
    }
    /**
     * Protocol versions supported
     */
    get versions() {
        return [1];
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
}
//# sourceMappingURL=snapprotocol.js.map
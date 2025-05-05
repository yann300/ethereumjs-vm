"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEntry = exports.readEntry = void 0;
exports.parseEntry = parseEntry;
const rlp_1 = require("@ethereumjs/rlp");
const util_1 = require("@ethereumjs/util");
const ssz_1 = require("micro-eth-signer/ssz");
const snappy_ts_1 = require("./snappy.js");
const types_ts_1 = require("./types.js");
async function parseEntry(entry) {
    if ((0, util_1.equalsBytes)(entry.type, types_ts_1.Era1Types.TotalDifficulty)) {
        return { type: entry.type, data: ssz_1.uint256.decode(entry.data) };
    }
    const decompressed = await (0, snappy_ts_1.decompressData)(entry.data);
    let data;
    switch ((0, util_1.bytesToHex)(entry.type)) {
        case (0, util_1.bytesToHex)(types_ts_1.Era1Types.CompressedBody): {
            const [txs, uncles, withdrawals] = rlp_1.RLP.decode(decompressed);
            data = { txs, uncles, withdrawals };
            break;
        }
        case (0, util_1.bytesToHex)(types_ts_1.Era1Types.CompressedHeader):
        case (0, util_1.bytesToHex)(types_ts_1.Era1Types.CompressedReceipts):
            data = rlp_1.RLP.decode(decompressed);
            break;
        case (0, util_1.bytesToHex)(types_ts_1.CommonTypes.Version):
        case (0, util_1.bytesToHex)(types_ts_1.Era1Types.AccumulatorRoot):
        case (0, util_1.bytesToHex)(types_ts_1.EraTypes.CompressedBeaconState):
        case (0, util_1.bytesToHex)(types_ts_1.EraTypes.CompressedSignedBeaconBlockType):
            data = decompressed;
            break;
        default:
            throw (0, util_1.EthereumJSErrorWithoutCode)(`unknown entry type - ${(0, util_1.bytesToHex)(entry.type)}`);
    }
    return { type: entry.type, data };
}
/**
 * Reads the first e2Store formatted entry from a string of bytes
 * @param bytes a Uint8Array containing one or more serialized {@link e2StoreEntry}
 * @returns a deserialized {@link e2StoreEntry}
 * @throws if the length of the entry read is greater than the possible number of bytes in the data element
 */
const readEntry = (bytes) => {
    if (bytes.length < 8)
        throw (0, util_1.EthereumJSErrorWithoutCode)(`invalid data length, got ${bytes.length}, expected at least 8`);
    const type = bytes.slice(0, 2);
    const lengthBytes = (0, util_1.concatBytes)(bytes.subarray(2, 8), new Uint8Array([0, 0]));
    const length = Number(new DataView(lengthBytes.buffer, lengthBytes.byteOffset).getBigUint64(0, true));
    if (length > bytes.length) {
        // Check for overflow
        throw (0, util_1.EthereumJSErrorWithoutCode)(`invalid data length, got ${length}, expected max of ${bytes.length - 8}`);
    }
    const data = length > 0 ? bytes.subarray(8, 8 + length) : new Uint8Array();
    return { type, data };
};
exports.readEntry = readEntry;
/**
 * Format e2store entry
 * @param entry { type: entry type, data: uncompressed data }
 * @returns serialized entry
 */
const formatEntry = async ({ type, data, }) => {
    const compressed = (0, util_1.equalsBytes)(type, types_ts_1.Era1Types.TotalDifficulty)
        ? data
        : (0, util_1.equalsBytes)(type, types_ts_1.Era1Types.AccumulatorRoot)
            ? data
            : (0, util_1.equalsBytes)(type, types_ts_1.CommonTypes.Version)
                ? data
                : (0, util_1.equalsBytes)(type, types_ts_1.CommonTypes.BlockIndex)
                    ? data
                    : await (0, snappy_ts_1.compressData)(data);
    const length = compressed.length;
    const lengthBytes = (0, util_1.bigInt64ToBytes)(BigInt(length), true).slice(0, 6);
    return (0, util_1.concatBytes)(type, lengthBytes, compressed);
};
exports.formatEntry = formatEntry;
//# sourceMappingURL=e2store.js.map
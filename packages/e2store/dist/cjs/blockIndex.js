"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockIndex = getBlockIndex;
exports.readBlockIndex = readBlockIndex;
exports.createBlockIndex = createBlockIndex;
const rlp_1 = require("@ethereumjs/rlp");
const util_1 = require("@ethereumjs/util");
const e2store_ts_1 = require("./e2store.js");
const types_ts_1 = require("./types.js");
function getBlockIndex(bytes) {
    const count = Number((0, util_1.bytesToBigInt64)(bytes.slice(-8), true));
    const recordLength = 8 * count + 24;
    const recordEnd = bytes.length;
    const recordStart = recordEnd - recordLength;
    const { data, type } = (0, e2store_ts_1.readEntry)(bytes.subarray(recordStart, recordEnd));
    if (!(0, util_1.equalsBytes)(type, types_ts_1.CommonTypes.BlockIndex)) {
        throw (0, rlp_1.EthereumJSErrorWithoutCode)(`Expected block index (type: ${types_ts_1.CommonTypes.BlockIndex}) but got ${type}`);
    }
    return { data, type, count, recordStart };
}
function readBlockIndex(data, count) {
    const startingNumber = Number((0, util_1.bytesToBigInt64)(data.slice(0, 8), true));
    const offsets = [];
    for (let i = 0; i < count; i++) {
        const slotEntry = data.subarray((i + 1) * 8, (i + 2) * 8);
        const offset = Number(new DataView(slotEntry.slice(0, 8).buffer).getBigInt64(0, true));
        offsets.push(offset);
    }
    return {
        startingNumber,
        offsets,
    };
}
async function createBlockIndex(blockTuples, startingNumber) {
    const version = await (0, e2store_ts_1.formatEntry)(types_ts_1.VERSION);
    const tuplesLength = blockTuples.reduce((acc, b) => acc + b.length, 0);
    const count = (0, util_1.bigInt64ToBytes)(BigInt(blockTuples.length), true);
    const blockIndexLength = 8 * blockTuples.length + 24;
    const e2hsLength = version.length + tuplesLength + count.length + blockIndexLength;
    const recordStart = e2hsLength - blockIndexLength;
    const offsetBigInt = [];
    for (let i = 0; i < blockTuples.length; i++) {
        if (i === 0) {
            const offset = 8 - recordStart;
            offsetBigInt.push(BigInt(offset));
        }
        else {
            const offset = offsetBigInt[i - 1] + BigInt(blockTuples[i - 1].length);
            offsetBigInt.push(offset);
        }
    }
    const offsets = offsetBigInt.map((o) => (0, util_1.bigInt64ToBytes)(o, true));
    const blockIndex = await (0, e2store_ts_1.formatEntry)({
        type: types_ts_1.CommonTypes.BlockIndex,
        data: (0, util_1.concatBytes)((0, util_1.bigInt64ToBytes)(startingNumber, true), ...offsets, count),
    });
    return blockIndex;
}
//# sourceMappingURL=blockIndex.js.map
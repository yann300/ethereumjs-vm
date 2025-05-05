"use strict";
// https://github.com/eth-clients/e2store-format-specs/blob/main/formats/e2hs.md
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatE2HS = void 0;
exports.readTuplesFromE2HS = readTuplesFromE2HS;
exports.readE2HSTupleAtIndex = readE2HSTupleAtIndex;
const util_1 = require("@ethereumjs/util");
const blockIndex_ts_1 = require("../blockIndex.js");
const e2store_ts_1 = require("../e2store.js");
const types_ts_1 = require("../types.js");
const blockTuple_ts_1 = require("./blockTuple.js");
// e2hs := Version | block-tuple* | other-entries* | BlockIndex
// block-tuple :=  CompressedHeaderWithProof | CompressedBody | CompressedReceipts
/**
 * Format E2HS
 * @param data array of block tuples
 * @param epoch epoch index
 * @returns serialized E2HS
 */
const formatE2HS = async (data, epoch) => {
    const version = await (0, e2store_ts_1.formatEntry)(types_ts_1.VERSION);
    const blockTuples = [];
    for (const { headerWithProof, body, receipts } of data) {
        const compressedHeaderWithProof = await (0, e2store_ts_1.formatEntry)({
            type: types_ts_1.E2HSTypes.CompressedHeaderWithProof,
            data: headerWithProof,
        });
        const compressedBody = await (0, e2store_ts_1.formatEntry)({
            type: types_ts_1.E2HSTypes.CompressedBody,
            data: body,
        });
        const compressedReceipts = await (0, e2store_ts_1.formatEntry)({
            type: types_ts_1.E2HSTypes.CompressedReceipts,
            data: receipts,
        });
        const entry = (0, util_1.concatBytes)(compressedHeaderWithProof, compressedBody, compressedReceipts);
        blockTuples.push(entry);
    }
    const startingNumber = BigInt(epoch * 8192);
    const blockIndex = await (0, blockIndex_ts_1.createBlockIndex)(blockTuples, startingNumber);
    const e2hs = (0, util_1.concatBytes)(version, ...blockTuples, blockIndex);
    return e2hs;
};
exports.formatE2HS = formatE2HS;
async function* readTuplesFromE2HS(bytes) {
    const { data, count } = (0, blockIndex_ts_1.getBlockIndex)(bytes);
    const { offsets } = (0, blockIndex_ts_1.readBlockIndex)(data, count);
    for (let x = 0; x < count; x++) {
        try {
            yield (0, blockTuple_ts_1.readE2HSTupleAtOffset)(bytes, offsets[x]);
        }
        catch {
            // noop - we skip empty slots
        }
    }
}
async function readE2HSTupleAtIndex(bytes, index) {
    const { data, count } = (0, blockIndex_ts_1.getBlockIndex)(bytes);
    const { offsets } = (0, blockIndex_ts_1.readBlockIndex)(data, count);
    return (0, blockTuple_ts_1.readE2HSTupleAtOffset)(bytes, offsets[index]);
}
//# sourceMappingURL=e2hs.js.map
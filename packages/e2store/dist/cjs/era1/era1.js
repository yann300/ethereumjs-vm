"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatEra1 = void 0;
exports.readBlockTuplesFromERA1 = readBlockTuplesFromERA1;
exports.readOtherEntries = readOtherEntries;
exports.readAccumulatorRoot = readAccumulatorRoot;
exports.readERA1 = readERA1;
exports.getHeaderRecords = getHeaderRecords;
exports.validateERA1 = validateERA1;
const util_1 = require("@ethereumjs/util");
const ssz = require("micro-eth-signer/ssz");
const index_ts_1 = require("../index.js");
const blockTuple_ts_1 = require("./blockTuple.js");
/**
 * Format era1 from epoch of history data
 * @param blockTuples header, body, receipts, totalDifficulty
 * @param headerRecords array of Header Records { blockHash: Uint8Array, totalDifficulty: bigint }
 * @param epoch epoch index
 * @returns serialized era1 file
 */
const formatEra1 = async (blockTuples, headerRecords, epoch) => {
    const version = await (0, index_ts_1.formatEntry)(index_ts_1.VERSION);
    const blocks = [];
    for (const { header, body, receipts, totalDifficulty } of blockTuples) {
        const compressedHeader = await (0, index_ts_1.formatEntry)({
            type: index_ts_1.Era1Types.CompressedHeader,
            data: header,
        });
        const compressedBody = await (0, index_ts_1.formatEntry)({
            type: index_ts_1.Era1Types.CompressedBody,
            data: body,
        });
        const compressedReceipts = await (0, index_ts_1.formatEntry)({
            type: index_ts_1.Era1Types.CompressedReceipts,
            data: receipts,
        });
        const compressedTotalDifficulty = await (0, index_ts_1.formatEntry)({
            type: index_ts_1.Era1Types.TotalDifficulty,
            data: ssz.uint256.encode(totalDifficulty),
        });
        const entry = (0, util_1.concatBytes)(compressedHeader, compressedBody, compressedReceipts, compressedTotalDifficulty);
        blocks.push(entry);
    }
    const epochAccumulatorRoot = index_ts_1.EpochAccumulator.merkleRoot(headerRecords);
    const accumulatorEntry = await (0, index_ts_1.formatEntry)({
        type: index_ts_1.Era1Types.AccumulatorRoot,
        data: epochAccumulatorRoot,
    });
    const startingNumber = BigInt(epoch * 8192);
    // startingNumber | index | index | index ... | count
    const blockIndex = await (0, index_ts_1.createBlockIndex)(blocks, startingNumber);
    // version | block-tuple* | other-entries | Accumulator | BLockIndex
    const era1 = (0, util_1.concatBytes)(version, ...blocks, accumulatorEntry, blockIndex);
    return era1;
};
exports.formatEra1 = formatEra1;
async function* readBlockTuplesFromERA1(bytes, count, offsets, recordStart) {
    for (let x = 0; x < count; x++) {
        try {
            const { headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry } = (0, blockTuple_ts_1.readBlockTupleAtOffset)(bytes, recordStart, offsets[x]);
            yield { headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry };
        }
        catch {
            // noop - we skip empty slots
        }
    }
}
async function readOtherEntries(bytes) {
    const { data, count, recordStart } = (0, index_ts_1.getBlockIndex)(bytes);
    const { offsets } = (0, index_ts_1.readBlockIndex)(data, count);
    const lastTuple = (0, blockTuple_ts_1.readBlockTupleAtOffset)(bytes, recordStart, offsets[count - 1]);
    const otherEntries = [];
    let next = recordStart + offsets[count - 1] + lastTuple.length;
    let nextEntry = (0, index_ts_1.readEntry)(bytes.slice(next));
    while (!(0, util_1.equalsBytes)(nextEntry.type, index_ts_1.Era1Types.AccumulatorRoot)) {
        otherEntries.push(nextEntry);
        next = next + nextEntry.data.length + 8;
        nextEntry = (0, index_ts_1.readEntry)(bytes.slice(next));
    }
    return { accumulatorRoot: nextEntry.data, otherEntries };
}
async function readAccumulatorRoot(bytes) {
    const { accumulatorRoot } = await readOtherEntries(bytes);
    return accumulatorRoot;
}
async function readERA1(bytes) {
    const { data, count, recordStart } = (0, index_ts_1.getBlockIndex)(bytes);
    const { offsets } = (0, index_ts_1.readBlockIndex)(data, count);
    return readBlockTuplesFromERA1(bytes, count, offsets, recordStart);
}
async function getHeaderRecords(bytes) {
    const blockTuples = await readERA1(bytes);
    const headerRecords = [];
    for await (const tuple of blockTuples) {
        const { header, body, totalDifficulty } = await (0, blockTuple_ts_1.parseBlockTuple)(tuple);
        const block = (0, blockTuple_ts_1.blockFromTuple)({ header, body });
        const headerRecord = {
            blockHash: block.header.hash(),
            totalDifficulty: totalDifficulty.data,
        };
        headerRecords.push(headerRecord);
    }
    return headerRecords;
}
async function validateERA1(bytes) {
    const accumulatorRoot = await readAccumulatorRoot(bytes);
    const headerRecords = await getHeaderRecords(bytes);
    const epochAccumulatorRoot = index_ts_1.EpochAccumulator.merkleRoot(headerRecords);
    return (0, util_1.equalsBytes)(epochAccumulatorRoot, accumulatorRoot);
}
//# sourceMappingURL=era1.js.map
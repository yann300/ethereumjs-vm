"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBlockTuples = createBlockTuples;
exports.parseBlockTuple = parseBlockTuple;
exports.readBlockTupleAtOffset = readBlockTupleAtOffset;
exports.blockFromTuple = blockFromTuple;
const block_1 = require("@ethereumjs/block");
const rlp_1 = require("@ethereumjs/rlp");
const index_ts_1 = require("../index.js");
async function createBlockTuples(blocks, blockReceipts, td) {
    const blockTuples = [];
    const headerRecords = [];
    for (const [i, block] of blocks.entries()) {
        td += block.header.difficulty;
        headerRecords.push({
            blockHash: block.hash(),
            totalDifficulty: td,
        });
        const receipts = blockReceipts[i];
        const body = [
            block.transactions.map((tx) => tx.serialize()),
            block.uncleHeaders.map((uh) => uh.raw()),
        ];
        if (block.withdrawals) {
            body.push(block.withdrawals.map((w) => w.raw()));
        }
        blockTuples.push({
            header: block.header.serialize(),
            body: rlp_1.RLP.encode(body),
            receipts,
            totalDifficulty: td,
        });
    }
    return {
        headerRecords,
        blockTuples,
        totalDifficulty: td,
    };
}
async function parseBlockTuple({ headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry, }) {
    const header = await (0, index_ts_1.parseEntry)(headerEntry);
    const body = await (0, index_ts_1.parseEntry)(bodyEntry);
    const receipts = await (0, index_ts_1.parseEntry)(receiptsEntry);
    const totalDifficulty = await (0, index_ts_1.parseEntry)(totalDifficultyEntry);
    return { header, body, receipts, totalDifficulty };
}
function readBlockTupleAtOffset(bytes, recordStart, offset) {
    const headerEntry = (0, index_ts_1.readEntry)(bytes.slice(recordStart + offset));
    const headerLength = headerEntry.data.length + 8;
    const bodyEntry = (0, index_ts_1.readEntry)(bytes.slice(recordStart + offset + headerLength));
    const bodyLength = bodyEntry.data.length + 8;
    const receiptsEntry = (0, index_ts_1.readEntry)(bytes.slice(recordStart + offset + headerLength + bodyLength));
    const receiptsLength = receiptsEntry.data.length + 8;
    const totalDifficultyEntry = (0, index_ts_1.readEntry)(bytes.slice(recordStart + offset + headerLength + bodyLength + receiptsEntry.data.length + 8));
    const totalDifficultyLength = totalDifficultyEntry.data.length + 8;
    const totalLength = headerLength + bodyLength + receiptsLength + totalDifficultyLength;
    return { headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry, length: totalLength };
}
function blockFromTuple({ header, body }) {
    const valuesArray = [header.data, body.data.txs, body.data.uncles, body.data.withdrawals];
    const block = (0, block_1.createBlockFromBytesArray)(valuesArray, { setHardfork: true });
    return block;
}
//# sourceMappingURL=blockTuple.js.map
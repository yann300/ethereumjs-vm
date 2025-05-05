import { createBlockFromBytesArray } from '@ethereumjs/block';
import { RLP } from '@ethereumjs/rlp';
import { parseEntry, readEntry } from "../index.js";
export async function createBlockTuples(blocks, blockReceipts, td) {
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
            body: RLP.encode(body),
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
export async function parseBlockTuple({ headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry, }) {
    const header = await parseEntry(headerEntry);
    const body = await parseEntry(bodyEntry);
    const receipts = await parseEntry(receiptsEntry);
    const totalDifficulty = await parseEntry(totalDifficultyEntry);
    return { header, body, receipts, totalDifficulty };
}
export function readBlockTupleAtOffset(bytes, recordStart, offset) {
    const headerEntry = readEntry(bytes.slice(recordStart + offset));
    const headerLength = headerEntry.data.length + 8;
    const bodyEntry = readEntry(bytes.slice(recordStart + offset + headerLength));
    const bodyLength = bodyEntry.data.length + 8;
    const receiptsEntry = readEntry(bytes.slice(recordStart + offset + headerLength + bodyLength));
    const receiptsLength = receiptsEntry.data.length + 8;
    const totalDifficultyEntry = readEntry(bytes.slice(recordStart + offset + headerLength + bodyLength + receiptsEntry.data.length + 8));
    const totalDifficultyLength = totalDifficultyEntry.data.length + 8;
    const totalLength = headerLength + bodyLength + receiptsLength + totalDifficultyLength;
    return { headerEntry, bodyEntry, receiptsEntry, totalDifficultyEntry, length: totalLength };
}
export function blockFromTuple({ header, body }) {
    const valuesArray = [header.data, body.data.txs, body.data.uncles, body.data.withdrawals];
    const block = createBlockFromBytesArray(valuesArray, { setHardfork: true });
    return block;
}
//# sourceMappingURL=blockTuple.js.map
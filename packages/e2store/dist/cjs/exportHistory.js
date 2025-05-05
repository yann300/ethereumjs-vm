"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBKey = exports.DBTarget = void 0;
exports.numberToHash = numberToHash;
exports.getHeader = getHeader;
exports.getBody = getBody;
exports.getTotalDifficulty = getTotalDifficulty;
exports.getBlock = getBlock;
exports.getBlockReceipts = getBlockReceipts;
exports.getBlockTuple = getBlockTuple;
exports.getBlocks = getBlocks;
exports.exportEpochAsEra1 = exportEpochAsEra1;
const fs_1 = require("fs");
const blockchain_1 = require("@ethereumjs/blockchain");
const rlp_1 = require("@ethereumjs/rlp");
const util_1 = require("@ethereumjs/util");
const level_1 = require("level");
const index_ts_1 = require("./era1/index.js");
exports.DBTarget = {
    NumberToHash: 4,
    TotalDifficulty: 5,
    Body: 6,
    Header: 7,
};
exports.DBKey = {
    Receipts: 0,
};
async function dbGet(DB, dbOperationTarget, key) {
    const dbGetOperation = blockchain_1.DBOp.get(dbOperationTarget, key);
    return DB.get(dbGetOperation.baseDBOp.key, {
        keyEncoding: dbGetOperation.baseDBOp.keyEncoding,
        valueEncoding: dbGetOperation.baseDBOp.valueEncoding,
    });
}
async function numberToHash(DB, number) {
    const hash = await dbGet(DB, exports.DBTarget.NumberToHash, { blockNumber: number });
    return hash;
}
async function getHeader(DB, hash, number) {
    const header = await dbGet(DB, exports.DBTarget.Header, { blockHash: hash, blockNumber: number });
    return header;
}
/**
 * Fetches body of a block given its hash and number.
 */
async function getBody(DB, blockHash, blockNumber) {
    const body = await dbGet(DB, exports.DBTarget.Body, { blockHash, blockNumber });
    return body !== undefined ? rlp_1.RLP.decode(body) : undefined;
}
async function getTotalDifficulty(DB, hash, number) {
    const td = await dbGet(DB, exports.DBTarget.TotalDifficulty, { blockHash: hash, blockNumber: number });
    return (0, util_1.bytesToBigInt)(rlp_1.RLP.decode(td));
}
async function getBlock(DB, number) {
    const hash = await numberToHash(DB, number);
    const header = await getHeader(DB, hash, number);
    let body = await getBody(DB, hash, number);
    if (body === undefined) {
        body = [[], [], []];
    }
    body = rlp_1.RLP.encode(body);
    return { header, body };
}
async function getBlockReceipts(DB, blockHash) {
    const dbKey = (0, util_1.concatBytes)((0, util_1.intToBytes)(exports.DBKey.Receipts), blockHash);
    const receipts = await DB.get(dbKey);
    return (receipts ?? rlp_1.RLP.encode([]));
}
async function getBlockTuple(chainDB, metaDB, number) {
    const blockHash = await numberToHash(chainDB, number);
    const { header, body } = await getBlock(chainDB, number);
    const totalDifficulty = await getTotalDifficulty(chainDB, blockHash, number);
    const receipts = await getBlockReceipts(metaDB, blockHash);
    return { blockHash, header, body, totalDifficulty, receipts };
}
async function getBlocks(chainDB, metaDB, start, number) {
    const blocks = [];
    for (let i = 0; i < number; i++) {
        const { blockHash, header, body, totalDifficulty, receipts } = await getBlockTuple(chainDB, metaDB, start + BigInt(i));
        blocks.push({ blockHash, header, body, totalDifficulty, receipts });
    }
    return blocks;
}
async function getEpoch(chainDB, metaDB, index) {
    const blocks = await getBlocks(chainDB, metaDB, BigInt(index * 8192), 8192);
    const headerRecords = blocks.map((block) => {
        return {
            blockHash: block.blockHash,
            totalDifficulty: block.totalDifficulty,
        };
    });
    const blockTuples = blocks.map((block) => {
        return {
            header: block.header,
            body: block.body,
            receipts: block.receipts,
            totalDifficulty: block.totalDifficulty,
        };
    });
    return { blockTuples, headerRecords };
}
function initDBs(dataDir, chain) {
    const chainDir = `${dataDir}/${chain}`;
    // Chain DB
    const chainDataDir = `${chainDir}/chain`;
    const chainDB = new level_1.Level(chainDataDir);
    // Meta DB (receipts, logs, indexes, skeleton chain)
    const metaDataDir = `${chainDir}/meta`;
    const metaDB = new level_1.Level(metaDataDir);
    return { chainDB, metaDB };
}
async function exportEpochAsEra1(epoch, dataDir, outputDir = dataDir, chain = 'mainnet') {
    const { chainDB, metaDB } = initDBs(dataDir, chain);
    await chainDB.open();
    await metaDB.open();
    const { blockTuples, headerRecords } = await getEpoch(chainDB, metaDB, epoch);
    const era1 = await (0, index_ts_1.formatEra1)(blockTuples, headerRecords, epoch);
    // Create era1 directory if it doesn't exist
    const era1Dir = `${outputDir}/era1`;
    if (!(0, fs_1.existsSync)(era1Dir)) {
        (0, fs_1.mkdirSync)(era1Dir, { recursive: true });
    }
    (0, fs_1.writeFileSync)(`${era1Dir}/epoch-${epoch}.era1`, era1);
}
//# sourceMappingURL=exportHistory.js.map
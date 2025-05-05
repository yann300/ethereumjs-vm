import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { DBOp } from '@ethereumjs/blockchain';
import { RLP } from '@ethereumjs/rlp';
import { bytesToBigInt, concatBytes, intToBytes } from '@ethereumjs/util';
import { Level } from 'level';
import { formatEra1 } from "./era1/index.js";
export const DBTarget = {
    NumberToHash: 4,
    TotalDifficulty: 5,
    Body: 6,
    Header: 7,
};
export const DBKey = {
    Receipts: 0,
};
async function dbGet(DB, dbOperationTarget, key) {
    const dbGetOperation = DBOp.get(dbOperationTarget, key);
    return DB.get(dbGetOperation.baseDBOp.key, {
        keyEncoding: dbGetOperation.baseDBOp.keyEncoding,
        valueEncoding: dbGetOperation.baseDBOp.valueEncoding,
    });
}
export async function numberToHash(DB, number) {
    const hash = await dbGet(DB, DBTarget.NumberToHash, { blockNumber: number });
    return hash;
}
export async function getHeader(DB, hash, number) {
    const header = await dbGet(DB, DBTarget.Header, { blockHash: hash, blockNumber: number });
    return header;
}
/**
 * Fetches body of a block given its hash and number.
 */
export async function getBody(DB, blockHash, blockNumber) {
    const body = await dbGet(DB, DBTarget.Body, { blockHash, blockNumber });
    return body !== undefined ? RLP.decode(body) : undefined;
}
export async function getTotalDifficulty(DB, hash, number) {
    const td = await dbGet(DB, DBTarget.TotalDifficulty, { blockHash: hash, blockNumber: number });
    return bytesToBigInt(RLP.decode(td));
}
export async function getBlock(DB, number) {
    const hash = await numberToHash(DB, number);
    const header = await getHeader(DB, hash, number);
    let body = await getBody(DB, hash, number);
    if (body === undefined) {
        body = [[], [], []];
    }
    body = RLP.encode(body);
    return { header, body };
}
export async function getBlockReceipts(DB, blockHash) {
    const dbKey = concatBytes(intToBytes(DBKey.Receipts), blockHash);
    const receipts = await DB.get(dbKey);
    return (receipts ?? RLP.encode([]));
}
export async function getBlockTuple(chainDB, metaDB, number) {
    const blockHash = await numberToHash(chainDB, number);
    const { header, body } = await getBlock(chainDB, number);
    const totalDifficulty = await getTotalDifficulty(chainDB, blockHash, number);
    const receipts = await getBlockReceipts(metaDB, blockHash);
    return { blockHash, header, body, totalDifficulty, receipts };
}
export async function getBlocks(chainDB, metaDB, start, number) {
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
    const chainDB = new Level(chainDataDir);
    // Meta DB (receipts, logs, indexes, skeleton chain)
    const metaDataDir = `${chainDir}/meta`;
    const metaDB = new Level(metaDataDir);
    return { chainDB, metaDB };
}
export async function exportEpochAsEra1(epoch, dataDir, outputDir = dataDir, chain = 'mainnet') {
    const { chainDB, metaDB } = initDBs(dataDir, chain);
    await chainDB.open();
    await metaDB.open();
    const { blockTuples, headerRecords } = await getEpoch(chainDB, metaDB, epoch);
    const era1 = await formatEra1(blockTuples, headerRecords, epoch);
    // Create era1 directory if it doesn't exist
    const era1Dir = `${outputDir}/era1`;
    if (!existsSync(era1Dir)) {
        mkdirSync(era1Dir, { recursive: true });
    }
    writeFileSync(`${era1Dir}/epoch-${epoch}.era1`, era1);
}
//# sourceMappingURL=exportHistory.js.map
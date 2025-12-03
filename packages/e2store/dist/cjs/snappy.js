"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compressData = compressData;
exports.decompressData = decompressData;
const stream_1 = require("stream");
const util_1 = require("@ethereumjs/util");
const index_ts_1 = require("./snappy-stream/index.js");
/**
 * Compress data using snappy
 * @param uncompressedData
 * @returns compressed data
 */
async function compressData(uncompressedData) {
    return new Promise((resolve, reject) => {
        const compressedChunks = [];
        const writableStream = new stream_1.Writable({
            write(chunk, encoding, callback) {
                compressedChunks.push(new Uint8Array(chunk));
                callback();
            },
        });
        const compress = (0, index_ts_1.createCompressStream)();
        compress.on('error', reject);
        writableStream.on('error', reject);
        writableStream.on('finish', () => {
            const totalLength = compressedChunks.reduce((sum, chunk) => sum + chunk.length, 0);
            const result = new Uint8Array(totalLength);
            let offset = 0;
            for (const chunk of compressedChunks) {
                result.set(chunk, offset);
                offset += chunk.length;
            }
            resolve(result);
        });
        compress.pipe(writableStream);
        compress.write(uncompressedData);
        compress.end();
    });
}
async function decompressData(compressedData) {
    const unsnappy = (0, index_ts_1.createUncompressStream)({ asBuffer: true });
    const destroy = () => {
        unsnappy.destroy();
    };
    const data = await new Promise((resolve) => {
        const chunks = [];
        unsnappy.on('data', (data) => {
            chunks.push(data);
        });
        unsnappy.on('end', () => {
            destroy();
            resolve((0, util_1.concatBytes)(...chunks));
        });
        unsnappy.write(compressedData);
        unsnappy.end();
    });
    return data;
}
//# sourceMappingURL=snappy.js.map
import { Writable } from 'stream';
import { concatBytes } from '@ethereumjs/util';
import { createCompressStream, createUncompressStream } from "./snappy-stream/index.js";
/**
 * Compress data using snappy
 * @param uncompressedData
 * @returns compressed data
 */
export async function compressData(uncompressedData) {
    return new Promise((resolve, reject) => {
        const compressedChunks = [];
        const writableStream = new Writable({
            write(chunk, encoding, callback) {
                compressedChunks.push(new Uint8Array(chunk));
                callback();
            },
        });
        const compress = createCompressStream();
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
export async function decompressData(compressedData) {
    const unsnappy = createUncompressStream({ asBuffer: true });
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
            resolve(concatBytes(...chunks));
        });
        unsnappy.write(compressedData);
        unsnappy.end();
    });
    return data;
}
//# sourceMappingURL=snappy.js.map
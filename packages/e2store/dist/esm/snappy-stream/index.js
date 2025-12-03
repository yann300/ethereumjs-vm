import { CompressStream } from "./compress-stream.js";
import { UncompressStream } from "./uncompress-stream.js";
export function createUncompressStream(opts) {
    return new UncompressStream(opts);
}
export function createCompressStream(opts) {
    return new CompressStream(opts);
}
export { CompressStream, UncompressStream };
//# sourceMappingURL=index.js.map
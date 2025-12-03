"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UncompressStream = exports.CompressStream = void 0;
exports.createUncompressStream = createUncompressStream;
exports.createCompressStream = createCompressStream;
const compress_stream_ts_1 = require("./compress-stream.js");
Object.defineProperty(exports, "CompressStream", { enumerable: true, get: function () { return compress_stream_ts_1.CompressStream; } });
const uncompress_stream_ts_1 = require("./uncompress-stream.js");
Object.defineProperty(exports, "UncompressStream", { enumerable: true, get: function () { return uncompress_stream_ts_1.UncompressStream; } });
function createUncompressStream(opts) {
    return new uncompress_stream_ts_1.UncompressStream(opts);
}
function createCompressStream(opts) {
    return new compress_stream_ts_1.CompressStream(opts);
}
//# sourceMappingURL=index.js.map
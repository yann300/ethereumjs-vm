"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.params = void 0;
exports.getCacheSize = getCacheSize;
exports.getFullSize = getFullSize;
exports.getEpoc = getEpoc;
exports.getSeed = getSeed;
exports.fnv = fnv;
exports.fnvBytes = fnvBytes;
exports.bytesReverse = bytesReverse;
const bigint_crypto_utils_1 = require("bigint-crypto-utils");
const keccak_js_1 = require("ethereum-cryptography/keccak.js");
exports.params = {
    DATASET_BYTES_INIT: 1073741824, // 2^30
    DATASET_BYTES_GROWTH: 8388608, // 2 ^ 23
    CACHE_BYTES_INIT: 16777216, // 2**24 number of bytes in dataset at genesis
    CACHE_BYTES_GROWTH: 131072, // 2**17 cache growth per epoch
    CACHE_MULTIPLIER: 1024, // Size of the DAG relative to the cache
    EPOCH_LENGTH: 30000, // blocks per epoch
    MIX_BYTES: 128, // width of mix
    HASH_BYTES: 64, // hash length in bytes
    DATASET_PARENTS: 256, // number of parents of each dataset element
    CACHE_ROUNDS: 3, // number of rounds in cache production
    ACCESSES: 64,
    WORD_BYTES: 4,
};
async function getCacheSize(epoc) {
    const { CACHE_BYTES_INIT, CACHE_BYTES_GROWTH, HASH_BYTES } = exports.params;
    let sz = CACHE_BYTES_INIT + CACHE_BYTES_GROWTH * epoc;
    sz -= HASH_BYTES;
    while (!(await (0, bigint_crypto_utils_1.isProbablyPrime)(sz / HASH_BYTES, undefined, true))) {
        sz -= 2 * HASH_BYTES;
    }
    return sz;
}
async function getFullSize(epoc) {
    const { DATASET_BYTES_INIT, DATASET_BYTES_GROWTH, MIX_BYTES } = exports.params;
    let sz = DATASET_BYTES_INIT + DATASET_BYTES_GROWTH * epoc;
    sz -= MIX_BYTES;
    while (!(await (0, bigint_crypto_utils_1.isProbablyPrime)(sz / MIX_BYTES, undefined, true))) {
        sz -= 2 * MIX_BYTES;
    }
    return sz;
}
function getEpoc(blockNumber) {
    return Number(blockNumber / BigInt(exports.params.EPOCH_LENGTH));
}
/**
 * Generates a seed give the end epoc and optional the beginning epoc and the
 * beginning epoc seed
 * @method getSeed
 * @param seed Uint8Array
 * @param begin Number
 * @param end Number
 */
function getSeed(seed, begin, end) {
    for (let i = begin; i < end; i++) {
        seed = (0, keccak_js_1.keccak256)(seed);
    }
    return seed;
}
function fnv(x, y) {
    return ((((x * 0x01000000) | 0) + ((x * 0x193) | 0)) ^ y) >>> 0;
}
function fnvBytes(a, b) {
    const r = new Uint8Array(a.length);
    const rView = new DataView(r.buffer);
    for (let i = 0; i < a.length; i = i + 4) {
        rView.setUint32(i, fnv(new DataView(a.buffer).getUint32(i, true), new DataView(b.buffer).getUint32(i, true)), true);
    }
    return r;
}
function bytesReverse(a) {
    const length = a.length;
    const b = new Uint8Array(length);
    for (let i = 0; i < length; i++) {
        b[i] = a[length - i - 1];
    }
    return b;
}
//# sourceMappingURL=util.js.map
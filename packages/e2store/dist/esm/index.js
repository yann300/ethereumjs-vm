import { readFileSync } from 'fs';
export * from "./era/index.js";
export * from "./e2store.js";
export * from "./era1/index.js";
export * from "./e2hs/index.js";
export * from "./exportHistory.js";
export * from "./snappy.js";
export * from "./types.js";
export * from "./blockIndex.js";
export function readBinaryFile(path) {
    return new Uint8Array(readFileSync(path));
}
//# sourceMappingURL=index.js.map
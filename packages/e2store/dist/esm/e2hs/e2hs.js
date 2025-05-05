// https://github.com/eth-clients/e2store-format-specs/blob/main/formats/e2hs.md
import { concatBytes } from '@ethereumjs/util';
import { createBlockIndex, getBlockIndex, readBlockIndex } from "../blockIndex.js";
import { formatEntry } from "../e2store.js";
import { E2HSTypes, VERSION } from "../types.js";
import { readE2HSTupleAtOffset } from "./blockTuple.js";
// e2hs := Version | block-tuple* | other-entries* | BlockIndex
// block-tuple :=  CompressedHeaderWithProof | CompressedBody | CompressedReceipts
/**
 * Format E2HS
 * @param data array of block tuples
 * @param epoch epoch index
 * @returns serialized E2HS
 */
export const formatE2HS = async (data, epoch) => {
    const version = await formatEntry(VERSION);
    const blockTuples = [];
    for (const { headerWithProof, body, receipts } of data) {
        const compressedHeaderWithProof = await formatEntry({
            type: E2HSTypes.CompressedHeaderWithProof,
            data: headerWithProof,
        });
        const compressedBody = await formatEntry({
            type: E2HSTypes.CompressedBody,
            data: body,
        });
        const compressedReceipts = await formatEntry({
            type: E2HSTypes.CompressedReceipts,
            data: receipts,
        });
        const entry = concatBytes(compressedHeaderWithProof, compressedBody, compressedReceipts);
        blockTuples.push(entry);
    }
    const startingNumber = BigInt(epoch * 8192);
    const blockIndex = await createBlockIndex(blockTuples, startingNumber);
    const e2hs = concatBytes(version, ...blockTuples, blockIndex);
    return e2hs;
};
export async function* readTuplesFromE2HS(bytes) {
    const { data, count } = getBlockIndex(bytes);
    const { offsets } = readBlockIndex(data, count);
    for (let x = 0; x < count; x++) {
        try {
            yield readE2HSTupleAtOffset(bytes, offsets[x]);
        }
        catch {
            // noop - we skip empty slots
        }
    }
}
export async function readE2HSTupleAtIndex(bytes, index) {
    const { data, count } = getBlockIndex(bytes);
    const { offsets } = readBlockIndex(data, count);
    return readE2HSTupleAtOffset(bytes, offsets[index]);
}
//# sourceMappingURL=e2hs.js.map
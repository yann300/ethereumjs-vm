import { bytelist, container } from 'micro-eth-signer/ssz';
import { readEntry } from "../e2store.js";
import { decompressData } from "../snappy.js";
import { RLP } from '@ethereumjs/rlp';
export async function decompressE2HSTuple({ headerWithProofEntry, bodyEntry, receiptsEntry, }) {
    const headerWithProof = await decompressData(headerWithProofEntry.data);
    const body = await decompressData(bodyEntry.data);
    const receipts = await decompressData(receiptsEntry.data);
    return { headerWithProof, body, receipts };
}
export function readE2HSTupleAtOffset(bytes, offset) {
    const headerWithProofEntry = readEntry(bytes.slice(offset));
    const headerWithProofLength = headerWithProofEntry.data.length + 8;
    const bodyEntry = readEntry(bytes.slice(offset + headerWithProofLength));
    const bodyLength = bodyEntry.data.length + 8;
    const receiptsEntry = readEntry(bytes.slice(offset + headerWithProofLength + bodyLength));
    return { headerWithProofEntry, bodyEntry, receiptsEntry };
}
const MAX_HEADER_LENGTH = 2048;
const MAX_HEADER_PROOF_LENGTH = 1024;
const sszHeader = bytelist(MAX_HEADER_LENGTH);
const sszProof = bytelist(MAX_HEADER_PROOF_LENGTH);
export const sszHeaderWithProof = container({
    header: sszHeader,
    proof: sszProof,
});
export function parseEH2SBlockTuple(tuple) {
    const headerWithProof = sszHeaderWithProof.decode(tuple.headerWithProof);
    const body = RLP.decode(tuple.body);
    const receipts = RLP.decode(tuple.receipts);
    return { headerWithProof, body, receipts };
}
//# sourceMappingURL=blockTuple.js.map
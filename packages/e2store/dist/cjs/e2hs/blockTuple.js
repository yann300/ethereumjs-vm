"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sszHeaderWithProof = void 0;
exports.decompressE2HSTuple = decompressE2HSTuple;
exports.readE2HSTupleAtOffset = readE2HSTupleAtOffset;
exports.parseEH2SBlockTuple = parseEH2SBlockTuple;
const ssz_1 = require("micro-eth-signer/ssz");
const e2store_ts_1 = require("../e2store.js");
const snappy_ts_1 = require("../snappy.js");
const rlp_1 = require("@ethereumjs/rlp");
async function decompressE2HSTuple({ headerWithProofEntry, bodyEntry, receiptsEntry, }) {
    const headerWithProof = await (0, snappy_ts_1.decompressData)(headerWithProofEntry.data);
    const body = await (0, snappy_ts_1.decompressData)(bodyEntry.data);
    const receipts = await (0, snappy_ts_1.decompressData)(receiptsEntry.data);
    return { headerWithProof, body, receipts };
}
function readE2HSTupleAtOffset(bytes, offset) {
    const headerWithProofEntry = (0, e2store_ts_1.readEntry)(bytes.slice(offset));
    const headerWithProofLength = headerWithProofEntry.data.length + 8;
    const bodyEntry = (0, e2store_ts_1.readEntry)(bytes.slice(offset + headerWithProofLength));
    const bodyLength = bodyEntry.data.length + 8;
    const receiptsEntry = (0, e2store_ts_1.readEntry)(bytes.slice(offset + headerWithProofLength + bodyLength));
    return { headerWithProofEntry, bodyEntry, receiptsEntry };
}
const MAX_HEADER_LENGTH = 2048;
const MAX_HEADER_PROOF_LENGTH = 1024;
const sszHeader = (0, ssz_1.bytelist)(MAX_HEADER_LENGTH);
const sszProof = (0, ssz_1.bytelist)(MAX_HEADER_PROOF_LENGTH);
exports.sszHeaderWithProof = (0, ssz_1.container)({
    header: sszHeader,
    proof: sszProof,
});
function parseEH2SBlockTuple(tuple) {
    const headerWithProof = exports.sszHeaderWithProof.decode(tuple.headerWithProof);
    const body = rlp_1.RLP.decode(tuple.body);
    const receipts = rlp_1.RLP.decode(tuple.receipts);
    return { headerWithProof, body, receipts };
}
//# sourceMappingURL=blockTuple.js.map
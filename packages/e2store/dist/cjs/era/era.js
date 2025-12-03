"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.readBeaconBlock = exports.readBeaconState = exports.getEraIndexes = exports.readSlotIndex = void 0;
exports.readBlocksFromEra = readBlocksFromEra;
const util_1 = require("@ethereumjs/util");
const ssz = require("micro-eth-signer/ssz.js");
const index_ts_1 = require("../index.js");
/**
 * Reads a Slot Index from the end of a bytestring representing an era file
 * @param bytes a Uint8Array bytestring representing a {@link SlotIndex} plus any arbitrary prefixed data
 * @returns a deserialized {@link SlotIndex}
 */
const readSlotIndex = (bytes) => {
    const recordEnd = bytes.length;
    const countBytes = bytes.slice(recordEnd - 8);
    const count = Number(new DataView(countBytes.buffer).getBigInt64(0, true));
    const recordStart = recordEnd - (8 * count + 24);
    const slotIndexEntry = (0, index_ts_1.readEntry)(bytes.subarray(recordStart, recordEnd));
    if ((0, util_1.equalsBytes)(slotIndexEntry.type, index_ts_1.EraTypes.SlotIndex) === false) {
        throw (0, util_1.EthereumJSErrorWithoutCode)(`expected SlotIndex type, got ${slotIndexEntry.type}`);
    }
    const startSlot = Number(new DataView(slotIndexEntry.data.slice(0, 8).buffer).getBigInt64(0, true));
    const slotOffsets = [];
    for (let i = 0; i < count; i++) {
        const slotEntry = slotIndexEntry.data.subarray((i + 1) * 8, (i + 2) * 8);
        let slotOffset = Number(new DataView(slotEntry.slice(0, 8).buffer).getBigInt64(0, true));
        if (slotOffset === -1 * recordStart)
            slotOffset = 0; // If offset is the same as the block record start, this is a skipped slot
        slotOffsets.push(slotOffset);
    }
    return {
        startSlot,
        recordStart,
        slotOffsets,
    };
};
exports.readSlotIndex = readSlotIndex;
/**
 * Reads a an era file and extracts the State and Block slot indices
 * @param eraContents a bytestring representing a serialized era file
 * @returns a dictionary containing the State and Block Slot Indices (if present)
 */
const getEraIndexes = (eraContents) => {
    const stateSlotIndex = (0, exports.readSlotIndex)(eraContents);
    let blockSlotIndex = undefined;
    if (stateSlotIndex.startSlot > 0) {
        blockSlotIndex = (0, exports.readSlotIndex)(eraContents.slice(0, stateSlotIndex.recordStart));
    }
    return { stateSlotIndex, blockSlotIndex };
};
exports.getEraIndexes = getEraIndexes;
/**
 *
 * @param eraData a bytestring representing an era file
 * @returns a BeaconState object of the type corresponding to the fork the state snapshot occurred at
 * @throws if BeaconState cannot be found
 */
const readBeaconState = async (eraData) => {
    const indices = (0, exports.getEraIndexes)(eraData);
    const stateEntry = (0, index_ts_1.readEntry)(eraData.slice(indices.stateSlotIndex.recordStart + indices.stateSlotIndex.slotOffsets[0]));
    const data = await (0, index_ts_1.parseEntry)(stateEntry);
    if ((0, util_1.equalsBytes)(stateEntry.type, index_ts_1.EraTypes.CompressedBeaconState) === false) {
        throw (0, util_1.EthereumJSErrorWithoutCode)(`expected CompressedBeaconState type, got ${stateEntry.type}`);
    }
    const stateSlot = indices.stateSlotIndex.startSlot;
    // TODO: Add a helper to identify the fork programmatically so the right types can be selected based on fork number rather
    // than hardcoded as below
    if (stateSlot < ssz.ForkSlots.Altair)
        return ssz.Phase0BeaconState.decode(data.data);
    else if (stateSlot < ssz.ForkSlots.Bellatrix)
        return ssz.AltairBeaconState.decode(data.data);
    else if (stateSlot < ssz.ForkSlots.Capella)
        return ssz.BellatrixBeaconState.decode(data.data);
    else if (stateSlot < ssz.ForkSlots.Deneb)
        return ssz.CapellaBeaconState.decode(data.data);
    else
        return ssz.ETH2_TYPES.BeaconState.decode(data.data);
};
exports.readBeaconState = readBeaconState;
/**
 *
 * @param eraData a bytestring representing an era file
 * @returns a decompressed SignedBeaconBlock object of the same time as returned by {@link ssz.ETH2_TYPES.SignedBeaconBlock}
 * @throws if SignedBeaconBlock is not found when reading an entry
 */
const readBeaconBlock = async (eraData, offset) => {
    const indices = (0, exports.getEraIndexes)(eraData);
    const blockEntry = (0, index_ts_1.readEntry)(eraData.slice(indices.blockSlotIndex.recordStart + indices.blockSlotIndex.slotOffsets[offset]));
    const data = await (0, index_ts_1.parseEntry)(blockEntry);
    if ((0, util_1.equalsBytes)(blockEntry.type, index_ts_1.EraTypes.CompressedSignedBeaconBlockType) === false) {
        throw (0, util_1.EthereumJSErrorWithoutCode)(`expected CompressedSignedBeaconBlockType type, got ${(0, util_1.bytesToHex)(blockEntry.type)}`);
    }
    const slot = indices.blockSlotIndex.startSlot + offset;
    if (slot < ssz.ForkSlots.Altair)
        return ssz.Phase0SignedBeaconBlock.decode(data.data);
    else if (slot < ssz.ForkSlots.Bellatrix)
        return ssz.AltairSignedBeaconBlock.decode(data.data);
    else if (slot < ssz.ForkSlots.Capella)
        return ssz.BellatrixSignedBeaconBlock.decode(data.data);
    else if (slot < ssz.ForkSlots.Deneb)
        return ssz.CapellaSignedBeaconBlock.decode(data.data);
    else
        return ssz.ETH2_TYPES.SignedBeaconBlock.decode(data.data);
};
exports.readBeaconBlock = readBeaconBlock;
/**
 * Reads a an era file and yields a stream of decompressed SignedBeaconBlocks
 * @param eraFile Uint8Array a serialized era file
 * @returns a stream of decompressed SignedBeaconBlocks or undefined if no blocks are present
 */
async function* readBlocksFromEra(eraFile) {
    const indices = (0, exports.getEraIndexes)(eraFile);
    const maxBlocks = indices.blockSlotIndex?.slotOffsets.length;
    if (maxBlocks === undefined) {
        // Return early if no blocks are present
        return;
    }
    for (let x = 0; x < maxBlocks; x++) {
        if (indices.blockSlotIndex.slotOffsets[x] === 0)
            continue; // skip empty slots
        const block = await (0, exports.readBeaconBlock)(eraFile, x);
        yield block;
    }
}
//# sourceMappingURL=era.js.map
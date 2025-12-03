import type { SlotIndex } from '../index.ts';
/**
 * Reads a Slot Index from the end of a bytestring representing an era file
 * @param bytes a Uint8Array bytestring representing a {@link SlotIndex} plus any arbitrary prefixed data
 * @returns a deserialized {@link SlotIndex}
 */
export declare const readSlotIndex: (bytes: Uint8Array) => SlotIndex;
/**
 * Reads a an era file and extracts the State and Block slot indices
 * @param eraContents a bytestring representing a serialized era file
 * @returns a dictionary containing the State and Block Slot Indices (if present)
 */
export declare const getEraIndexes: (eraContents: Uint8Array) => {
    stateSlotIndex: SlotIndex;
    blockSlotIndex: SlotIndex | undefined;
};
/**
 *
 * @param eraData a bytestring representing an era file
 * @returns a BeaconState object of the type corresponding to the fork the state snapshot occurred at
 * @throws if BeaconState cannot be found
 */
export declare const readBeaconState: (eraData: Uint8Array) => Promise<{
    genesis_time: number | bigint;
    genesis_validators_root: Uint8Array<ArrayBufferLike>;
    slot: number | bigint;
    fork: {
        previous_version: Uint8Array<ArrayBufferLike>;
        current_version: Uint8Array<ArrayBufferLike>;
        epoch: number | bigint;
    };
    latest_block_header: {
        slot: number | bigint;
        proposer_index: number | bigint;
        parent_root: Uint8Array<ArrayBufferLike>;
        state_root: Uint8Array<ArrayBufferLike>;
        body_root: Uint8Array<ArrayBufferLike>;
    };
    block_roots: Uint8Array<ArrayBufferLike>[];
    state_roots: Uint8Array<ArrayBufferLike>[];
    historical_roots: Uint8Array<ArrayBufferLike>[];
    eth1_data: {
        deposit_root: Uint8Array<ArrayBufferLike>;
        deposit_count: number | bigint;
        block_hash: Uint8Array<ArrayBufferLike>;
    };
    eth1_data_votes: {
        deposit_root: Uint8Array<ArrayBufferLike>;
        deposit_count: number | bigint;
        block_hash: Uint8Array<ArrayBufferLike>;
    }[];
    eth1_deposit_index: number | bigint;
    validators: {
        pubkey: Uint8Array<ArrayBufferLike>;
        withdrawal_credentials: Uint8Array<ArrayBufferLike>;
        effective_balance: number | bigint;
        slashed: boolean;
        activation_eligibility_epoch: number | bigint;
        activation_epoch: number | bigint;
        exit_epoch: number | bigint;
        withdrawable_epoch: number | bigint;
    }[];
    balances: (number | bigint)[];
    randao_mixes: Uint8Array<ArrayBufferLike>[];
    slashings: (number | bigint)[];
    previous_epoch_participation: (number | bigint)[];
    current_epoch_participation: (number | bigint)[];
    justification_bits: boolean[];
    previous_justified_checkpoint: {
        epoch: number | bigint;
        root: Uint8Array<ArrayBufferLike>;
    };
    current_justified_checkpoint: {
        epoch: number | bigint;
        root: Uint8Array<ArrayBufferLike>;
    };
    finalized_checkpoint: {
        epoch: number | bigint;
        root: Uint8Array<ArrayBufferLike>;
    };
}>;
/**
 *
 * @param eraData a bytestring representing an era file
 * @returns a decompressed SignedBeaconBlock object of the same time as returned by {@link ssz.ETH2_TYPES.SignedBeaconBlock}
 * @throws if SignedBeaconBlock is not found when reading an entry
 */
export declare const readBeaconBlock: (eraData: Uint8Array, offset: number) => Promise<{
    message: {
        slot: number | bigint;
        proposer_index: number | bigint;
        parent_root: Uint8Array<ArrayBufferLike>;
        state_root: Uint8Array<ArrayBufferLike>;
        body: {
            randao_reveal: Uint8Array<ArrayBufferLike>;
            eth1_data: {
                deposit_root: Uint8Array<ArrayBufferLike>;
                deposit_count: number | bigint;
                block_hash: Uint8Array<ArrayBufferLike>;
            };
            graffiti: Uint8Array<ArrayBufferLike>;
            proposer_slashings: {
                signed_header_1: {
                    message: {
                        slot: number | bigint;
                        proposer_index: number | bigint;
                        parent_root: Uint8Array<ArrayBufferLike>;
                        state_root: Uint8Array<ArrayBufferLike>;
                        body_root: Uint8Array<ArrayBufferLike>;
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
                signed_header_2: {
                    message: {
                        slot: number | bigint;
                        proposer_index: number | bigint;
                        parent_root: Uint8Array<ArrayBufferLike>;
                        state_root: Uint8Array<ArrayBufferLike>;
                        body_root: Uint8Array<ArrayBufferLike>;
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            attester_slashings: {
                attestation_1: {
                    attesting_indices: (number | bigint)[];
                    data: {
                        slot: number | bigint;
                        index: number | bigint;
                        beacon_block_root: Uint8Array<ArrayBufferLike>;
                        source: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                        target: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
                attestation_2: {
                    attesting_indices: (number | bigint)[];
                    data: {
                        slot: number | bigint;
                        index: number | bigint;
                        beacon_block_root: Uint8Array<ArrayBufferLike>;
                        source: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                        target: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            attestations: {
                aggregation_bits: boolean[];
                data: {
                    slot: number | bigint;
                    index: number | bigint;
                    beacon_block_root: Uint8Array<ArrayBufferLike>;
                    source: {
                        epoch: number | bigint;
                        root: Uint8Array<ArrayBufferLike>;
                    };
                    target: {
                        epoch: number | bigint;
                        root: Uint8Array<ArrayBufferLike>;
                    };
                };
                signature: Uint8Array<ArrayBufferLike>;
            }[];
            deposits: {
                proof: Uint8Array<ArrayBufferLike>[];
                data: {
                    pubkey: Uint8Array<ArrayBufferLike>;
                    withdrawal_credentials: Uint8Array<ArrayBufferLike>;
                    amount: number | bigint;
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            voluntary_exits: {
                message: {
                    epoch: number | bigint;
                    validator_index: number | bigint;
                };
                signature: Uint8Array<ArrayBufferLike>;
            }[];
        };
    };
    signature: Uint8Array<ArrayBufferLike>;
}>;
/**
 * Reads a an era file and yields a stream of decompressed SignedBeaconBlocks
 * @param eraFile Uint8Array a serialized era file
 * @returns a stream of decompressed SignedBeaconBlocks or undefined if no blocks are present
 */
export declare function readBlocksFromEra(eraFile: Uint8Array): AsyncGenerator<{
    message: {
        slot: number | bigint;
        proposer_index: number | bigint;
        parent_root: Uint8Array<ArrayBufferLike>;
        state_root: Uint8Array<ArrayBufferLike>;
        body: {
            randao_reveal: Uint8Array<ArrayBufferLike>;
            eth1_data: {
                deposit_root: Uint8Array<ArrayBufferLike>;
                deposit_count: number | bigint;
                block_hash: Uint8Array<ArrayBufferLike>;
            };
            graffiti: Uint8Array<ArrayBufferLike>;
            proposer_slashings: {
                signed_header_1: {
                    message: {
                        slot: number | bigint;
                        proposer_index: number | bigint;
                        parent_root: Uint8Array<ArrayBufferLike>;
                        state_root: Uint8Array<ArrayBufferLike>;
                        body_root: Uint8Array<ArrayBufferLike>;
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
                signed_header_2: {
                    message: {
                        slot: number | bigint;
                        proposer_index: number | bigint;
                        parent_root: Uint8Array<ArrayBufferLike>;
                        state_root: Uint8Array<ArrayBufferLike>;
                        body_root: Uint8Array<ArrayBufferLike>;
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            attester_slashings: {
                attestation_1: {
                    attesting_indices: (number | bigint)[];
                    data: {
                        slot: number | bigint;
                        index: number | bigint;
                        beacon_block_root: Uint8Array<ArrayBufferLike>;
                        source: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                        target: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
                attestation_2: {
                    attesting_indices: (number | bigint)[];
                    data: {
                        slot: number | bigint;
                        index: number | bigint;
                        beacon_block_root: Uint8Array<ArrayBufferLike>;
                        source: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                        target: {
                            epoch: number | bigint;
                            root: Uint8Array<ArrayBufferLike>;
                        };
                    };
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            attestations: {
                aggregation_bits: boolean[];
                data: {
                    slot: number | bigint;
                    index: number | bigint;
                    beacon_block_root: Uint8Array<ArrayBufferLike>;
                    source: {
                        epoch: number | bigint;
                        root: Uint8Array<ArrayBufferLike>;
                    };
                    target: {
                        epoch: number | bigint;
                        root: Uint8Array<ArrayBufferLike>;
                    };
                };
                signature: Uint8Array<ArrayBufferLike>;
            }[];
            deposits: {
                proof: Uint8Array<ArrayBufferLike>[];
                data: {
                    pubkey: Uint8Array<ArrayBufferLike>;
                    withdrawal_credentials: Uint8Array<ArrayBufferLike>;
                    amount: number | bigint;
                    signature: Uint8Array<ArrayBufferLike>;
                };
            }[];
            voluntary_exits: {
                message: {
                    epoch: number | bigint;
                    validator_index: number | bigint;
                };
                signature: Uint8Array<ArrayBufferLike>;
            }[];
        };
    };
    signature: Uint8Array<ArrayBufferLike>;
}, void, unknown>;
//# sourceMappingURL=era.d.ts.map
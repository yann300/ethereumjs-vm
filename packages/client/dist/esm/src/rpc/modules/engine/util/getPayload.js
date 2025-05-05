import { bigIntToHex, bytesToHex } from '@ethereumjs/util';
/**
 * Formats a block to {@link ExecutionPayloadV1}.
 */
export const blockToExecutionPayload = (block, value, bundle, requests) => {
    const executionPayload = block.toExecutionPayload();
    // parentBeaconBlockRoot is not part of the CL payload
    if (executionPayload.parentBeaconBlockRoot !== undefined) {
        delete executionPayload.parentBeaconBlockRoot;
    }
    const blobsBundle = bundle ?? undefined;
    // ethereumjs does not provide any transaction censoring detection (yet) to suggest
    // overriding builder/mev-boost blocks
    const shouldOverrideBuilder = false;
    let executionRequests = undefined;
    if (requests !== undefined) {
        executionRequests = [];
        for (const request of requests) {
            if (request.bytes.length > 1) {
                executionRequests.push(bytesToHex(request.bytes));
            }
        }
    }
    return {
        executionPayload,
        executionRequests,
        blockValue: bigIntToHex(value),
        blobsBundle,
        shouldOverrideBuilder,
    };
};
//# sourceMappingURL=getPayload.js.map
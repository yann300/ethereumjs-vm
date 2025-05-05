import { UNKNOWN_PAYLOAD } from "../../error-code.js";
export const Status = {
    ACCEPTED: 'ACCEPTED',
    INVALID: 'INVALID',
    INVALID_BLOCK_HASH: 'INVALID_BLOCK_HASH',
    SYNCING: 'SYNCING',
    VALID: 'VALID',
};
export const EngineError = {
    UnknownPayload: {
        code: UNKNOWN_PAYLOAD,
        message: 'Unknown payload',
    },
};
//# sourceMappingURL=types.js.map
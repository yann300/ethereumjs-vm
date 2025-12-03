import { concatBytes, intToBytes } from '@ethereumjs/util';
const encodingOpts = { keyEncoding: 'view', valueEncoding: 'view' };
export const DBKey = {
    Receipts: 0,
    TxHash: 1,
    SkeletonBlock: 2,
    SkeletonBlockHashToNumber: 3,
    SkeletonStatus: 4,
    SkeletonUnfinalizedBlockByHash: 5,
    Preimage: 6,
};
/**
 * Helper class to access the metaDB with methods `put`, `get`, and `delete`
 */
export class MetaDBManager {
    constructor(options) {
        this.chain = options.chain;
        this.config = options.config;
        this.metaDB = options.metaDB;
    }
    dbKey(type, key) {
        return concatBytes(intToBytes(type), key);
    }
    async put(type, hash, value) {
        await this.metaDB.put(this.dbKey(type, hash), value, encodingOpts);
    }
    async get(type, hash) {
        try {
            const value = await this.metaDB.get(this.dbKey(type, hash), encodingOpts);
            if (value === null || value === undefined) {
                return null;
            }
            return value;
        }
        catch (error) {
            if (error.code === 'LEVEL_NOT_FOUND') {
                return null;
            }
            throw Error;
        }
    }
    async delete(type, hash) {
        await this.metaDB.del(this.dbKey(type, hash), encodingOpts);
    }
}
//# sourceMappingURL=metaDBManager.js.map
import type { AbstractLevel } from 'abstract-level';
import type { Chain } from '../blockchain/index.ts';
import type { Config } from '../config.ts';
export type DBKey = (typeof DBKey)[keyof typeof DBKey];
export declare const DBKey: {
    readonly Receipts: 0;
    readonly TxHash: 1;
    readonly SkeletonBlock: 2;
    readonly SkeletonBlockHashToNumber: 3;
    readonly SkeletonStatus: 4;
    readonly SkeletonUnfinalizedBlockByHash: 5;
    readonly Preimage: 6;
};
export interface MetaDBManagerOptions {
    chain: Chain;
    config: Config;
    metaDB: AbstractLevel<string | Uint8Array, string | Uint8Array, string | Uint8Array>;
}
/**
 * Helper class to access the metaDB with methods `put`, `get`, and `delete`
 */
export declare class MetaDBManager {
    protected chain: Chain;
    protected config: Config;
    private metaDB;
    constructor(options: MetaDBManagerOptions);
    private dbKey;
    put(type: DBKey, hash: Uint8Array, value: Uint8Array): Promise<void>;
    get(type: DBKey, hash: Uint8Array): Promise<Uint8Array | null>;
    delete(type: DBKey, hash: Uint8Array): Promise<void>;
}
//# sourceMappingURL=metaDBManager.d.ts.map
import { EthereumClient } from '../client.ts';
import { Config } from '../config.ts';
import type { Common, GenesisState } from '@ethereumjs/common';
export declare function createInlineClient(config: Config, common: Common, customGenesisState: GenesisState, datadir?: string, memoryDB?: boolean): Promise<EthereumClient>;
//# sourceMappingURL=inclineClient.d.ts.map
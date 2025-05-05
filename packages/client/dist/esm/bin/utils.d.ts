import * as http from 'http';
import { Common } from '@ethereumjs/common';
import { Config } from '../src/config.ts';
import type { CustomCrypto, GenesisState } from '@ethereumjs/common';
import type { Address } from '@ethereumjs/util';
import type { ClientOpts } from '../src/types.ts';
export type Account = [address: Address, privateKey: Uint8Array];
export declare function getArgs(): ClientOpts;
export declare function getCryptoFunctions(useJsCrypto: boolean): Promise<CustomCrypto>;
export declare function generateClientConfig(args: ClientOpts): Promise<{
    config: Config;
    customGenesisState: GenesisState | undefined;
    customGenesisStateRoot: Uint8Array<ArrayBufferLike> | undefined;
    metricsServer: http.Server<typeof http.IncomingMessage, typeof http.ServerResponse> | undefined;
    common: Common;
}>;
//# sourceMappingURL=utils.d.ts.map
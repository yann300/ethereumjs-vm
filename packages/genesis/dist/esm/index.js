import { Chain } from '@ethereumjs/common';
import { holeskyGenesis } from "./genesisStates/holesky.js";
import { hoodiGenesis } from "./genesisStates/hoodi.js";
import { mainnetGenesis } from "./genesisStates/mainnet.js";
import { sepoliaGenesis } from "./genesisStates/sepolia.js";
/**
 * Utility to get the genesisState of a well known network
 * @param: chainId of the network
 * @returns genesisState of the chain
 */
export function getGenesis(chainId) {
    switch (chainId) {
        case Chain.Mainnet:
            return mainnetGenesis;
        case Chain.Sepolia:
            return sepoliaGenesis;
        case Chain.Holesky:
            return holeskyGenesis;
        case Chain.Hoodi:
            return hoodiGenesis;
        default:
            return undefined;
    }
}
//# sourceMappingURL=index.js.map
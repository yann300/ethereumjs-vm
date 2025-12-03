"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGenesis = getGenesis;
const common_1 = require("@ethereumjs/common");
const holesky_ts_1 = require("./genesisStates/holesky.js");
const hoodi_ts_1 = require("./genesisStates/hoodi.js");
const mainnet_ts_1 = require("./genesisStates/mainnet.js");
const sepolia_ts_1 = require("./genesisStates/sepolia.js");
/**
 * Utility to get the genesisState of a well known network
 * @param: chainId of the network
 * @returns genesisState of the chain
 */
function getGenesis(chainId) {
    switch (chainId) {
        case common_1.Chain.Mainnet:
            return mainnet_ts_1.mainnetGenesis;
        case common_1.Chain.Sepolia:
            return sepolia_ts_1.sepoliaGenesis;
        case common_1.Chain.Holesky:
            return holesky_ts_1.holeskyGenesis;
        case common_1.Chain.Hoodi:
            return hoodi_ts_1.hoodiGenesis;
        default:
            return undefined;
    }
}
//# sourceMappingURL=index.js.map
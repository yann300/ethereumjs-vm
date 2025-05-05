import { CliqueConsensus, createBlockchain } from '@ethereumjs/blockchain';
import { ConsensusAlgorithm } from '@ethereumjs/common';
import { Level } from 'level';
import { MemoryLevel } from 'memory-level';
import { EthereumClient } from "../client.js";
import { Config } from "../config.js";
import { LevelDB } from "../execution/level.js";
export async function createInlineClient(config, common, customGenesisState, datadir = Config.DATADIR_DEFAULT, memoryDB = false) {
    let chainDB;
    let stateDB;
    let metaDB;
    if (memoryDB) {
        // `Level` and `AbstractLevel` somehow have a few property differences even though
        // `Level` extends `AbstractLevel`.  We don't use any of the missing properties so
        // just ignore this error
        chainDB = new MemoryLevel();
        stateDB = new MemoryLevel();
        metaDB = new MemoryLevel();
    }
    else {
        chainDB = new Level(`${datadir}/${common.chainName()}/chainDB`);
        stateDB = new Level(`${datadir}/${common.chainName()}/stateDB`);
        metaDB = new Level(`${datadir}/${common.chainName()}/metaDB`);
    }
    let validateConsensus = false;
    const consensusDict = {};
    if (customGenesisState !== undefined) {
        if (config.chainCommon.consensusAlgorithm() === ConsensusAlgorithm.Clique) {
            consensusDict[ConsensusAlgorithm.Clique] = new CliqueConsensus();
            validateConsensus = true;
        }
    }
    const blockchain = await createBlockchain({
        db: new LevelDB(chainDB),
        genesisState: customGenesisState,
        common: config.chainCommon,
        hardforkByHeadBlockNumber: true,
        validateBlocks: true,
        validateConsensus,
        consensusDict,
    });
    config.chainCommon.setForkHashes(blockchain.genesisBlock.hash());
    const inlineClient = await EthereumClient.create({
        config,
        blockchain,
        chainDB,
        stateDB,
        metaDB,
        genesisState: customGenesisState,
    });
    await inlineClient.open();
    await inlineClient.start();
    return inlineClient;
}
//# sourceMappingURL=inclineClient.js.map
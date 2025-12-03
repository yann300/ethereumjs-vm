import { pragueGethGenesis } from "./pragueGethGenesis.js";
function readyOsakaGenesis() {
    const { pragueGenesis, pragueTime } = pragueGethGenesis;
    const gethGenesis = typeof structuredClone === 'function'
        ? structuredClone(pragueGenesis)
        : JSON.parse(JSON.stringify(pragueGenesis));
    const osakaTime = pragueTime;
    // add shanghai and cancun to genesis
    const osakaGenesis = {
        ...gethGenesis,
        config: {
            ...gethGenesis.config,
            osakaTime,
        },
    };
    return { osakaGenesis, osakaTime };
}
export const osakaGethGenesis = readyOsakaGenesis();
//# sourceMappingURL=osakaGethGenesis.js.map
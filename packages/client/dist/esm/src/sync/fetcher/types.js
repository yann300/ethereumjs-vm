export function getInitFetcherDoneFlags() {
    return {
        done: false,
        syncing: false,
        accountFetcher: {
            started: false,
            // entire account range
            first: BigInt(0),
            done: false,
        },
        storageFetcher: {
            started: false,
            first: BigInt(0),
            count: BigInt(0),
            done: false,
        },
        byteCodeFetcher: {
            started: false,
            first: BigInt(0),
            count: BigInt(0),
            done: false,
        },
        trieNodeFetcher: {
            started: false,
            first: BigInt(0),
            count: BigInt(0),
            done: false,
        },
    };
}
//# sourceMappingURL=types.js.map
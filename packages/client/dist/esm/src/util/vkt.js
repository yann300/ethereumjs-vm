import { StatefulVerkleStateManager } from '@ethereumjs/statemanager';
import { Account, bytesToHex, createAddressFromString, createPartialAccount, hexToBigInt, hexToBytes, setLengthLeft, } from '@ethereumjs/util';
export async function generateVKTStateRoot(genesisState, common) {
    const state = new StatefulVerkleStateManager({ common });
    await state['_trie'].createRootNode();
    await state.checkpoint();
    for (const addressStr of Object.keys(genesisState)) {
        const addrState = genesisState[addressStr];
        let nonce;
        let balance;
        let code;
        let storage;
        if (Array.isArray(addrState)) {
            ;
            [balance, code, storage, nonce] = addrState;
        }
        else {
            balance = hexToBigInt(addrState);
            nonce = '0x1';
            code = '0x';
        }
        const address = createAddressFromString(addressStr);
        await state.putAccount(address, new Account());
        const codeBuf = hexToBytes(code ?? '0x');
        if (common.customCrypto?.keccak256 === undefined) {
            throw Error('keccak256 required');
        }
        const codeHash = common.customCrypto.keccak256(codeBuf);
        // Set contract storage
        if (storage !== undefined) {
            for (const [storageKey, valHex] of storage) {
                const val = hexToBytes(valHex);
                if (['0x', '0x00'].includes(bytesToHex(val))) {
                    continue;
                }
                const key = setLengthLeft(hexToBytes(storageKey), 32);
                await state.putStorage(address, key, val);
            }
        }
        // Put contract code
        await state.putCode(address, codeBuf);
        // Put account data
        const account = createPartialAccount({
            nonce,
            balance,
            codeHash,
            codeSize: codeBuf.byteLength,
        });
        await state.putAccount(address, account);
    }
    await state.commit();
    return state['_trie'].root();
}
//# sourceMappingURL=vkt.js.map
import { bytesToHex } from '@ethereumjs/util';
export const getPayloadBody = (block) => {
    const transactions = block.transactions.map((tx) => bytesToHex(tx.serialize()));
    const withdrawals = block.withdrawals?.map((wt) => wt.toJSON()) ?? null;
    return {
        transactions,
        withdrawals,
    };
};
//# sourceMappingURL=getPayloadBody.js.map
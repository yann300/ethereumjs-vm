export function toRPCTx(t) {
    const rpcTx = {
        from: t.from,
        gas: t.gas,
        gasPrice: t.gasPrice,
        value: t.value,
        data: t.input ?? t.data,
        maxPriorityFeePerGas: t.maxPriorityFeePerGas,
        maxFeePerGas: t.maxFeePerGas,
        type: t.type,
    };
    t.to !== null && (rpcTx.to = t.to);
    return rpcTx;
}
//# sourceMappingURL=types.js.map
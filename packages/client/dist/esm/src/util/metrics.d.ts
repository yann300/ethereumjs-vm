import * as promClient from 'prom-client';
export declare const setupMetrics: () => {
    legacyTxGauge: promClient.Gauge<string>;
    accessListEIP2930TxGauge: promClient.Gauge<string>;
    feeMarketEIP1559TxGauge: promClient.Gauge<string>;
    blobEIP4844TxGauge: promClient.Gauge<string>;
    blobEIP7594TxGauge: promClient.Gauge<string>;
};
//# sourceMappingURL=metrics.d.ts.map
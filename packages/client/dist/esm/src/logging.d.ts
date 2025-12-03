import type { Logger as WinstonLogger } from 'winston';
export type Logger = WinstonLogger;
/**
 * Returns a formatted {@link Logger}
 */
export declare function getLogger(args?: {
    [key: string]: any;
}): WinstonLogger | undefined;
//# sourceMappingURL=logging.d.ts.map
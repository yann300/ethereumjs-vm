/**
 * Ported to Typescript from original implementation below:
 * https://github.com/hokaccha/node-jwt-simple -- MIT licensed
 */
/**
 * support algorithm mapping
 */
export type TAlgorithm = 'HS256' | 'HS384' | 'HS512' | 'RS256';
export declare const jwt: {
    encode: (payload: any, key: string, algorithm?: string, options?: any) => string;
    decode: (token: string, key: string, noVerify?: boolean, algorithm?: string) => any;
};
//# sourceMappingURL=jwt-simple.d.ts.map
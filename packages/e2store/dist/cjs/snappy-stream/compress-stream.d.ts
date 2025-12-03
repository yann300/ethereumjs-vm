import { Transform } from 'stream';
export interface CompressStreamOptions {
    asyncCompress?: boolean;
}
export declare class CompressStream extends Transform {
    private asyncCompress;
    constructor(opts?: CompressStreamOptions);
    private _compressed;
    private _uncompressed;
    _transform(chunk: Uint8Array, _enc: string, callback: (error?: Error | null) => void): void;
    private _asyncTransform;
    private _syncTransform;
}
//# sourceMappingURL=compress-stream.d.ts.map
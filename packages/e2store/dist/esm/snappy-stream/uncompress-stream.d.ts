import { Transform } from 'stream';
export interface UncompressStreamOptions {
    asBuffer?: boolean;
}
export declare class UncompressStream extends Transform {
    private asBuffer;
    private foundIdentifier;
    private buffer;
    constructor(opts?: UncompressStreamOptions);
    private frameSize;
    private getType;
    private concatBuffers;
    private _parse;
    private areEqual;
    _transform(chunk: Uint8Array, _enc: string, callback: (error?: Error | null) => void): void;
}
//# sourceMappingURL=uncompress-stream.d.ts.map
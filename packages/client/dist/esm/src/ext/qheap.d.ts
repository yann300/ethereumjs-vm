/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * node is at [i], left child is at [2*i], right at [2*i+1].  Root is at [1].
 *
 * Copyright (C) 2014-2021 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */
/**
 * QHeap types.
 * @types/qheap does not exist, so we define it here.
 * https://www.npmjs.com/package/qheap
 */
export type QHeapOptions = {
    comparBefore?(a: any, b: any): boolean;
    compar?(a: any, b: any): number;
    freeSpace?: number;
    size?: number;
};
export type QHeap<T> = {
    insert(item: T): void;
    push(item: T): void;
    enqueue(item: T): void;
    remove(): T | undefined;
    shift(): T | undefined;
    dequeue(): T | undefined;
    peek(): T | undefined;
    length: number;
    gc(opts: {
        minLength: number;
        maxLength: number;
    }): void;
};
export declare class Heap {
    private _list;
    private _isBefore;
    private _sortBefore;
    private _freeSpace;
    options: QHeapOptions;
    length: number;
    constructor(opts?: QHeapOptions | Function);
    insert(item: any): any;
    _bubbleup(idx: number, item: any): void;
    append: (item: any) => any;
    push: (item: any) => any;
    unshift: (item: any) => any;
    enqueue: (item: any) => any;
    peek(): any;
    size(): number;
    remove(): any;
    _bubbledown(r: number, len: number): any;
    shift: () => any;
    pop: () => any;
    dequeue: () => any;
    fromArray(array: any[], base?: number, bound?: number): void;
    toArray(limit?: number): any[];
    sort(): void;
    gc(options?: {
        minLength?: number;
        minFull?: number;
    }): void;
    _trimArraySize(list: any[], len: number): void;
    _check(): boolean;
}
//# sourceMappingURL=qheap.d.ts.map
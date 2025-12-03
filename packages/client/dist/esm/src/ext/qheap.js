/**
 * nodejs heap, classic array implementation
 *
 * Items are stored in a balanced binary tree packed into an array where
 * node is at [i], left child is at [2*i], right at [2*i+1].  Root is at [1].
 *
 * Copyright (C) 2014-2021 Andras Radics
 * Licensed under the Apache License, Version 2.0
 */
export class Heap {
    constructor(opts) {
        this.append = this.insert;
        this.push = this.insert;
        this.unshift = this.insert;
        this.enqueue = this.insert;
        this.shift = this.remove;
        this.pop = this.remove;
        this.dequeue = this.remove;
        if (!(this instanceof Heap))
            return new Heap(opts);
        if (typeof opts === 'function')
            opts = { compar: opts };
        // copy out known options to not bind to caller object
        this.options = !opts
            ? {}
            : {
                compar: opts.compar,
                comparBefore: opts.comparBefore,
                freeSpace: opts.freeSpace,
                size: opts.size,
            };
        opts = this.options;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this;
        this._isBefore = opts.compar
            ? function (a, b) {
                return opts.compar(a, b) < 0;
            }
            : (opts.comparBefore ??
                function (a, b) {
                    return a < b;
                });
        this._sortBefore =
            opts.compar ??
                function (a, b) {
                    return self._isBefore(a, b) ? -1 : 1;
                };
        this._freeSpace = opts.freeSpace === undefined ? this._trimArraySize : false;
        this._list = new Array(opts.size ?? 20);
        this.length = 0;
    }
    /*
     * insert new item at end, and bubble up
     */
    insert(item) {
        const idx = ++this.length;
        return this._bubbleup(idx, item);
    }
    _bubbleup(idx, item) {
        const list = this._list;
        list[idx] = item;
        if (idx <= 1)
            return;
        do {
            const pp = idx >>> 1;
            if (this._isBefore(item, list[pp]))
                list[idx] = list[pp];
            else
                break;
            idx = pp;
        } while (idx > 1);
        list[idx] = item;
    }
    peek() {
        return this.length > 0 ? this._list[1] : undefined;
    }
    size() {
        return this.length;
    }
    /*
     * return the root, and bubble down last item from top root position
     * when bubbling down, r: root idx, c: child sub-tree root idx, cv: child root value
     * Note that the child at (c == this.length) does not have to be tested in the loop,
     * since its value is the one being bubbled down, so can loop `while (c < len)`.
     */
    remove() {
        const len = this.length;
        if (len < 1)
            return undefined;
        return this._bubbledown(1, len);
    }
    _bubbledown(r, len) {
        const list = this._list, ret = list[r], itm = list[len];
        let c;
        const _isBefore = this._isBefore;
        while ((c = r << 1) < len) {
            let cv = list[c];
            const cv1 = list[c + 1];
            if (_isBefore(cv1, cv)) {
                c++;
                cv = cv1;
            }
            if (!_isBefore(cv, itm))
                break;
            list[r] = cv;
            r = c;
        }
        list[r] = itm;
        list[len] = 0;
        this.length = --len;
        if (this._freeSpace !== false && this._freeSpace !== undefined)
            this._freeSpace(this._list, this.length);
        return ret;
    }
    // builder, not initializer: appends items, not replaces
    // FIXME: more useful to re-initialize from array
    fromArray(array, base, bound) {
        base = (base ?? 0) || 0;
        bound = (bound ?? 0) || array.length;
        for (let i = base; i < bound; i++)
            this.insert(array[i]);
    }
    // FIXME: more useful to return sorted values
    toArray(limit) {
        limit = typeof limit === 'number' ? limit + 1 : this.length + 1;
        return this._list.slice(1, limit);
    }
    // sort the contents of the storage array
    sort() {
        if (this.length < 3)
            return;
        this._list.splice(this.length + 1);
        this._list[0] = this._list[1];
        this._list.sort(this._sortBefore);
        this._list[0] = 0;
    }
    // Free unused storage slots in the _list.
    gc(options) {
        if (!options)
            options = {};
        const minListLength = (options.minLength ?? 0) || 0;
        const minListFull = (options.minFull ?? 0) || 1.0;
        if (this._list.length >= minListLength && this.length < this._list.length * minListFull) {
            this._list.splice(this.length + 1, this._list.length);
        }
    }
    _trimArraySize(list, len) {
        if (len > 10000 && list.length > 4 * len) {
            list.splice(len + 1, list.length);
        }
    }
    _check() {
        const _compar = this._sortBefore;
        let i, p, fail = 0;
        for (i = this.length; i > 1; i--) {
            // error if parent should go after child, but not if don`t care
            p = i >>> 1;
            // swapping the values must change their ordering, otherwise the
            // comparison is a tie.  (Ie, consider the ordering func (a <= b)
            // that for some values reports both that a < b and b < a.)
            if (_compar(this._list[p], this._list[i]) > 0 && _compar(this._list[i], this._list[p]) < 0) {
                fail = i;
            }
        }
        // eslint-disable-next-line no-console
        if (fail)
            console.log('failed at', fail >>> 1, fail);
        return !fail;
    }
}
//# sourceMappingURL=qheap.js.map
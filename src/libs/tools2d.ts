/**
 * A 2D array : an array of rows, each row being an Array or a typed array (Uint8Array, Float32Array...)
 */
export type Row<T> = { length: number, [x: number]: T };
export type Array2D<T> = Row<T>[];

/**
 * Row constructor : Array, or a typed array constructor (Uint8Array, Float32Array...)
 */
export type RowConstructor = new (length: number) => Row<unknown>;

/**
 * création rapide d'une matrice 2D
 * @param w {number}
 * @param h {number}
 * @param feed {function}
 * @param pType {ArrayConstructor|Uint8ArrayConstructor|Uint16ArrayConstructor|Uint32ArrayConstructor|BigUint64ArrayConstructor|Int8ArrayConstructor|Int16ArrayConstructor|Int32ArrayConstructor|BigInt64ArrayConstructor|Float32ArrayConstructor|Float64ArrayConstructor} row type (default : Array, can be Uint8Array, Float32Array ...)
 * @returns {[]}
 * @private
 */
function createArray2D<T>(w: number, h: number, feed: T | ((x: number, y: number) => T), pType: RowConstructor = Array): Array2D<T> {
    const a: Array2D<T> = [];
    for (let y = 0; y < h; ++y) {
        const r = new pType(w) as Row<T>;
        for (let x = 0; x < w; ++x) {
            r[x] = feed instanceof Function
                ? (feed as (x: number, y: number) => T)(x, y)
                : feed as T;
        }
        a[y] = r;
    }
    return a;
}


/**
 * Parcoure l'integralité du tableau 2D et appelle un callback dont le retour permet de modifier la valeur
 * @param aArray2D {array}
 * @param cb {function}
 */
function walk2D<T>(aArray2D: Array2D<T>, cb: (x: number, y: number, value: T) => T): void {
    for (let y = 0, h = aArray2D.length; y < h; ++y) {
        const row = aArray2D[y];
        for (let x = 0, w = row.length; x < w; ++x) {
            row[x] = cb(x, y, row[x]);
        }
    }
}

/**
 * comme walk2D mais créé un nouveau tableau
 * @param aArray2D
 * @param cb
 */
function map2D<T, U>(aArray2D: T[][], cb: (x: number, y: number, value: T) => U): U[][] {
    return aArray2D.map((row, y) => row.map((cell, x) => cb(x, y, cell)));
}

function rotate<T>(aArray: Array2D<T>, bDirect: boolean = false): Array2D<T> {
    const n = aArray.length;
    if (n === 0) {
        return [];
    }
    return createArray2D(n, n, (x, y) => bDirect
        ? aArray[x][n - y - 1]
        : aArray[n - x - 1][y], aArray[0].constructor as RowConstructor
    );
}

function rotateTwice<T>(aArray: Array2D<T>): Array2D<T> {
    return rotate(rotate(aArray));
}

export default {
    rotate,
    createArray2D,
    map2D,
    rotateTwice,
    walk2D
};
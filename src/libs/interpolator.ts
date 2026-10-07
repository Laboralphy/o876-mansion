/**
 * A simple linear interpolation function
 * @param v {number} the x whose "y" need to be computed
 * @param x1 {number} the first point of the linear segment
 * @param y1 {number}
 * @param x3 {number} the second point of the linear segment
 * @param y3 {number}
 * @returns {number}
 */

export function linear(v: number, x1: number, y1: number, x3: number, y3: number): number {
    return ((v - x1) * (y3 - y1)) / (x3 - x1) + y1;
}

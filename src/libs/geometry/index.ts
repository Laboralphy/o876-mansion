/**
 * Functions concerning angles and distances
 */
import Vector from "@/libs/geometry/Vector";

const PI = Math.PI;
const PI2 = 2 * PI;

class Geometry {
    /**
     * Distance between 2 points
     * @param x1 {Number} point 1 coordinates
     * @param y1 {Number}
     * @param x2 {Number} point 2 coordinates
     * @param y2 {Number}
     * @return {number} distance
     */
    static distance(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return Math.sqrt(dx * dx + dy * dy);
    }

    static squareDistance(x1: number, y1: number, x2: number, y2: number): number {
        let dx = x1 - x2;
        let dy = y1 - y2;
        return dx * dx + dy * dy;
    }

    /**
     * If an angle value is greater than PI or lower than -PI, the value is set back to a [-PI, PI] range
     * without altering it.
     * @param value {number}
     * @return {number}
     */
    static normalizeAngle(value: number): number {
        while (value > PI) {
            value -= PI2;
        }
        while (value < -PI) {
            value += PI2;
        }
        return value;
    }

    /**
     * Renvoie true si le point est dans le rectangle
     * @param x {number} coordonnée du point
     * @param y {number} coordonnée du point
     * @param xr {number} coordonnée du rect
     * @param yr {number} coordonnée du rect
     * @param wr {number} largeur du rect
     * @param hr {number} hauteur du rect
     * @return {boolean}
     */
    static pointInRect(x: number, y: number, xr: number, yr: number, wr: number, hr: number): boolean {
        return x >= xr && y >= yr && x < xr + wr && y < yr + hr;
    }

    static rectInRect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number): boolean {
        let ax2 = ax + aw - 1;
        let ay2 = ay + ah - 1;
        let bx2 = bx + bw - 1;
        let by2 = by + bh - 1;
        return ax < bx2 && ax2 > bx &&
            ay > by2 && ay2 < by;
    }

    static pointInCircle(x: number, y: number, xc: number, yc: number, r: number): boolean {
        return Geometry.squareDistance(x, y, xc, yc) <= (r * r);
    }

    static circleInRect(xc: number, yc: number, r: number, xr: number, yr: number, wr: number, hr: number): boolean {
        const xNearest = Math.max(xr, Math.min(xc, xr + wr));
        const yNearest = Math.max(yr, Math.min(yc, yr + hr));
        const xDelta = xc - xNearest;
        const yDelta = yc - yNearest;
        return (xDelta * xDelta + yDelta * yDelta) < (r * r);
    }

    /**
     * Renvoie l'ange que fait la doite x1, y1, x2, y2
     * avec l'axe des X+
     * @param x1 {number|Vector}
     * @param y1 {number|Vector}
     * @param [x2] {number}
     * @param [y2] {number}
     * @return {number}
     */
    static angle(v1: Vector, v2: Vector): number;
    static angle(x1: number, y1: number, x2: number, y2: number): number;
    static angle(x1: number | Vector, y1: number | Vector, x2?: number, y2?: number): number {
        if ((x1 instanceof Vector) && (y1 instanceof Vector)) {
            return Geometry.angle(x1.x, x1.y, y1.x, y1.y)
        } else {
            return Math.atan2(y2 - (y1 as number), x2 - (x1 as number));
        }
    }

    /**
     * A partir d'un angle et d'une norme, calcule deux composant d'un référentiel rectangulaire
     * @param angle
     * @param norm
     */
    static polar2rect(angle: number, norm: number): { dx: number, dy: number } {
        return {dx: norm * Math.cos(angle), dy: norm * Math.sin(angle)};
    }
}

export default Geometry;

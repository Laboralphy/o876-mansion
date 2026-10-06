import Vector from '@/libs/geometry/Vector';
import Geometry from '@/libs/geometry';

export interface PositionData {
    x?: number | null;
    y?: number | null;
    z?: number | null;
    angle?: number | null;
}

class Position {
    x: number;
    y: number;
    z: number;
    private _angle: number;

    constructor({x = 0, y = 0, z = 0, angle = 0}: PositionData = {}) {
        this.x = x;
        this.y = y;
        this.z = z;
        this._angle = angle;
    }

    get angle(): number {
        return this._angle;
    }

    set angle(value: number) {
        this._angle = Geometry.normalizeAngle(value);
    }

    set({x = null, y = null, z = null, angle = null}: PositionData): this {
        if (x !== null) {
            this.x = x;
        }
        if (y !== null) {
            this.y = y;
        }
        if (z !== null) {
            this.z = z;
        }
        if (angle !== null) {
            this.angle = angle;
        }
        return this;
    }

    /**
     * Returns a vector from the position
     */
    vector(): Vector {
        return new Vector(this.x, this.y);
    }

    /**
     * Returns a position vector of a point in front of the position, at a given distance
     * @param d a given distance
     */
    front(d: number): Vector {
        return new Vector(this.x + d * Math.cos(this.angle), this.y + d * Math.sin(this.angle));
    }
}

export default Position;

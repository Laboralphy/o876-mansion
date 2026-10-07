import { computeWallCollisions } from "@laboralphy/raycaster386/simulation";
import Thinker from "@/engine/thinkers/Thinker";
import Vector from "@/libs/geometry/Vector";

/**
 * a base thinker for moving entities.
 * moving and tangible entities should use this thinker
 */
class MoverThinker extends Thinker {
    _bCrashWall: boolean;
    _bHasChangedMovement: boolean;
    _cwc: ReturnType<typeof computeWallCollisions>;
    _speed: Vector;
    _xSector: number;
    _ySector: number;

    constructor() {
        super();
        this._speed = new Vector(); // real speed vector that controls the entity movement
        this._bHasChangedMovement = true;
        this._bCrashWall = false;
        this._cwc = null;
        this._xSector = -1;
        this._ySector = -1;
        this.automaton.defineStates({
            main: {
                loop: ['$move']
            }
        })
        this.automaton.initialState = "main";
    }

    /**
     * returns true if the entity has changed its movement
     * i.e. its speed vector has changed, or its angle has changed
     */
    hasChangedMovement(): boolean {
        let b = this._bHasChangedMovement;
        this._bHasChangedMovement = false;
        return b;
    }

    hasChangedSector(): boolean {
        const xSector = this.entity.sector.x;
        const ySector = this.entity.sector.y;
        const bChanged = this._xSector !== xSector || this._ySector !== ySector;
        if (bChanged) {
            this._xSector = xSector;
            this._ySector = ySector;
        }
        return bChanged;
    }

    /**
     * the entity movement has changed
     */
    changeMovement(): void {
        this._bHasChangedMovement = true;
    }

    /**
     * smooth movement from current position to a new position
     * @param v movement vector
     */
    slide(v: { x: number, y: number }): void {
        if (v.x === 0 && v.y === 0) {
            return;
        }
        const entity = this.entity;
        const engine = this.engine;
        const position = entity.position;
        const rc = engine.raycaster;
        const ps = rc.metrics.spacing;
        const size = entity.size;

        const cwc = this._cwc = computeWallCollisions(
            position.x,
            position.y,
            v.x,
            v.y,
            size,
            ps,
            this._bCrashWall,
            (x0, y0) => rc.getCellPhys(x0 / ps | 0, y0 / ps | 0) !== 0
        );
        position.x += cwc.speed.x;
        position.y += cwc.speed.y;
        entity._inertia.x = cwc.speed.x;
        entity._inertia.y = cwc.speed.y;
    }

    /**
     * Jump to another position without translation (disappear, then reappear)
     * no collision is computed
     * @param x {number}
     * @param y {number}
     * @param angle {number?}
     */
    setLocation(x: number, y: number, angle?: number): void {
        const entity = this.entity;
        const position = entity.position.set({x, y});
        if (angle !== undefined) {
            position.angle = angle;
        }
    }

    getMovement(): { a: number, x: number, y: number, sx: number, sy: number } {
        let m = this.entity;
        let loc = m.position;
        let spd = m.inertia;
        return {
            a: loc.angle,
            x: loc.x,
            y: loc.y,
            sx: spd.x,
            sy: spd.y,
        };
    }

    /**
     * Change movement speed
     * @param sx {number|Vector}
     * @param [sy] {number}
     */
    setSpeed(sx: Vector | number, sy: number = 0): void {
        if (sx instanceof Vector) {
            this.changeMovement();
            this._speed.set(sx);
        } else if (sx !== this._speed.x || sy !== this._speed.y) {
            this.changeMovement();
            this._speed.set(sx, sy);
        }
    }


    /**
     * thinker main method
     */
    $move(): void {
        let m = this.entity;
        m.inertia.set(0, 0);
        this.slide(this._speed);
    }

}

export default MoverThinker;
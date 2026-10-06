import { Dummy, type Sector, type SmashingEntity } from '@laboralphy/raycaster386/simulation';
import type { LightHandle, Sprite } from '@laboralphy/raycaster386';
import Position from './Position';
import Vector from '@/libs/geometry/Vector';

let LAST_ID = 0;

/**
 * Entities are things that move or stay static in the level.
 * Each entity has a position and a thinker
 * They can be :
 * - Player or Non Player Character
 * - Static Decorations (plants, lamps...)
 * - The Main Camera
 *
 * The entity is a game-tier object : it binds together a renderer sprite,
 * a simulation dummy (for actor collision) and a thinker (behavior).
 */
class Entity implements SmashingEntity {
    private readonly _id: number;
    private _ref = '';
    private readonly _position = new Position();
    private _visible = false;
    private _sprite: Sprite | null = null;
    private _thinker: any = null;
    private _size = 0;
    _inertia = new Vector();
    private _dead = false;
    private _lightsource: LightHandle | null = null;
    // this is a logical sector, for tag and door management purpose (not collision)
    _sector: Sector<Entity> | null = null;
    private readonly _dummy = new Dummy();
    data: Record<string, any> = {}; // user data

    constructor() {
        this._id = ++LAST_ID;
    }

    get debugString(): string {
        const sDead = this._dead ? 'DEAD' : '';
        return `#${this._id}:${this._ref} ${sDead} pos(${this._position.x}, ${this._position.y})`;
    }

    get dummy(): Dummy {
        return this._dummy;
    }

    get sector(): Sector<Entity> | null {
        return this._sector;
    }

    get lightsource(): LightHandle | null {
        return this._lightsource;
    }

    set lightsource(value: LightHandle | null) {
        this._lightsource = value;
    }

    get id(): number {
        return this._id;
    }

    get ref(): string {
        return this._ref;
    }

    set ref(value: string) {
        this._ref = value;
    }

    think(engine: any) {
        try {
            this._thinker.think(this, engine);
        } catch (e) {
            console.debug(this.debugString);
            throw e;
        }
    }

    get size(): number {
        return this._size;
    }

    set size(value: number) {
        this._size = value;
    }

    get visible(): boolean {
        return this._visible;
    }

    set visible(value: boolean) {
        this._visible = value;
    }

    get thinker(): any {
        return this._thinker;
    }

    set thinker(value: any) {
        value.entity = this;
        this._thinker = value;
    }

    set sprite(value: Sprite | null) {
        this._sprite = value;
    }

    get sprite(): Sprite | null {
        return this._sprite;
    }

    get position(): Position {
        return this._position;
    }

    set position(value: Position) {
        this._position.set(value);
    }

    get inertia(): Vector {
        return this._inertia;
    }

    set inertia(value: Vector) {
        this._inertia = value;
    }

    get dead(): boolean {
        return this._dead;
    }

    set dead(value: boolean) {
        this._dead = value;
    }
}

export default Entity;

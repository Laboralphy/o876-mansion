/**
 * Engine
 *
 * Game-tier compatibility layer.
 * This class keeps the public API of the original o876-raycaster-engine "libs/engine/Engine.js"
 * (which the game code relies on), but delegates all the work to @laboralphy/raycaster386 :
 * - rendering, level loading, light sources, sprites : the Renderer tier (@laboralphy/raycaster386)
 * - doors, locks, secret passages, scheduler, actor collision, tag grid : the Simulation tier
 *   (@laboralphy/raycaster386/simulation)
 *
 * What remains here is what the library deliberately leaves to the game : the doom loop, the entity
 * collection, the thinker registry, asset (tileset/blueprint) management, filters and events.
 */
import {
    Renderer,
    Canvas,
    loadLevel,
    type CellSurfaceManager,
    type LightHandle,
    type RceLevel,
    type ShadedTileSet,
    type BuiltMaterial
} from '@laboralphy/raycaster386';
import {
    DoorPolicy,
    Scheduler,
    Smasher,
    type DoorContext
} from '@laboralphy/raycaster386/simulation';

import * as CONSTS from './consts';
import Horde from './Horde';
import Entity from './Entity';
import Blueprint from './Blueprint';
import Camera from './Camera';
import Position, { type PositionData } from './Position';
import TagManager, { type TagManagerEvent } from './TagManager';
import thinkers from './thinkers';
import FilterManager from '@/libs/filters/FilterManager';
import Events from '@/libs/events';

export interface EngineConfig {
    thinkers: Record<string, any>;
    cameraThinker: string;
}

export interface BuildLevelExtra {
    startpoint?: number;
    blueprints?: any[];
    tilesets?: any[];
}

export interface EngineState {
    doors: any[];
    locks: number[];
    tags: any;
    time: number;
}

/**
 * suggest the nearest string (levenshtein distance) of a given string among a list of strings
 * (replaces the original libs/levenshtein module, only used to improve error messages)
 */
function suggest(s: string, aList: string[]): string {
    const lev = (a: string, b: string): number => {
        const d: number[] = [];
        for (let j = 0; j <= b.length; ++j) {
            d[j] = j;
        }
        for (let i = 1; i <= a.length; ++i) {
            let prev = d[0];
            d[0] = i;
            for (let j = 1; j <= b.length; ++j) {
                const tmp = d[j];
                d[j] = Math.min(d[j] + 1, d[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
                prev = tmp;
            }
        }
        return d[b.length];
    };
    let sBest = '';
    let nBest = Infinity;
    for (const x of aList) {
        const n = lev(s, x);
        if (n < nBest) {
            nBest = n;
            sBest = x;
        }
    }
    return sBest;
}

class Engine {
    // state
    private _doors: DoorPolicy | null = null;
    private _time = 0;

    // defined by level loading
    private _rc: Renderer | null = null;
    private _horde: Horde | null = null;
    private _camera: Camera | null = null;
    private _tilesets: Record<string, ShadedTileSet> = {};
    private _blueprints: Record<string, Blueprint> = {};
    private _materials: Record<string, BuiltMaterial> = {};
    private _interval: ReturnType<typeof setInterval> | null = null;
    private _refs: Record<string, string> = {};
    private _scheduler: Scheduler | null = null;
    _tm: TagManager | null = null;
    private _cellSize: number | undefined = undefined;
    private _startpoints: any[] = [];
    private _declaredTilesets: Map<string | number, any> = new Map();

    // instanciate at construct
    private readonly _thinkers: Record<string, any> = {};
    private readonly _thinkerContext: Record<string, any> = {};
    private readonly _smasher = new Smasher();

    // init
    readonly _TIME_INTERVAL = 40;
    private _timeMod = 0;
    private _renderCanvas: HTMLCanvasElement | null = null;
    private _renderContext: CanvasRenderingContext2D | null = null;
    private readonly _filters = new FilterManager();
    private readonly _events = new Events();
    private _config: EngineConfig = {
        thinkers: {},
        cameraThinker: 'FPSControlThinker'
    };

    constructor() {
        this.useThinkers(thinkers);
        this._smasher.setCellWidth(CONSTS.METRIC_SMASHER_SECTOR_SIZE);
        this._smasher.setCellHeight(CONSTS.METRIC_SMASHER_SECTOR_SIZE);
        this._smasher.events.on('dummy.update', ({entity}) => {
            this._syncEntityDummy(entity as Entity);
        });
        this._smasher.events.on('smashed', ({entity, smashers}) => {
            this._smashEntity(entity as Entity, smashers as Entity[]);
        });
    }

    get config(): EngineConfig {
        return this._config;
    }

    set config(value: EngineConfig) {
        this._config = value;
    }

    /**
     * returns the filter manager instance
     */
    get filters(): FilterManager {
        return this._filters;
    }

    /**
     * Returns the EventEmitter instance
     */
    get events(): Events {
        return this._events;
    }

    get smasher(): Smasher {
        return this._smasher;
    }

    get timeInterval(): number {
        return this._TIME_INTERVAL;
    }

    /**
     * This will setup the renderer and all associated structures
     */
    initializeRenderer() {
        this._rc = new Renderer();
        this._tm = new TagManager();
        this._scheduler = new Scheduler();
        this._horde = new Horde();
        this._doors = null;
        this._cellSize = undefined;
        this.initializeCamera();
        this._blueprints = {};
        this._tilesets = {};
        this._timeMod = 0;
        this._time = 0;
        this._tm.events.on('tagenter', event => this._tagEnter(event));
        this._tm.events.on('tagleave', event => this._tagLeave(event));
        this._tm.events.on('tagpush', event => this._tagPush(event));
        this._events.emit('initialized');
    }

    /**
     * The door policy can only be built once the level metrics are known
     */
    initializeDoors() {
        const rc = this._rc;
        const dp = new DoorPolicy({
            map: rc.cellMap,
            metrics: rc.metrics,
            isCellOccupied: (x, y) => this.horde.getEntitiesAt(x, y).length > 0
        });
        dp.events.on('locked', ({x, y}) => this._events.emit('door.locked', {x, y}));
        dp.events.on('opened', ({x, y, context}) => this._events.emit('door.open', {x, y, context}));
        dp.events.on('closing', ({x, y}) => this._events.emit('door.closing', {x, y}));
        dp.events.on('closed', ({x, y}) => this._events.emit('door.closed', {x, y}));
        this._doors = dp;
    }

    initializeCamera() {
        const camera = new Camera();
        camera.visible = false;
        camera.size = CONSTS.METRIC_CAMERA_DEFAULT_SIZE;
        this._camera = camera;
        this.horde.linkEntity(camera);
    }

    get horde(): Horde {
        return this._horde;
    }

    get camera(): Camera {
        return this._camera;
    }

    set camera(value: Camera) {
        this._camera = value;
    }

    get doors(): DoorPolicy {
        return this._doors;
    }

    get tagManager(): TagManager {
        return this._tm;
    }

    get raycaster(): Renderer {
        return this._rc;
    }

    /**
     * The cell surface manager of the renderer (decals, surface light maps)
     * The renderer does not expose it publicly, but the game manipulates decals at runtime.
     */
    get surfaces(): CellSurfaceManager {
        return (this._rc as any)._csm;
    }

    getTime(): number {
        return this._time;
    }

    /**
     * Sets the engine clock, used when restoring a saved state
     */
    setTime(value: number) {
        this._time = value;
    }

    /**
     * returns an index associated with a reference
     * this function may retrieve a blueprint or a block definition with a reference.
     */
    _getRefIndex(ref: string): string {
        const r = this._refs;
        if (ref in r) {
            return r[ref];
        } else {
            throw new Error('this reference is unknown : "' + ref + '". did you mean : "' + suggest(ref, Object.keys(r)) + '" ?');
        }
    }

//      _
//   __| | ___   ___  _ __ ___
//  / _` |/ _ \ / _ \| '__/ __|
// | (_| | (_) | (_) | |  \__ \
//  \__,_|\___/ \___/|_|  |___/

    /**
     * Processes all doors, updates all offsets.
     */
    _doorProcess() {
        const rc = this._rc;
        for (const {x, y, offset, phys} of this._doors.process()) {
            rc.setCellOffset(x, y, offset | 0);
            rc.setCellPhys(x, y, phys);
        }
    }

    /**
     * Opens a door at a specified position. The cell at x, y must have a PHYS_DOOR_*, PHYS_CURT_* or PHYS_SECRET_BLOCK physical code
     * @param x position of cell x
     * @param y position of cell y
     * @param bAutoclose if true, then the door will auto close after a certain time (see DOOR_MAINTAIN_DURATION constant)
     */
    openDoor(x: number, y: number, bAutoclose = true): DoorContext | null {
        return this._doors.openDoor(x, y, bAutoclose);
    }

    /**
     * Lock/unlock door
     */
    lockDoor(x: number, y: number, bLock: boolean) {
        this._doors.lockDoor(x, y, bLock);
    }

    /**
     * Closes a door that has already been open. This is the only way to close a door that can't automatically close.
     */
    closeDoor(x: number, y: number) {
        this._doors.closeDoor(x, y);
    }

    getCellType(x: number, y: number): number {
        return this._rc.getCellPhys(x, y);
    }

    /**
     * Returns true if the specified cell is any kind of door or curtain (secret blocks excluded)
     */
    isDoor(x: number, y: number): boolean {
        return this._doors.isDoor(x, y);
    }

    /**
     * Returns true if the specified cell is secret block
     */
    isSecretBlock(x: number, y: number): boolean {
        return this._doors.isSecretBlock(x, y);
    }

    /**
     * Returns true if the cell is a door and is closed
     */
    isDoorClosed(x: number, y: number): boolean {
        return this._doors.isDoorClosed(x, y);
    }

    /**
     * Returns true if the cell is a door and is open
     */
    isDoorOpen(x: number, y: number): boolean {
        return this._doors.isDoorOpen(x, y);
    }

    /**
     * Returns true if the cell is a door and is locked
     */
    isDoorLocked(x: number, y: number): boolean {
        return this._doors.isDoorLocked(x, y);
    }

//  _
// | | ___   ___  _ __
// | |/ _ \ / _ \| '_ \
// | | (_) | (_) | |_) |
// |_|\___/ \___/| .__/
//               |_|

    /**
     * Computes all things
     * @param nTime number of milliseconds you want to advance simulation
     */
    _update(nTime: number) {
        try {
            const tp = this._TIME_INTERVAL;
            this._time += nTime;
            const tm = this._timeMod + nTime;
            const nTimes = Math.min(10, tm / tp | 0);
            this._timeMod = tm % tp;
            let bRender = false;
            this._filters.process(this._time);
            for (let i = 0; i < nTimes; ++i) {
                // logic doom loop here
                this._scheduler.schedule(this._time);
                this._doorProcess();
                // entity management
                this._horde.process(this);
                // only thinkers using dummies (like Tangible) use sectors and the smasher
                this._smasher.process();
                this
                    ._horde
                    .getDeadEntities()
                    .forEach(e => this.destroyEntity(e));
                // tag events
                this._tm.hordeProcess(this);
                bRender = true;
                this._events.emit('update');
            }
            if (bRender) {
                this._render();
            }
        } catch (e) {
            console.error(e);
            this.stopDoomLoop();
        }
    }

    _render() {
        try {
            const rend = this._rc;
            // recompute all texture/sprite animation with a time-delta of 40ms
            rend.computeAnimations(this._TIME_INTERVAL);
            const camera = this._camera;
            if (camera) {
                const loc = camera.position;
                // render the scene, the scene will be rendered on the internal canvas of the raycaster renderer
                rend.render(loc.x, loc.y, loc.angle, loc.z);
                this._events.emit('render');
                this._filters.render(rend.renderCanvas);
                // display the raycaster internal canvas on the physical DOM canvas
                // requestAnimationFrame is called here to v-synchronize and have a neat animation
                requestAnimationFrame(() => {
                    rend.flip(this._renderContext);
                    this._events.emit('flip');
                });
            }
        } catch (e) {
            console.error(e);
            this.stopDoomLoop();
        }
    }

    /**
     * Renders the scene from another point of view, and returns the result as a new canvas.
     * The renderer internal canvas is restored afterwards.
     */
    screenshot(x: number, y: number, angle: number, z: number): HTMLCanvasElement {
        const rc = this._rc;
        const oSaveCanvas = Canvas.cloneCanvas(rc.renderCanvas);
        rc.render(x, y, angle, z);
        const oCanvas = Canvas.createCanvas(this._renderCanvas.width, this._renderCanvas.height);
        rc.flip(oCanvas.getContext('2d'));
        rc.renderCanvas.getContext('2d').drawImage(oSaveCanvas, 0, 0);
        return oCanvas;
    }

    /**
     * defines a rendering canvas
     * @param oCanvas the output canvas
     */
    setRenderingCanvas(oCanvas: HTMLCanvasElement): this {
        this._renderCanvas = oCanvas;
        this._renderContext = oCanvas.getContext('2d');
        return this;
    }

    /**
     * get the rendering canvas, after being set by setRenderingCanvas
     */
    getRenderingCanvas(): HTMLCanvasElement {
        return this._renderCanvas;
    }

    /**
     * get the rendering 2d Context
     */
    getRenderingContext(): CanvasRenderingContext2D {
        return this._renderContext;
    }

    /**
     * starts the doom loop
     */
    startDoomLoop() {
        this.stopDoomLoop();
        this._interval = setInterval(() => this._update(this._TIME_INTERVAL), this._TIME_INTERVAL);
    }

    /**
     * stops the doom loop, freezing the game animation
     */
    stopDoomLoop() {
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
    }

//  _     _            _
// | |__ | | ___   ___| | _____
// | '_ \| |/ _ \ / __| |/ / __|
// | |_) | | (_) | (__|   <\__ \
// |_.__/|_|\___/ \___|_|\_\___/

    get cellSize(): number {
        if (this._cellSize === undefined) {
            return this._cellSize = this._rc.metrics.spacing;
        }
        return this._cellSize;
    }

    /**
     * Returns the position of a cell center
     */
    getCellCenter(xCell: number, yCell: number): Position {
        const ps = this.cellSize;
        return new Position({
            x: xCell * ps + (ps >> 1),
            y: yCell * ps + (ps >> 1)
        });
    }

    /**
     * Returns the coordinates of the cell containing the specified point (in texels)
     */
    clipCell(x: number, y: number): {x: number, y: number} {
        const ps = this.cellSize;
        return {x: x / ps | 0, y: y / ps | 0};
    }

    /**
     * Changes a block (offset, physical code, material)
     * @param x positon of block to change
     * @param y
     * @param ref reference of the block
     */
    alterBlock(x: number, y: number, ref: string) {
        const rc = this._rc;
        const r = this._getRefIndex(ref);
        const m = this._materials[r];
        rc.setCellOffset(x, y, m.offset);
        rc.setCellPhys(x, y, m.phys);
        rc.setCellMaterial(x, y, Number(m.code));
    }

    /**
     * resolves a block action, an action where an entity uses its "push" action on a wall
     * @param entity entity pushing the block
     * @param x block cell coordinate (x axis)
     * @param y block cell coordinate (y axis)
     */
    pushCell(entity: Entity, x: number, y: number) {
        this.openDoor(x, y, true);
        this._tm.entityPushBlock(entity, x, y);
    }

//      _                _
//   __| | ___  ___ __ _| |___
//  / _` |/ _ \/ __/ _` | / __|
// | (_| |  __/ (_| (_| | \__ \
//  \__,_|\___|\___\__,_|_|___/

    /**
     * Removes the decal painted on a block face
     */
    removeDecal(x: number, y: number, face: number) {
        this.surfaces.removeDecal(x, y, face as any);
    }

    /**
     * Rotates the decals of all 4 walls of a block
     */
    rotateDecals(x: number, y: number, bClockWise: boolean) {
        this.surfaces.rotateWallSurfaces(x, y, bClockWise);
    }

    /**
     * Paints the given image on a block face, replacing any previous decal
     */
    setDecal(x: number, y: number, face: number, oImage: HTMLCanvasElement) {
        this.surfaces.setDecal(x, y, face as any, oImage);
        this._rc.shadeSurface(x, y, face as any);
    }

//           _              _       _
//  ___  ___| |__   ___  __| |_   _| | ___ _ __
// / __|/ __| '_ \ / _ \/ _` | | | | |/ _ \ '__|
// \__ \ (__| | | |  __/ (_| | |_| | |  __/ |
// |___/\___|_| |_|\___|\__,_|\__,_|_|\___|_|

    /**
     * Delays a command, just like a setTimeout, but the command will be synced with the doomloop
     * So it will be fired just before rendering process
     * @param pCommand function whose execution is delayed
     * @param nTime delay in millisecond
     * @return delay identifier usable with the "cancelCommand" function
     */
    delayCommand(pCommand: () => void, nTime: number): number {
        if (typeof pCommand !== 'function') {
            throw new Error('delayCommand: first parameter need to be a valid function');
        }
        return this._scheduler.delay(pCommand, nTime);
    }

    /**
     * Cancels a previously delayed command.
     * @param id identifier produced by the delayCommand function
     */
    cancelCommand(id: number) {
        this._scheduler.cancel(id);
    }

//  _
// | |_ __ _  __ _ ___
// | __/ _` |/ _` / __|
// | || (_| | (_| \__ \
//  \__\__,_|\__, |___/
//           |___/

    _tagEnter({entity, command, parameters, remove, x, y}: TagManagerEvent) {
        this._events.emit('tag.' + command + '.enter', {entity, command, operation: 'enter', parameters, remove, x, y});
    }

    _tagLeave({entity, command, parameters, remove, x, y}: TagManagerEvent) {
        this._events.emit('tag.' + command + '.leave', {entity, command, operation: 'leave', parameters, remove, x, y});
    }

    _tagPush({entity, command, parameters, remove, x, y}: TagManagerEvent) {
        this._events.emit('tag.' + command + '.push', {entity, command, operation: 'push', parameters, remove, x, y});
    }

    addTag(x: number, y: number, sTag: string) {
        this._tm.addTag(x, y, sTag);
    }

    tags(x: number, y: number): string[] {
        const tg = this._tm.grid;
        return tg.cell(x, y).map(id => tg.getTag(id));
    }

//  _   _     _       _
// | |_| |__ (_)_ __ | | _____ _ __ ___
// | __| '_ \| | '_ \| |/ / _ \ '__/ __|
// | |_| | | | | | | |   <  __/ |  \__ \
//  \__|_| |_|_|_| |_|_|\_\___|_|  |___/

    /**
     * declares a new thinker class
     * @param sThinker reference of thinker
     * @param pThinker thinker class
     */
    _useThinker(sThinker: string, pThinker: any) {
        this._thinkers[sThinker] = pThinker;
    }

    useThinkers(oThinkers: Record<string, any>, oContext: Record<string, any> = undefined) {
        if (oContext !== undefined) {
            for (const s in oContext) {
                this._thinkerContext[s] = oContext[s];
            }
        }
        for (const sThinker in oThinkers) {
            this._useThinker(sThinker, oThinkers[sThinker]);
        }
    }

    /**
     * this function will extract an item out of a collection
     * @param sItem item key
     * @param oItems collection of items
     * @param sLabel a label in case of error
     */
    _getObjectItem(sItem: string, oItems: Record<string, any>, sLabel: string): any {
        if (typeof oItems !== 'object') {
            throw new Error(`this is not a collection of "${sLabel}"`);
        }
        if (sItem in oItems) {
            return oItems[sItem];
        } else {
            const aItems = Object.keys(oItems);
            if (aItems.length > 0) {
                const sSuggest = suggest(sItem, aItems);
                throw new Error(`There is no such ${sLabel} : "${sItem}". Did you mean "${sSuggest}" ?`);
            } else {
                throw new Error(`No ${sLabel} has been declared so far in the given collection`);
            }
        }
    }

    /**
     * Creates a new instance of a specified thinker class
     * @param sThinker thinker class name to be instanciated, the class must have been previously register with
     * either the method _useThinker(), or the method useThinkers() (with an "s")
     */
    createThinkerInstance(sThinker: string): any {
        try {
            if (!sThinker) {
                sThinker = 'Thinker';
            }
            const pThinker = this._getObjectItem(sThinker, this._thinkers, 'thinker');
            const oThinker = new pThinker();
            oThinker.engine = this;
            oThinker._context = this._thinkerContext;
            return oThinker;
        } catch (e) {
            console.error(e);
            throw new Error('could not instanciate thinker class "' + sThinker + '"');
        }
    }

//                       _
//   __ _ ___ ___  ___| |_ ___
//  / _` / __/ __|/ _ \ __/ __|
// | (_| \__ \__ \  __/ |_\__ \
//  \__,_|___/___/\___|\__|___/

    /**
     * Loads a tileset
     * @param ref reference name
     * @param src url to image
     * @param tileWidth width
     * @param tileHeight height
     * @param bNoShading does not shades tileset
     */
    async loadTileSet(ref: string, src: string, tileWidth: number, tileHeight: number, bNoShading: boolean): Promise<ShadedTileSet> {
        if (ref in this._tilesets) {
            return this._tilesets[ref];
        }
        const oImage = await Canvas.loadCanvas(src);
        const tileset = this._rc.buildTileSet(oImage, tileWidth, tileHeight, bNoShading);
        this._tilesets[ref] = tileset;
        return tileset;
    }

    getTileSet(ref: string): ShadedTileSet | null {
        if (ref in this._tilesets) {
            return this._tilesets[ref];
        } else {
            return null;
        }
    }

    /**
     * Creates a blueprint, using an image which is loaded asynchronously, thus the promise.
     * @param resref new blueprint reference
     * @param bpDef the blueprint structure (symbolic constants already resolved)
     */
    async createBlueprint(resref: string, bpDef: any): Promise<Blueprint> {
        const tsDef = this._declaredTilesets.get(bpDef.tileset);
        if (!tsDef) {
            throw new Error('blueprint "' + resref + '" references a tileset : "' + bpDef.tileset + '" which does not exist');
        }
        const src = tsDef.src;
        const tileWidth = tsDef.width;
        const tileHeight = tsDef.height;
        const bNoShading = ('fx' in bpDef) && bpDef.fx.includes(CONSTS.FX_LIGHT_SOURCE);
        const tileset = await this.loadTileSet(bpDef.tileset, src, tileWidth, tileHeight, bNoShading);
        const bp = new Blueprint();
        bp.tileset = tileset;
        if (('thinker' in bpDef) && !!bpDef.thinker) {
            bp.thinker = bpDef.thinker; // state object : should not be instanciate yet
        } else {
            bp.thinker = 'Thinker';
        }
        if ('animations' in tsDef) {
            const bpa = {};
            tsDef.animations.forEach(a => {
                bpa[a.id] = {
                    start: a.start,
                    length: a.length,
                    loop: a.loop,
                    duration: a.duration,
                    iterations: a.iterations
                };
            });
            bp.animations = bpa;
        }
        if ('data' in bpDef) {
            bp.data = bpDef.data;
        }
        bp.size = bpDef.size;
        bp.lightsource = bpDef.lightsource;
        bp.fx = bpDef.fx || [];
        bp.scale = bpDef.scale || 1;
        bp.ref = bpDef.ref;
        return this._blueprints[resref] = bp;
    }

//             _   _ _   _
//   ___ _ __ | |_(_) |_(_) ___  ___
//  / _ \ '_ \| __| | __| |/ _ \/ __|
// |  __/ | | | |_| | |_| |  __/\__ \
//  \___|_| |_|\__|_|\__|_|\___||___/

    /**
     * Will create a new Entity and will link it into the engine entity collection
     * @param resref resource reference OR id of the blueprint, to create the entity
     * @param position
     */
    createEntity(resref: string, position: PositionData): Entity {
        const rc = this._rc;
        if (resref in this._refs) {
            resref = this._refs[resref];
        }
        if (!(resref in this._blueprints)) {
            const aObjects = Object.keys(this._blueprints);
            const sSuggest = aObjects.length > 0 ? ' Did you mean : "' + suggest(resref, aObjects) + '" ?' : '';
            throw new Error('this blueprint does not exist : "' + resref + '".' + sSuggest);
        }
        const bp = this._blueprints[resref];
        const entity = new Entity();

        // ref
        if (bp.ref) {
            entity.ref = bp.ref;
        }

        // position
        entity.position.set(position);

        // sprite
        const sprite = rc.buildSprite(bp.tileset);
        sprite.scale = bp.scale;

        // visual effects
        bp.fx.forEach(fx => sprite.addFlag(fx));

        // animations
        const animations = bp.animations;
        if (animations) {
            for (const iAnim in animations) {
                const {start = 0, length, loop, duration, iterations} = animations[iAnim];
                sprite.buildAnimation({
                    starts: Array.isArray(start) ? start : [start],
                    length,
                    loop: loop as any,
                    duration,
                    iterations: iterations ?? null
                }, iAnim);
            }
        }

        // thinker
        entity.thinker = this.createThinkerInstance(bp.thinker);
        entity.sprite = sprite;
        entity.size = bp.size;
        entity.data = {
            ...bp.data
        };
        entity.dummy.radius = entity.size;
        entity.dummy.position.set(entity.position.x, entity.position.y);

        // dynamic light
        if (bp.lightsource) {
            this.linkEntityLightSource(
                entity,
                parseFloat(bp.lightsource.v as string),
                parseFloat(bp.lightsource.r0 as string),
                parseFloat(bp.lightsource.r1 as string)
            );
        }

        this._horde.linkEntity(entity);
        this.events.emit('entity.created', {entity});
        return entity;
    }

    destroyEntity(e: Entity) {
        if (this._horde.isEntityLinked(e)) {
            if (e.lightsource) {
                e.lightsource.remove();
                e.lightsource = null;
            }
            this._rc.disposeSprite(e.sprite);
            if (this._smasher.entities.includes(e)) {
                this._smasher.unregisterEntity(e);
            }
            this._horde.unlinkEntity(e);
            this.events.emit('entity.destroyed', {entity: e});
        }
    }

    /**
     * Adds a lightsource to an entity
     * @param entity
     * @param intensity light source intensity
     * @param innerRadius light source inner radius
     * @param outerRadius light source outer radius
     */
    linkEntityLightSource(entity: Entity, intensity: number, innerRadius: number, outerRadius: number) {
        const position = entity.position;
        entity.lightsource = this.createLightSource(
            position.x,
            position.y,
            innerRadius,
            outerRadius,
            intensity
        );
    }

    /**
     * synchronize dummy position and size with its entity
     */
    _syncEntityDummy(entity: Entity) {
        const dummy = entity.dummy;
        const position = entity.position;
        dummy.radius = entity.size;
        dummy.position.set(position.x, position.y);
    }

    /**
     * What to do when an entity is smashed by one or more other entities
     */
    _smashEntity(oEntity: Entity, aSmashers: Entity[]) {
        this.events.emit('entity.hit', {entity: oEntity, hits: aSmashers});
    }

//  _ _       _     _
// | (_) __ _| |__ | |_ ___
// | | |/ _` | '_ \| __/ __|
// | | | (_| | | | | |_\__ \
// |_|_|\__, |_| |_|\__|___/
//      |___/

    /**
     * creates a new light source at the given position, with the given radius and intensity
     * @param x coordinates of the light source center (x axis)
     * @param y coordinates of the light source center (y axis)
     * @param r0 inner radius (where light is at full intensity)
     * @param r1 outer radius (where light is totaly dimmed)
     * @param v light intensity
     */
    createLightSource(x: number, y: number, r0: number, r1: number, v: number): LightHandle {
        return this._rc.addLightSource(x, y, r0, r1, v);
    }

    /**
     * removes a light source previously created by createLightSource
     */
    removeLightSource(oSource: LightHandle) {
        oSource.remove();
    }

//  _                _
// | | _____   _____| |
// | |/ _ \ \ / / _ \ |
// | |  __/\ V /  __/ |
// |_|\___| \_/ \___|_|

    /**
     * Builds a level with the specified content
     * @param data level definition (RCE-100 format)
     * @param extra common blueprints and tilesets definition, and start point index
     */
    async buildLevel(data: RceLevel, extra: BuildLevelExtra | null = null) {
        if (extra === null) {
            extra = {startpoint: 0, blueprints: [], tilesets: []};
        }

        this._refs = {};

        const feedback = (phase: string, progress: number) => {
            this._events.emit('level.loading', {phase, progress});
        };
        feedback('init', 0);

        const BLUEPRINT_COUNT = (data.blueprints?.length ?? 0) + (extra.blueprints?.length ?? 0);
        const OBJECT_COUNT = data.objects?.length ?? 0;
        const TAG_COUNT = data.tags ? 1 : 0;
        const LEVEL_COUNT = 1;
        const ALL_COUNT = LEVEL_COUNT + BLUEPRINT_COUNT + OBJECT_COUNT + TAG_COUNT;
        let PROGRESS = 0;
        const showProgress = (sLabel: string) => {
            feedback(sLabel, ++PROGRESS / ALL_COUNT);
        };

        this.initializeRenderer();
        const rc = this._rc;
        const cvs = this.getRenderingCanvas();
        rc.setScreen({
            width: cvs.width,
            height: cvs.height
        });
        Canvas.setDefaultImageSmoothing(!!data.level.textures.smooth);

        // textures, shading, map, decals, static light sources
        // symbolic constants ("@PHYS_WALL"...) are resolved by the loader
        const nStartPoint = extra.startpoint ?? 0;
        const loaded = await loadLevel(rc, data, {
            loadImage: (src: string) => Canvas.loadCanvas(src),
            blueprints: extra.blueprints ?? [],
            tilesets: extra.tilesets ?? [],
            startpoint: nStartPoint >= 0 && nStartPoint < (data.startpoints?.length ?? 0) ? nStartPoint : 0
        });
        showProgress('loading level');
        this._declaredTilesets = new Map(loaded.declaredTilesets);

        // doors
        this.initializeDoors();

        // creates blueprints
        for (const oThatBP of loaded.unhandled.blueprints as any[]) {
            showProgress('creating blueprints');
            const resref = oThatBP.id;
            const oBP = await this.createBlueprint(resref, oThatBP);
            if (typeof oBP.ref === 'string' && oBP.ref.length > 0) {
                this._refs[oBP.ref] = resref;
            }
        }

        // materials, for alterBlock
        this._materials = {};
        loaded.materials.forEach(m => {
            if (typeof m.ref === 'string' && m.ref.length > 0) {
                const sCode = String(m.code);
                this._refs[m.ref] = sCode;
                this._materials[sCode] = m;
            }
        });

        const nMapSize = rc.getMapSize();
        this._tm.setMapSize(nMapSize);
        this.horde.setMapSize(nMapSize);
        const ps = this.cellSize;
        this.horde.setSectorSize(ps);
        const nSmasherSize = Math.ceil(nMapSize * ps / CONSTS.METRIC_SMASHER_SECTOR_SIZE);
        this._smasher.setSize(nSmasherSize, nSmasherSize);

        // static objects
        for (const o of loaded.unhandled.objects as any[]) {
            const entity = this.createEntity(o.blueprint, o);
            if ('animation' in o && o.animation !== false && o.animation !== null) {
                entity.sprite.setCurrentAnimation(o.animation, 0);
            }
            entity.visible = true;
            showProgress('creating objects');
        }

        // CAMERA : sets initial visor position, and orientation
        const {x, y, z, angle} = loaded.startpoint ?? data.startpoints[0];
        this.camera.position.set({
            x: x * ps + (ps >> 1), // visor coordinates (x-axis)
            y: y * ps + (ps >> 1), // visor coordinates (y-axis)
            angle, // looking angle
            z // visor altitude (1 is the default object)
        });
        const oCameraData: any = loaded.unhandled.camera ?? {};
        this.camera.thinker = this.createThinkerInstance(oCameraData.thinker || this._config.cameraThinker);
        this._startpoints = loaded.startpoints.slice();

        // TAGS
        showProgress('analyzing tags');
        for (const tagEntry of loaded.unhandled.tags) {
            tagEntry.tags.forEach(t => this.addTag(tagEntry.x, tagEntry.y, t));
        }

        feedback('done', 1);
        this.events.emit('level.load');
    }

//      _        _
//  ___| |_ __ _| |_ ___
// / __| __/ _` | __/ _ \
// \__ \ || (_| | ||  __/
// |___/\__\__,_|\__\___|

    getEngineState(): EngineState {
        const {doors, locks} = this._doors.state;
        return {
            doors,
            locks,
            tags: this._tm.grid.state,
            time: this.getTime()
        };
    }

    setEngineState(value: EngineState) {
        const {doors, locks, tags, time} = value;
        this._time = time;
        this._tm.grid.state = tags;
        this._doors.setState({doors, locks});
    }

    getDoorManagerState() {
        return this._doors.state.doors;
    }

    setDoorManagerState(value: any[]) {
        this._doors.setState({doors: value, locks: this._doors.state.locks});
    }
}

export default Engine;

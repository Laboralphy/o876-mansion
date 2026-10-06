import { TagGrid, type TagGridState } from '@laboralphy/raycaster386/simulation';
import Events from '@/libs/events';
import type Entity from './Entity';

/**
 * Adapter over the simulation TagGrid, exposing the API of the original libs/tag-grid
 * which the game code still uses : cell(), getTag(), getTagCommand(), iterate()...
 */
export class TagGridAdapter {
    readonly grid = new TagGrid();

    get width(): number {
        return this.grid.width;
    }

    get height(): number {
        return this.grid.height;
    }

    setSize(w: number, h: number) {
        this.grid.setSize(w, h);
    }

    addTag(x: number, y: number, tag: string): number {
        return this.grid.addTag(x, y, tag);
    }

    removeTag(x: number, y: number, id: number): boolean {
        return this.grid.removeTag(x, y, id);
    }

    removeTagRegion(x: number, y: number, id: number): number {
        return this.grid.removeTagRegion(x, y, id);
    }

    /**
     * returns the list of tag ids at the given cell
     */
    cell(x: number, y: number): number[] {
        return this.grid.idsAt(x, y).slice();
    }

    getTag(id: number): string | undefined {
        return this.grid.tagOf(id);
    }

    /**
     * returns the tag, split into its command and parameters
     */
    getTagCommand(id: number): string[] {
        return this.grid.commandOf(id);
    }

    /**
     * calls f for each cell holding at least one tag
     */
    iterate(f: (x: number, y: number) => void) {
        const g = this.grid;
        for (let y = 0, h = g.height; y < h; ++y) {
            for (let x = 0, w = g.width; x < w; ++x) {
                if (g.idsAt(x, y).length > 0) {
                    f(x, y);
                }
            }
        }
    }

    visit(fromX: number, fromY: number, toX: number, toY: number) {
        return this.grid.visit(fromX, fromY, toX, toY);
    }

    get state(): TagGridState {
        return this.grid.state;
    }

    set state(value: TagGridState) {
        this.grid.state = value;
    }
}

export interface TagManagerEvent {
    entity: Entity;
    x: number;
    y: number;
    command: string;
    parameters: string[];
    remove: () => number;
}

/**
 * Turns entities' cell changes into tag "enter" / "leave" events,
 * and block pushes into tag "push" events.
 */
class TagManager {
    // public : the game reads engine._tm._tg directly
    readonly _tg = new TagGridAdapter();
    private readonly _events = new Events();

    get grid(): TagGridAdapter {
        return this._tg;
    }

    get events(): Events {
        return this._events;
    }

    addTag(x: number, y: number, tag: string): number {
        return this._tg.addTag(x, y, tag);
    }

    setMapSize(n: number) {
        this._tg.setSize(n, n);
    }

    _checkEntityContext(entity: Entity) {
        const d = entity.data;
        if (!d.tagman) {
            d.tagman = {
                xSector: -1,
                ySector: -1
            };
        }
    }

    hordeProcess(engine: any) {
        const tg = this._tg;
        const ps = engine.cellSize;
        const process = (e: Entity) => {
            this._checkEntityContext(e);
            const dtm = e.data.tagman;
            const xSector = e.position.x / ps | 0;
            const ySector = e.position.y / ps | 0;
            if (xSector !== dtm.xSector || ySector !== dtm.ySector) {
                const v = tg.visit(dtm.xSector, dtm.ySector, xSector, ySector);
                v.left.forEach(id => this.emitEvent(id, 'tagleave', e, dtm.xSector, dtm.ySector));
                v.entered.forEach(id => this.emitEvent(id, 'tagenter', e, xSector, ySector));
            }
            dtm.xSector = xSector;
            dtm.ySector = ySector;
        };
        process(engine.camera);
        engine.horde.entities.forEach(e => {
            if (e !== engine.camera) {
                process(e);
            }
        });
    }

    /**
     * If the specified cell holds tags, triggers them
     */
    entityPushBlock(entity: Entity, xSector: number, ySector: number) {
        this._tg.cell(xSector, ySector).forEach(id => this.emitEvent(id, 'tagpush', entity, xSector, ySector));
    }

    emitEvent(id: number, sType: string, entity: Entity, x: number, y: number) {
        const tg = this._tg;
        const [command, ...parameters] = tg.getTagCommand(id);
        const event: TagManagerEvent = {
            entity,
            x, y,
            command,
            parameters,
            remove: () => tg.removeTagRegion(x, y, id)
        };
        this._events.emit(sType, event);
    }
}

export default TagManager;

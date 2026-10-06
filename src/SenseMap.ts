import { LightMap, type LightSource } from '@laboralphy/raycaster386';
import * as CONSTS from '@/consts';

/**
 * The sense map is a light map where light sources are "supernatural presences".
 * The player can sense these presences when standing near them.
 */
class SenseMap {
    private _lightMap: LightMap | null = null;
    private _lightSources: Record<string, LightSource> | null = null;
    private _grid: Float32Array | null = null;
    private _size = 0;
    private readonly _removed = new Set<string>();

    /**
     * Replaces the light map grid with a new one
     * @param nSize
     */
    init(nSize: number) {
        this._lightMap = new LightMap();
        this._lightMap.setSize(nSize << 1, nSize << 1);
        this._lightSources = {};
        this._grid = new Float32Array(nSize * nSize);
        this._size = nSize;
    }

    /**
     * Adds a source
     */
    addSense(ref: string, x: number, y: number) {
        if (ref in this._lightSources) {
            throw new Error('reference ' + ref + ' is already used in sens light map');
        }
        this._lightSources[ref] = this._lightMap.addSource(x, y, 1, CONSTS.PLAYER_SENSE_DISTANCE, 1);
    }

    /**
     * Removes a source
     */
    removeSense(ref: string) {
        const lsFound = this._lightSources[ref];
        if (lsFound) {
            this._lightMap.removeSource(lsFound);
            this.computeMap();
            delete this._lightSources[ref];
            this._removed.add(ref);
        }
    }

    /**
     * Traces all sources and updates the grid.
     * LightMap.filter only reports the cells that changed since the previous call,
     * so the grid keeps its values between calls.
     */
    computeMap() {
        const n = this._size;
        const grid = this._grid;
        this._lightMap.traceAllSources();
        this._lightMap.filter((x, y, v) => {
            if (x >= 0 && y >= 0 && x < n && y < n) {
                grid[y * n + x] = v;
            }
        });
    }

    getSenseAt(x: number, y: number): number {
        const n = this._size;
        const xg = x >> 1;
        const yg = y >> 1;
        if (xg < 0 || yg < 0 || xg >= n || yg >= n) {
            return 0;
        }
        return this._grid[yg * n + xg] || 0;
    }

    get state() {
        return {
            removed: [...this._removed]
        };
    }

    set state(value) {
        value.removed.forEach(v => this.removeSense(v));
    }
}

export default SenseMap;

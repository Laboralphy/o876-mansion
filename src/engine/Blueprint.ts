import type { AnimLoop, ShadedTileSet } from '@laboralphy/raycaster386';

export interface BlueprintAnimation {
    start: number | number[];
    length: number;
    loop: AnimLoop;
    duration: number;
    iterations?: number;
}

/**
 * An animation, as declared in a tileset definition
 */
export interface TilesetAnimation extends BlueprintAnimation {
    id: string;
}

export interface BlueprintLightSource {
    r0: number | string;
    r1: number | string;
    v: number | string;
}

class Blueprint {
    tileset: ShadedTileSet | null = null;
    thinker: string | null = null;
    animations: Record<string, BlueprintAnimation> | null = null;
    size = 0; // physical half size (radius)
    fx: number[] = [];
    data: Record<string, any> = {};
    lightsource: BlueprintLightSource | null = null;
    scale = 1;
    ref = '';
}

export default Blueprint;

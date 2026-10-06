import type { ShadedTileSet } from '@laboralphy/raycaster386';

export interface BlueprintAnimation {
    start: number | number[];
    length: number;
    loop: number;
    duration: number;
    iterations?: number;
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

/**
 * Types of the game data (data/*.json)
 */
import type { RceBlueprint, RceTileset } from '@laboralphy/raycaster386';

export type { RceBlueprint, RceTileset };

/**
 * Effect of a ghost missile on the player
 */
export type MissileEffect = 'damage' | 'blindness' | 'confusion';

/**
 * A missile a ghost may shoot (the "missile" entries of data/ghosts/*.json)
 */
export interface MissileData {
    resref: string; // blueprint of the missile
    speed?: number;
    effect?: MissileEffect;
    duration?: number; // effect duration (ms), for blindness and confusion
    damage?: number;
}

/**
 * A ghost definition (data/ghosts/*.json, the id being the file name)
 * A ghost may extend another ghost : it then only declares what differs (see Game.getOneGhostData).
 */
export interface GhostData {
    extends?: string; // id of the extended ghost
    tileset?: string;
    level?: number;
    speed?: number;
    vitality?: number;
    power?: number; // damage dealt to the player
    score?: number;
    thinker?: string; // thinker class name
    soundset?: string;
    missile?: MissileData[] | null;
}

/**
 * A ghost definition, with its id
 */
export interface GhostEntry extends GhostData {
    id: string;
}

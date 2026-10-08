/**
 * Game level types : level mutations and saved states
 */
import type { EngineState } from '@/engine/Engine';
import type Entity from '@/engine/Entity';
import type Position from '@/engine/Position';
import type { SenseMapState } from '@/SenseMap';
import type { AlbumState } from '@/stores/album';
import type { LogicState } from '@/stores/logic';

/**
 * A change made to the decals of a block, during the game.
 * They are recorded so that they can be replayed when the level is restored.
 * - del : decals removed from some sides
 * - rot : decals of the 4 walls rotated
 * - app : a decal (a tileset reference) applied on some sides
 * "sides" is a bit mask : bit i set = wall face i
 */
export type DecalMutation =
    | { op: 'del', x: number, y: number, sides: number }
    | { op: 'rot', x: number, y: number, cw: boolean }
    | { op: 'app', x: number, y: number, sides: number, ref: string };

/**
 * Changes made to the current level, since it was loaded
 */
export interface LevelMutations {
    level: string; // current level name, '' before the first level
    decals: DecalMutation[];
}

/**
 * Position and orientation of the player
 */
export interface PlayerState {
    x: number;
    y: number;
    angle: number;
}

/**
 * State of a level, kept in memory when the player leaves it (see Game.loadLevel)
 */
export interface LevelState extends EngineState {
    decals: DecalMutation[];
    senses: SenseMapState;
}

/**
 * State of a level, as serialized by Serializer.saveLevelState
 */
export interface SerializedLevelState extends LevelState {
    version: number;
    type: 'level';
    level: string;
    player: PlayerState;
}

/**
 * State of the player progression (inventory, score, album)
 */
export interface AlbumLogicState {
    logic: LogicState;
    album: AlbumState;
}

/**
 * A named cell of the level, declared by a "locator" tag (see scripts.d/tag/locator.ts)
 */
export interface Locator {
    ref: string;
    cell: { x: number, y: number };
    position: Position;
}

/**
 * A tag of the level, split into its components (see Game.getTagsAt)
 */
export interface TagEntry {
    x: number;
    y: number;
    tag: string[]; // [command, ...parameters]
    id: number; // tag id in the tag grid
    remove: () => void;
}

/**
 * A "photo" tag of the aimed cell (see Game.getAimedCellPhotoTags)
 */
export interface PhotoTag {
    x: number;
    y: number;
    id: number;
    ref: string; // photo script reference (scripts.d/photo)
    args: string[];
}

/**
 * Scripts run on ghost events (entity.data.events), by script name (e.g. 'event.m0_red_sigil_unlock')
 */
export interface EntityEvents {
    death: string | null;
    attack: string | null;
    damaged: string | null;
}

export type EntityEventName = keyof EntityEvents;

/**
 * Parameters of Game.soundEvent, depending on the event
 */
export interface SoundEventParams {
    entity?: Entity; // ghost sounds
    x?: number; // door and ambiance sounds : cell
    y?: number;
    item?: { type: string }; // pickup sound : the sound is named after the item type
    file?: string; // ambiance sounds
    distance?: number; // ambiance loop : reference distance
}

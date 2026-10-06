/**
 * Engine constants.
 * Renderer constants (PHYS_*, FX_*, FACE_*, ANIM_LOOP_*...) come from @laboralphy/raycaster386,
 * door/neighbor constants from its simulation tier. Only the constants that the library
 * does not define (they belong to the game tier) are declared here.
 */
export {
    DOOR_PHASE_CLOSED,
    DOOR_PHASE_OPENING,
    DOOR_PHASE_OPEN,
    DOOR_PHASE_CLOSING,
    DOOR_PHASE_DONE,
    DOOR_SLIDING_DURATION,
    DOOR_MAINTAIN_DURATION,
    DOOR_SECURITY_INTERVAL,
    CELL_NEIGHBOR_SIDE,
    CELL_NEIGHBOR_CORNER,
    CELL_NEIGHBOR_SELF
} from '@laboralphy/raycaster386/simulation';
export {
    PHYS_NONE,
    PHYS_WALL,
    PHYS_FIRST_DOOR,
    PHYS_DOOR_UP,
    PHYS_CURT_UP,
    PHYS_DOOR_DOWN,
    PHYS_CURT_DOWN,
    PHYS_DOOR_LEFT,
    PHYS_DOOR_RIGHT,
    PHYS_DOOR_DOUBLE,
    PHYS_LAST_DOOR,
    PHYS_SECRET_BLOCK,
    PHYS_TRANSPARENT_BLOCK,
    PHYS_INVISIBLE_BLOCK,
    PHYS_OFFSET_BLOCK,
    FACE_WEST,
    FACE_SOUTH,
    FACE_EAST,
    FACE_NORTH,
    FACE_FLOOR,
    FACE_CEILING,
    ANIM_LOOP_NONE,
    ANIM_LOOP_FORWARD,
    ANIM_LOOP_YOYO,
    FX_NONE,
    FX_LIGHT_ADD,
    FX_LIGHT_SOURCE,
    FX_ALPHA_75,
    FX_ALPHA_50,
    FX_ALPHA_25,
    FX_DIM0,
    FX_ALPHA,
    METRIC_LIGHTMAP_SCALE,
    SPRITE_DIRECTION_COUNT
} from '@laboralphy/raycaster386';

// these value are expressed in texels
export const METRIC_CAMERA_DEFAULT_SIZE = 24; // default size for visor entity
export const METRIC_SMASHER_SECTOR_SIZE = 128; // default size for collider sector
export const METRIC_PUSH_DISTANCE = 64; // distance of pushing action

// These are collision channels... for example if an entity has a
// collision mask of 3, it can hit creatures and missiles
// if an entity has a collision of 1, hit can only hit creatures, not missiles.
export const COLLISION_CHANNEL_CREATURE = 1;  // collision channel for normal tangible creature
export const COLLISION_CHANNEL_MISSILE = 2;   // collision channel for normal exploding missile of any type

// decal position alignnement presets
export const DECAL_ALIGN_TOP_LEFT = 7;
export const DECAL_ALIGN_TOP = 8;
export const DECAL_ALIGN_TOP_RIGHT = 9;
export const DECAL_ALIGN_LEFT = 4;
export const DECAL_ALIGN_CENTER = 5;
export const DECAL_ALIGN_RIGHT = 6;
export const DECAL_ALIGN_BOTTOM_LEFT = 1;
export const DECAL_ALIGN_BOTTOM = 2;
export const DECAL_ALIGN_BOTTOM_RIGHT = 3;

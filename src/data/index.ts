/**
 * Game data registry.
 * Statically imports every json file (formerly gathered at build time by webpack's require.context)
 */
import type { RceBlueprint, RceTileset, GhostData } from './types';
import type { ItemData } from '@/stores/logic/types';
import blueprints_o_flame from './blueprints/o_flame.json';
import blueprints_o_flare from './blueprints/o_flare.json';
import blueprints_p_ghost_magbolt from './blueprints/p_ghost_magbolt.json';
import blueprints_p_homing_magbolt from './blueprints/p_homing_magbolt.json';
import blueprints_p_linear_magbolt from './blueprints/p_linear_magbolt.json';
import blueprints_p_white_magbolt from './blueprints/p_white_magbolt.json';
import blueprints_p_yellow_magbolt from './blueprints/p_yellow_magbolt.json';
import blueprints_u_lamp from './blueprints/u_lamp.json';
import blueprints_u_visor from './blueprints/u_visor.json';
import blueprints_w_cowled_skull from './blueprints/w_cowled_skull.json';
import blueprints_w_unfortunate_investigator from './blueprints/w_unfortunate_investigator.json';
import blueprints_w_walkingaway_cultist from './blueprints/w_walkingaway_cultist.json';
import blueprints_w_watching_cultist from './blueprints/w_watching_cultist.json';
import tilesets_g_angry_girl from './tilesets/g_angry_girl.json';
import tilesets_g_banshee from './tilesets/g_banshee.json';
import tilesets_g_bashed_boy from './tilesets/g_bashed_boy.json';
import tilesets_o_flame from './tilesets/o_flame.json';
import tilesets_o_flare from './tilesets/o_flare.json';
import tilesets_p_blastbolt from './tilesets/p_blastbolt.json';
import tilesets_p_firebolt_0 from './tilesets/p_firebolt_0.json';
import tilesets_p_firebolt_yellow from './tilesets/p_firebolt_yellow.json';
import tilesets_p_raging_spirit from './tilesets/p_raging_spirit.json';
import tilesets_u_lamp from './tilesets/u_lamp.json';
import tilesets_u_visor from './tilesets/u_visor.json';
import tilesets_w_cowled_skull from './tilesets/w_cowled_skull.json';
import tilesets_w_unfortunate_investigator from './tilesets/w_unfortunate_investigator.json';
import tilesets_w_walkingaway_cultist from './tilesets/w_walkingaway_cultist.json';
import tilesets_w_watching_cultist from './tilesets/w_watching_cultist.json';
import ghosts_g_angry_girl_0 from './ghosts/g_angry_girl_0.json';
import ghosts_g_banshee_0 from './ghosts/g_banshee_0.json';
import ghosts_g_bashed_boy_0 from './ghosts/g_bashed_boy_0.json';
import ghosts_g_test from './ghosts/g_test.json';
import ghosts_g_test_2 from './ghosts/g_test_2.json';
import items_book_glyphs from './items/book_glyphs.json';
import items_itm_camera from './items/itm_camera.json';
import items_key_cabin from './items/key_cabin.json';
import items_note_m1_ritual_notes from './items/note_m1_ritual_notes.json';

const RAW_BLUEPRINTS: Record<string, object> = {
    o_flame: blueprints_o_flame,
    o_flare: blueprints_o_flare,
    p_ghost_magbolt: blueprints_p_ghost_magbolt,
    p_homing_magbolt: blueprints_p_homing_magbolt,
    p_linear_magbolt: blueprints_p_linear_magbolt,
    p_white_magbolt: blueprints_p_white_magbolt,
    p_yellow_magbolt: blueprints_p_yellow_magbolt,
    u_lamp: blueprints_u_lamp,
    u_visor: blueprints_u_visor,
    w_cowled_skull: blueprints_w_cowled_skull,
    w_unfortunate_investigator: blueprints_w_unfortunate_investigator,
    w_walkingaway_cultist: blueprints_w_walkingaway_cultist,
    w_watching_cultist: blueprints_w_watching_cultist
};

const RAW_TILESETS: Record<string, object> = {
    g_angry_girl: tilesets_g_angry_girl,
    g_banshee: tilesets_g_banshee,
    g_bashed_boy: tilesets_g_bashed_boy,
    o_flame: tilesets_o_flame,
    o_flare: tilesets_o_flare,
    p_blastbolt: tilesets_p_blastbolt,
    p_firebolt_0: tilesets_p_firebolt_0,
    p_firebolt_yellow: tilesets_p_firebolt_yellow,
    p_raging_spirit: tilesets_p_raging_spirit,
    u_lamp: tilesets_u_lamp,
    u_visor: tilesets_u_visor,
    w_cowled_skull: tilesets_w_cowled_skull,
    w_unfortunate_investigator: tilesets_w_unfortunate_investigator,
    w_walkingaway_cultist: tilesets_w_walkingaway_cultist,
    w_watching_cultist: tilesets_w_watching_cultist
};

const RAW_GHOSTS: Record<string, object> = {
    g_angry_girl_0: ghosts_g_angry_girl_0,
    g_banshee_0: ghosts_g_banshee_0,
    g_bashed_boy_0: ghosts_g_bashed_boy_0,
    g_test: ghosts_g_test,
    g_test_2: ghosts_g_test_2
};

const RAW_ITEMS: Record<string, object> = {
    book_glyphs: items_book_glyphs,
    itm_camera: items_itm_camera,
    key_cabin: items_key_cabin,
    note_m1_ritual_notes: items_note_m1_ritual_notes
};

/**
 * Turns a collection of json definitions, indexed by id (the file name), into an array of definitions
 * having an "id" property.
 * The json files are not validated : their shape is trusted to be T.
 */
function makeArrayFromObject<T extends { id: string | number }>(oObject: Record<string, object>): T[] {
    const aArray: T[] = [];
    for (const [id, value] of Object.entries(oObject)) {
        aArray.push({
            id,
            ...value
        } as T);
    }
    return aArray;
}

const BLUEPRINTS = makeArrayFromObject<RceBlueprint>(RAW_BLUEPRINTS);
const TILESETS = makeArrayFromObject<RceTileset>(RAW_TILESETS);
const GHOSTS = RAW_GHOSTS as Record<string, GhostData>;
const ITEMS = makeArrayFromObject<ItemData>(RAW_ITEMS);

export default {
    BLUEPRINTS,
    TILESETS,
    GHOSTS,
    ITEMS
};

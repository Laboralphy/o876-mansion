/**
 * French strings.
 * Statically imports every json file (formerly gathered at build time by webpack's require.context)
 */
import GENERAL from './general.json';
import photos_clue_m1_secret_pass from './photos/clue_m1_secret_pass.json';
import photos_m0_bloody_deadend from './photos/m0_bloody_deadend.json';
import photos_m0_book_glyphs from './photos/m0_book_glyphs.json';
import photos_m0_fire_place from './photos/m0_fire_place.json';
import photos_m1_lake_view from './photos/m1_lake_view.json';
import photos_p_cowled_skull from './photos/p_cowled_skull.json';
import photos_w_cowled_skull from './photos/w_cowled_skull.json';
import photos_w_unfortunate_investigator from './photos/w_unfortunate_investigator.json';
import items_book_glyphs from './items/book_glyphs.json';
import items_itm_camera from './items/itm_camera.json';
import items_key_cabin from './items/key_cabin.json';
import notes_commands from './notes/commands.json';
import notes_how_to_hunt_ghosts from './notes/how_to_hunt_ghosts.json';
import notes_look_for_books from './notes/look_for_books.json';
import notes_look_for_paintings from './notes/look_for_paintings.json';
import notes_note_m1_ritual_notes from './notes/note_m1_ritual_notes.json';
import notes_story_so_far from './notes/story_so_far.json';

const PHOTOS: Record<string, any> = {
    clue_m1_secret_pass: photos_clue_m1_secret_pass,
    m0_bloody_deadend: photos_m0_bloody_deadend,
    m0_book_glyphs: photos_m0_book_glyphs,
    m0_fire_place: photos_m0_fire_place,
    m1_lake_view: photos_m1_lake_view,
    p_cowled_skull: photos_p_cowled_skull,
    w_cowled_skull: photos_w_cowled_skull,
    w_unfortunate_investigator: photos_w_unfortunate_investigator
};

const ITEMS: Record<string, any> = {
    book_glyphs: items_book_glyphs,
    itm_camera: items_itm_camera,
    key_cabin: items_key_cabin
};

const NOTES: Record<string, any> = {
    commands: notes_commands,
    how_to_hunt_ghosts: notes_how_to_hunt_ghosts,
    look_for_books: notes_look_for_books,
    look_for_paintings: notes_look_for_paintings,
    note_m1_ritual_notes: notes_note_m1_ritual_notes,
    story_so_far: notes_story_so_far
};

const STRINGS: Record<string, any> = {
    ...GENERAL,
    PHOTOS,
    ITEMS,
    NOTES
};

export default STRINGS;

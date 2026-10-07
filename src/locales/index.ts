/**
 * Translation resources, by language then by namespace.
 * Photos, items and notes have one JSON file per entry, gathered here with static imports.
 * - common : general interface strings
 * - photos : <photo ref>.title, <photo ref>.description
 * - items  : <item ref>.name, <item ref>.description
 * - notes  : <note ref>.title, <note ref>.description
 */
import en_common from './en/common.json';
import fr_common from './fr/common.json';
import fr_photos_clue_m1_secret_pass from './fr/photos/clue_m1_secret_pass.json';
import fr_photos_m0_bloody_deadend from './fr/photos/m0_bloody_deadend.json';
import fr_photos_m0_book_glyphs from './fr/photos/m0_book_glyphs.json';
import fr_photos_m0_fire_place from './fr/photos/m0_fire_place.json';
import fr_photos_m1_lake_view from './fr/photos/m1_lake_view.json';
import fr_photos_p_cowled_skull from './fr/photos/p_cowled_skull.json';
import fr_photos_w_cowled_skull from './fr/photos/w_cowled_skull.json';
import fr_photos_w_unfortunate_investigator from './fr/photos/w_unfortunate_investigator.json';
import fr_items_book_glyphs from './fr/items/book_glyphs.json';
import fr_items_itm_camera from './fr/items/itm_camera.json';
import fr_items_key_cabin from './fr/items/key_cabin.json';
import fr_notes_commands from './fr/notes/commands.json';
import fr_notes_how_to_hunt_ghosts from './fr/notes/how_to_hunt_ghosts.json';
import fr_notes_look_for_books from './fr/notes/look_for_books.json';
import fr_notes_look_for_paintings from './fr/notes/look_for_paintings.json';
import fr_notes_note_m1_ritual_notes from './fr/notes/note_m1_ritual_notes.json';
import fr_notes_story_so_far from './fr/notes/story_so_far.json';

const en = {
    common: en_common
};

const fr_photos = {
    clue_m1_secret_pass: fr_photos_clue_m1_secret_pass,
    m0_bloody_deadend: fr_photos_m0_bloody_deadend,
    m0_book_glyphs: fr_photos_m0_book_glyphs,
    m0_fire_place: fr_photos_m0_fire_place,
    m1_lake_view: fr_photos_m1_lake_view,
    p_cowled_skull: fr_photos_p_cowled_skull,
    w_cowled_skull: fr_photos_w_cowled_skull,
    w_unfortunate_investigator: fr_photos_w_unfortunate_investigator
};

const fr_items = {
    book_glyphs: fr_items_book_glyphs,
    itm_camera: fr_items_itm_camera,
    key_cabin: fr_items_key_cabin
};

const fr_notes = {
    commands: fr_notes_commands,
    how_to_hunt_ghosts: fr_notes_how_to_hunt_ghosts,
    look_for_books: fr_notes_look_for_books,
    look_for_paintings: fr_notes_look_for_paintings,
    note_m1_ritual_notes: fr_notes_note_m1_ritual_notes,
    story_so_far: fr_notes_story_so_far
};

const fr = {
    common: fr_common,
    photos: fr_photos,
    items: fr_items,
    notes: fr_notes
};

const resources = {
    en,
    fr
};

export default resources;

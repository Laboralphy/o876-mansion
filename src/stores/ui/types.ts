import type { ItemType } from '../logic/types';

/**
 * Tabs of the UI frame, see components/Sidebar.vue
 */
export type MainTab = 'album' | 'inv' | 'notes' | 'settings';

/**
 * Tabs of the inventory, see components/ItemTypes.vue
 */
export type InventoryTab = 'all' | ItemType;

/**
 * Document categories, see components/Notes.vue
 */
export type NoteType = 'note' | 'journal' | 'hint';

export interface Note {
    ref: string; // translation reference (notes namespace)
    type: NoteType;
    read: boolean;
    date: number; // used for sorting
}

/**
 * A popup message, waiting in the queue
 */
export interface PopupMessage {
    text: string;
    icon: string; // icon url, or '' for no icon
    time: number; // display duration (ms), computed from the text length
}

export interface PopupPayload {
    text: string;
    icon: string;
}

/**
 * Details of the last photo shot
 */
export interface ShotPayload {
    value: number; // score
    energy: number; // energy available during the shot
    distance: number; // distance of the ghost
    angle: number; // precision of the shot (1 = ghost at the center)
    targets: number; // number of ghosts in the shot
    shutter: boolean; // the shot was taken during a "shutter chance"
    damage?: number; // damage dealt to the ghosts
}

/**
 * Content of the photo/item/note details panel
 */
export interface PhotoDetailsPayload {
    visible: boolean;
    title?: string;
    content?: string; // image url
    description?: string[]; // paragraphs (html)
    value?: number;
}

export interface NoteEntryPayload {
    ref: string;
    type: NoteType;
}

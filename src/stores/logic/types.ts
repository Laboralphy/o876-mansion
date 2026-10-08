/**
 * Item categories, see components/ItemTypes.vue
 */
export type ItemType = 'plot' | 'key' | 'book' | 'note';

/**
 * Item definition (data/items/*.json, the id being the file name)
 */
export interface ItemData {
    id: string;
    type: ItemType;
    icon: string; // see assets/icons
    thumbnail: string; // see assets/uigfx/thumbnails
    value: number; // score
}

/**
 * An inventory entry : how many items of a kind the player owns
 */
export interface InventoryEntry {
    item: string;
    count: number;
}

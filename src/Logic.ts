import * as MUTATIONS from '@/stores/logic/mutation-types';
import * as ACTIONS from '@/stores/logic/action-types';
import StoreAbstract from "@/StoreAbstract";
import type { Pinia } from 'pinia';
import type Entity from '@/engine/Entity';
import type { ItemData, InventoryEntry } from '@/stores/logic/types';

class Logic extends StoreAbstract<'logic'> {
    constructor(store: Pinia) {
        super('logic');
        this.store = store;
    }

    /**
     * Fetch item data
     */
    loadData() {
        this.dispatch(ACTIONS.LOAD_ITEMS);
    }

    /**
     * Return data about an item
     * @param ref item reference
     */
    getItemData(ref: string): ItemData {
        const items = this.prop('getItemData');
        const item = items.find(x => x.id === ref);
        if (!item) {
            throw new Error('This item could not be found : "' + ref + '"');
        }
        return item;
    }

    /**
     * Adds a quest items into player inventory
     * @param ref item reference
     */
    addInventoryItem(ref: string) {
        this.commit(MUTATIONS.ADD_INVENTORY_ITEM, {ref});
    }

    /**
     * Removes a quest items from player inventory
     * @param ref item reference
     */
    removeInventoryItem(ref: string) {
        this.commit(MUTATIONS.REMOVE_INVENTORY_ITEM, {ref});
    }

    /**
     * Tests if player possess a defined quest items
     * @param ref item reference
     * @return the inventory entry (truthy) if the player owns the item, undefined otherwise
     */
    hasInventoryItem(ref: string): InventoryEntry | undefined {
        return this
            .prop('getInventoryItems')
            .find(({ item }) => ref === item);
    }

    /**
     * The player is hurt by a ghost
     * @param ghost the ghost entity, whose data.power is the base damage
     * @param nMultiplier damage multiplier
     */
    damagePlayer(ghost: Entity, nMultiplier = 1) {
        const nPower = ghost.data.power;
        const nDamage = Math.floor(nPower * nMultiplier);
        this.commit(MUTATIONS.MODIFY_PLAYER_HP, {value: -nDamage});
    }

    isPlayerDead(): boolean {
        return this.prop('isPlayerDead');
    }

    incScore(value: number) {
        return this.commit(MUTATIONS.INC_SCORE, {value})
    }
}

export default Logic;

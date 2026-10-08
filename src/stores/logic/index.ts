import { defineStore } from 'pinia';
import state from './state';
import * as TYPES from './mutation-types';
import * as ACTIONS from './action-types';
import DATA from '@/data';
import type { ItemData, InventoryEntry } from './types';
import type { ValuePayload, RefPayload, ContentPayload } from '../payloads';

export type LogicState = ReturnType<typeof state>;

export const useLogicStore = defineStore('logic', {
    state,

    getters: {
        getInventoryItems: (state): InventoryEntry[] => {
            const oItems: Record<string, number> = {};
            state.player.inventory.forEach(item => {
                if (item in oItems) {
                    ++oItems[item];
                } else {
                    oItems[item] = 1;
                }
            });
            const aItems: InventoryEntry[] = [];
            for (const item in oItems) {
                aItems.push({ item, count: oItems[item] });
            }
            return aItems;
        },
        getItemData: state => state.data.items,

        getPlayerAttributeHP: state => state.player.attributes.hp,
        getPlayerAttributeHPMax: state => state.player.attributes.hpMax,
        isPlayerDead: state => state.player.attributes.hp <= 0,

        // pinia calls getters with the store itself as "state" : return the raw state only
        getStateContent(): LogicState {
            return this.$state;
        },

        getInventoryTotalValue: state => state.player.inventory.map(sItemInv => {
            const oItemFound = state.data.items.find(itd => itd.id === sItemInv);
            if (oItemFound) {
                return oItemFound.value || 0;
            } else {
                console.warn('weird : this item is in player inventory but not defined in item data :', sItemInv);
                return 0;
            }
        }).reduce((prev, curr) => prev + curr, 0),

        getCombatScore: state => state.data.score
    },

    actions: {
        /**
         * Adds a quest item to the player inventory
         * @param ref reference of the quest item
         */
        [TYPES.ADD_INVENTORY_ITEM]({ref}: RefPayload) {
            const qi = this.player.inventory;
            if (!qi.includes(ref)) {
                qi.push(ref);
            }
        },

        /**
         * Removes a quest item from the player inventory
         * @param ref reference of the quest item
         */
        [TYPES.REMOVE_INVENTORY_ITEM]({ref}: RefPayload) {
            const qi = this.player.inventory;
            const n = qi.indexOf(ref);
            if (n >= 0) {
                qi.splice(n, 1);
            }
        },

        /**
         * Define all the items available in game
         */
        [TYPES.DEFINE_ITEMS]({items}: { items: ItemData[] }) {
            items.forEach(x => this.data.items.push(x));
        },

        /**
         * Change player HP value
         */
        [TYPES.SET_PLAYER_HP]({value}: ValuePayload<number>) {
            // value is ranged between 0 and hpMax
            this.player.attributes.hp = Math.min(this.player.attributes.hpMax, Math.max(0, value));
        },

        /**
         * Define maximum player HP value
         */
        [TYPES.SET_PLAYER_MAX_HP]({value}: ValuePayload<number>) {
            // value won't be below 1
            this.player.attributes.hpMax = Math.max(1, value);
        },

        [TYPES.MODIFY_PLAYER_HP]({value}: ValuePayload<number>) {
            const attr = this.player.attributes;
            const nHP = attr.hp + value;
            attr.hp = Math.min(attr.hpMax, Math.max(0, nHP));
        },

        [TYPES.SET_STATE_CONTENT]({content}: ContentPayload<LogicState>) {
            // top level keys are replaced as a whole (restoring a saved state), not deep-merged
            this.$patch((state: LogicState) => {
                Object.assign(state, content);
            });
        },

        [TYPES.INC_SCORE]({value}: ValuePayload<number | string>) {
            this.data.score += parseInt(String(value)) || 0;
        },

        async [ACTIONS.LOAD_ITEMS]() {
            const items = DATA.ITEMS;
            this[TYPES.DEFINE_ITEMS]({items});
        }
    }
});

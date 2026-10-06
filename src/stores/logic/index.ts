import { defineStore } from 'pinia';
import state from './state';
import * as TYPES from './mutation-types';
import * as ACTIONS from './action-types';
import DATA from '@/data';

export const useLogicStore = defineStore('logic', {
    state,

    getters: {
        getInventoryItems: state => {
            const oItems = {};
            state.player.inventory.forEach(item => {
                if (item in oItems) {
                    ++oItems[item];
                } else {
                    oItems[item] = 1;
                }
            });
            const aItems = [];
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
        getStateContent(): any {
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
        [TYPES.ADD_INVENTORY_ITEM]({ref}) {
            const qi = this.player.inventory;
            if (!qi.includes(ref)) {
                qi.push(ref);
            }
        },

        /**
         * Removes a quest item from the player inventory
         * @param ref reference of the quest item
         */
        [TYPES.REMOVE_INVENTORY_ITEM]({ref}) {
            const qi = this.player.inventory;
            const n = qi.indexOf(ref);
            if (n >= 0) {
                qi.splice(n, 1);
            }
        },

        /**
         * Define all the items available in game
         */
        [TYPES.DEFINE_ITEMS]({items}) {
            items.forEach(x => this.data.items.push(x));
        },

        /**
         * Change player HP value
         */
        [TYPES.SET_PLAYER_HP]({value}) {
            // value is ranged between 0 and hpMax
            this.player.attributes.hp = Math.min(this.player.attributes.hpMax, Math.max(0, value));
        },

        /**
         * Define maximum player HP value
         */
        [TYPES.SET_PLAYER_MAX_HP]({value}) {
            // value won't be below 1
            this.player.attributes.hpMax = Math.max(1, value);
        },

        [TYPES.MODIFY_PLAYER_HP]({value}) {
            const attr = this.player.attributes;
            const nHP = attr.hp + value;
            attr.hp = Math.min(attr.hpMax, Math.max(0, nHP));
        },

        [TYPES.SET_STATE_CONTENT]({content}) {
            for (const i in content) {
                this.$state[i] = content[i];
            }
        },

        [TYPES.INC_SCORE]({value}) {
            this.data.score += parseInt(value) || 0;
        },

        async [ACTIONS.LOAD_ITEMS]() {
            const items = DATA.ITEMS;
            this[TYPES.DEFINE_ITEMS]({items});
        }
    }
});

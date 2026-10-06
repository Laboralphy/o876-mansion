import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useLogicStore } from '@/stores/logic';
import * as LOGIC_MUTATIONS_TYPES from '@/stores/logic/mutation-types'

export default defineComponent({
    computed: {
        ...mapState(useLogicStore, [
            'getInventoryItems',
            'getItemData',
            'getPlayerAttributeHP',
            'getPlayerAttributeHPMax',
            'isPlayerDead',
            'getStateContent',
            'getInventoryTotalValue',
            'getCombatScore'
        ])
    },
    methods: {
        ...mapActions(useLogicStore, {
            incCombatScore: LOGIC_MUTATIONS_TYPES.INC_SCORE
        })
    }
});

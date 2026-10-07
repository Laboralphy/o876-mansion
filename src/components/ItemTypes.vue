<template>
  <TypeList
    :types="getTypeList"
    :value="getInventoryActiveTab"
    @selected="({ref}) => selected(ref)"
  ></TypeList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TypeList from "@/components/TypeList.vue";
import ui from "@/mixins/ui";

export default defineComponent({
  name: "ItemTypes",
  components: {TypeList},
  mixins: [ui],

  computed: {
    getTypeList: function () {
      return [
        {
          ref: 'all',
          caption: this.$t('ITEM_TYPES_ALL'),
        },
        {
          ref: 'quest',
          caption: this.$t('ITEM_TYPES_QUEST'),
        },
        {
          ref: 'key',
          caption: this.$t('ITEM_TYPES_KEY'),
        },
        {
          ref: 'book',
          caption: this.$t('ITEM_TYPES_BOOK'),
        }
      ];
    }
  },

  methods: {
    selected: function (type) {
      this.setActiveType({value: type});
    }
  }
});

</script>

<style scoped>

</style>
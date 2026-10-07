<template>
  <TypeList
      :types="getTypeList"
      :value="getActiveType"
      @selected="({ref}) => selected(ref)"
  >
  </TypeList>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TypeList from "@/components/TypeList.vue";
import album from "@/mixins/album";

export default defineComponent({
  name: "PhotoTypes",
  components: {TypeList},
  mixins: [album],

  computed: {
    getTypeList: function () {
      return [
        {
          ref: 'clue',
          caption: this.$t('PHOTO_TYPES_CLUE'),
        },
        {
          ref: 'wraith',
          caption: this.$t('PHOTO_TYPES_WRAITH'),
        },
        {
          ref: 'art',
          caption: this.$t('PHOTO_TYPES_ART'),
        },
        {
          ref: 'ambient',
          caption: this.$t('PHOTO_TYPES_AMBIENT'),
        },
        {
          ref: 'archive',
          caption: this.$t('PHOTO_TYPES_ARCHIVE'),
        }
      ]
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

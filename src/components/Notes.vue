<template>
  <div class="ui-panel-window ui-size-60-90">
    <TitleAndCo :title="$t('MAIN_TAB_NOTES')">
      <TypeList
          :types="getNoteTypes"
          :value="getNoteActiveTab"
          @selected="({ref}) => noteTypeSelected(ref)"
      ></TypeList>
    </TitleAndCo>
    <section class="description"><p>{{ $t('HINT_UI_DOCUMENTS.' + getNoteActiveTab, { defaultValue: '' }) }}</p></section>
    <hr />
    <div v-if="getNotes.length > 0">
      <Item
        v-for="note in getNotes"
        :id="note.ref"
        :key="note.ref"
        icon="note"
        :name="$i18next.exists('notes:' + note.ref) ? $t('notes:' + note.ref + '.title') : ('[' + note.ref + ' is undefined]')"
        @click="({id}) => noteClicked(id)"
      ></Item>
    </div>
    <div class="no-item-here typewriter" v-else>
      <span>Pas de note</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TitleAndCo from "@/components/TitleAndCo.vue";
import Item from "@/components/Item.vue";
import TypeList from "@/components/TypeList.vue";
import ui from "@/mixins/ui";
import logic from "@/mixins/logic";

export default defineComponent({
  name: "Notes",
  components: {Item, TitleAndCo, TypeList},
  mixins: [ui, logic],
  computed: {
    getNoteTypes: function () {
      return [
        {
          ref: 'note',
          caption: this.$t('NOTE_TYPES_NOTE')
        },
        {
          ref: 'journal',
          caption: this.$t('NOTE_TYPES_JOURNAL')
        },
        {
          ref: 'hint',
          caption: this.$t('NOTE_TYPES_HINT')
        }
      ]
    }
  },
  methods: {
    getNoteDataById: function(id) {
      return this.$t('notes:' + id, { returnObjects: true });
    },

    noteClicked: function(id) {
      this.setPhotoDetails({
        ...this.getNoteDataById(id),
        value: 0,
        visible: true
      });
    },

    noteTypeSelected: function(ref) {
      this.setNoteActiveType({ value: ref });
    }
  }
});

</script>

<style scoped>

</style>
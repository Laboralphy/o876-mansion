<template>
  <div class="ui-menu-window ui-size-66-90 rounded typewriter">
    <GenericBox
        footer="4em"
        header="6em"
    >
      <template v-slot:header>
        <div class="container">
          <h1>{{ $t('HOWTO_TITLE') }}</h1>
          <hr/>
        </div>
      </template>
      <section class="content">
        <table>
          <tbody>
          <HowTo
              v-for="(s, i) in howToActions"
              :desc="s.desc"
              :note="s.note || ''"
              :image="howToImages[i]"
              :key="'howto-' + i"
          ></HowTo>
          </tbody>
        </table>
      </section>
      <template v-slot:footer>
        <div class="container">
          <hr/>
          <div class="commands">
            <button class="typewriter" @click="++phase">{{ $t('COMMAND_CAPTION_START') }}</button>
          </div>
        </div>
      </template>
    </GenericBox>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ui from '@/mixins/ui';
import GenericBox from "@/components/GenericBox.vue";
import HowTo from "@/components/HowTo.vue";

export default defineComponent({
  name: "TitleControls",
  components: {HowTo, GenericBox},
  mixins: [ui],
  computed: {
    /**
     * list of commands descriptions : [{desc, note?}, ...]
     */
    howToActions(): { desc: string, note?: string }[] {
      return this.$t('HOWTO_ACTIONS', { returnObjects: true }) as { desc: string, note?: string }[];
    }
  },
  data: function () {
    return {
      howToImages: [
        'assets/uigfx/input/kbd_zqsd_mouse.png',
        'assets/uigfx/input/kbd_esc.png',
        'assets/uigfx/input/mlb_layout.png',
        'assets/uigfx/input/mrb_layout.png'
      ]
    };
  }
});

</script>

<style scoped>

div.commands button {
  font-size: 1.2em;
}

</style>
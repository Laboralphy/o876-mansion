<template>
  <section>
    <TitleLoading v-if="isLoadingPageDisplayed"></TitleLoading>
    <TitleMain v-if="isMainMenuPageDisplayed"></TitleMain>
    <TitleControls v-else-if="isControlsPageDisplayed"></TitleControls>
    <TitleStory v-else-if="isStoryPageDisplayed"></TitleStory>
  </section>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import UIMixin from '@/mixins/ui';
import TitleStory from "@/components/intro/TitleStory.vue";
import HowTo from "@/components/HowTo.vue";
import GenericBox from "@/components/GenericBox.vue";
import TitleMain from "@/components/intro/TitleMain.vue";
import TitleLoading from "@/components/intro/TitleLoading.vue";
import TitleControls from "@/components/intro/TitleControls.vue";
import EndOfGame from '@/components/EndOfGame.vue';

export default defineComponent({
  name: "MainMenu",
  components: {TitleLoading, TitleControls, TitleMain, HowTo, TitleStory, GenericBox, EndOfGame},
  mixins: [UIMixin]
});

</script>

<style scoped>

</style>
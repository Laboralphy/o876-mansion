<template>
    <div class="ui-components" data-request-pointer-lock="">
        <section v-if="isHUDVisible">
            <HUD pos="tl">
                <Vitals></Vitals>
                <PhotoShotAttributes></PhotoShotAttributes>
            </HUD>
            <HUD pos="bl"><p></p></HUD>
            <HUD pos="t"></HUD>
            <HUD pos="tr"><ScoreSection></ScoreSection></HUD>
            <HUD pos="br"><p></p></HUD>
        </section>
        <GameOverPrompt v-if="isGameOverPromptVisible"></GameOverPrompt>
        <EndOfGame v-else-if="isEndOfGameVisible"></EndOfGame>
        <UIFrame v-else-if="isUIFrameVisible"></UIFrame>
        <MainMenu v-if="isMainMenuVisible"></MainMenu>
        <Popups></Popups>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import HUD from "@/components/HUD.vue";
    import Popups from "@/components/Popups.vue";
    import Vitals from "@/components/Vitals.vue";
    import PhotoShotAttributes from "@/components/PhotoShotAttributes.vue";
    import UIFrame from "@/components/UIFrame.vue";
    import MainMenu from "@/components/MainMenu.vue";
    import ui from "@/mixins/ui";
    import ScoreSection from '@/components/ScoreSection.vue';
    import GameOverPrompt from '@/components/GameOverPrompt.vue';
    import EndOfGame from '@/components/EndOfGame.vue';

    export default defineComponent({
        name: "Application",
        components: {GameOverPrompt, MainMenu, UIFrame, PhotoShotAttributes, Vitals, HUD, Popups, ScoreSection, EndOfGame},
        mixins: [ui]
    });

</script>

<style scoped>
    .ui-components {
        width: 100%;
        height: 100%;
    }
</style>

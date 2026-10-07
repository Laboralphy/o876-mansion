<template>
    <div :class="'ui typewriter scores ' + (isShotVisible ? 'visible' : 'hidden')">
        <div class="value damage" v-if="isShotDamaging">{{ $t('SHOT_DAMAGE') }} {{ getShotScore }}pt{{ getShotScore > 1 ? 's' : '' }}</div>
        <div class="value" v-else>{{ $t('SHOT_VALUE') }} {{ getShotScore }}pt{{ getShotScore > 1 ? 's' : '' }}</div>
        <div class="fatal" v-if="isShotFatal">{{ $t('SHOT_FATAL') }}</div>
        <div v-if="isShotZero">{{ $t('SHOT_ZERO') }}</div>
        <div v-if="isShotCore">{{ $t('SHOT_CORE') }}</div>
        <div v-if="isShotClose">{{ $t('SHOT_CLOSE') }}</div>
        <div v-if="isShotDouble">{{ $t('SHOT_DOUBLE') }}</div>
        <div v-if="isShotTriple">{{ $t('SHOT_TRIPLE') }}</div>
        <div v-if="isShotMultiple">{{ $t('SHOT_MULTIPLE') }}</div>
    </div>

</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ui from "@/mixins/ui";

    export default defineComponent({
        name: "PhotoShotAttributes",
        mixins: [ui]
    });

</script>

<style scoped>
    .scores {
        margin-top: 1.5em;
        margin-left: 0.5em;
        font-size: 1.1em;
        color: white;
        text-shadow: #63b8ee 0 0 0.5em;
    }

    .value {
        font-size: 1.3em;
        font-weight: bold;
    }

    .damage {
      color: yellow;
      text-shadow: #ee9b63 0 0 0.5em;
    }

    .fatal {
        color: #FFDDDD;
        text-shadow: #ee524f 0 0 0.5em;
        font-weight: bold;
    }

    .scores.visible {
        visibility: visible;
        opacity: 1;
        transform: translateX(0);
        transition: transform 0.4s, visibility 0s, opacity 0.4s ease-in;
    }

    .scores.hidden {
        visibility: hidden;
        opacity: 0;
        transform: translateX(-5em);
        transition: transform 0.4s, visibility 0.4s, opacity 0.4s ease;
    }

</style>

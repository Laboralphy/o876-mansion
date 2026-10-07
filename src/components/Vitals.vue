<template>
    <div class="vitals">
        <div class="ui row axial">
            <div class="label"><span>{{ $t('ATTR_HITPOINTS') }}</span></div>
            <Gauge :width="10" color="rgb(96, 220, 255)" :max="getPlayerAttributeHPMax" :value="getPlayerAttributeHP"></Gauge>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import Gauge from "@/components/Gauge.vue";
    import ui from "@/mixins/ui";
    import logic from '@/mixins/logic'

    export default defineComponent({
        name: "Vitals",
        components: {Gauge},
        mixins: [ui, logic]
    });

</script>

<style scoped>
    .vitals {
        margin: 0.3em;
        padding: 0.3em;
    }
    .label {
        color: #AAAAAA;
        text-shadow: black 1px 1px 0;
        font-size: 0.6em;
        display: inline-block;
        padding-right: 0.4em;
        padding-left: 0.2em;
    }
</style>
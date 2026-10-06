<template>
    <div class="ui-panel-window ui-size-60-90">
        <TitleAndCo :title="title"></TitleAndCo>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import TitleAndCo from "@/components/TitleAndCo.vue";
    export default defineComponent({
        name: "DivDummy",
        components: {TitleAndCo},
        props: {
            title: {
                type: String,
                required: true
            }
        }
    });

</script>

<style scoped>

</style>
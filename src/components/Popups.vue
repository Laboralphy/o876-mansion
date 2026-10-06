<template>
    <div class="popups">
        <Popup :visible="getPopup.visible" :icon="getPopup.icon" :text="getPopup.text"></Popup>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import Popup from "@/components/Popup.vue";
    import ui from "@/mixins/ui";

    export default defineComponent({
        name: "Popups",
        components: {Popup},
        mixins: [ui]
    });


</script>

<style scoped>

</style>
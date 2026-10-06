<template>
    <section :class="getComputedClass">
        <Sidebar></Sidebar>
        <Album v-if="getUIActiveTab === 'album'"></Album>
        <Inventory v-if="getUIActiveTab === 'inv'"></Inventory>
        <Notes v-if="getUIActiveTab === 'notes'"></Notes>
        <Settings v-if="getUIActiveTab === 'settings'"></Settings>
        <PhotoDetails
                v-if="isPhotoDetailsVisible"
                :content="getPhotoDetailsContent"
                :title="getPhotoDetailsTitle"
                :score="getPhotoDetailsValue"
                :description="getPhotoDetailsDescription"
        ></PhotoDetails>
    </section>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import Notes from "@/components/Notes.vue";
    import Album from "@/components/Album.vue";
    import Settings from "@/components/Settings.vue";
    import Sidebar from "@/components/Sidebar.vue";
    import DivDummy from "@/components/DivDummy.vue";
    import PhotoDetails from "@/components/PhotoDetails.vue";
    import Inventory from "@/components/Inventory.vue";
    import ui from "@/mixins/ui";

    export default defineComponent({
        name: "UIFrame",
        components: {Settings, Notes, Inventory, PhotoDetails, DivDummy, Sidebar, Album},
        mixins: [ui],
        computed: {
            getComputedClass: function() {
                const a = ['ui-frame'];
                a.push(this.isUIFrameFullyVisible ? 'visible' : 'hidden');
                return a.join(' ');
            }
        }
    });

</script>

<style scoped>
    section.ui-frame {
        opacity: 0;
        transition: opacity 300ms ease-in;
    }

    section.ui-frame.visible {
        opacity: 1;
        transition: opacity 300ms ease-out;
    }

    section.ui-frame.hidden {
        opacity: 0;
        transition: opacity 300ms ease-in;
    }
</style>
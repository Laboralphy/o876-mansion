<template>
    <div class="sidebar typewriter">
        <ul>
            <li><span @click="select('inv')">{{ $t('MAIN_TAB_INV') }}</span></li>
            <li><span @click="select('album')">{{ $t('MAIN_TAB_ALBUM') }}</span></li>
            <li><span @click="select('notes')">{{ $t('MAIN_TAB_NOTES') }}</span></li>
            <li><span @click="select('settings')">{{ $t('MAIN_TAB_SETTINGS') }}</span></li>
        </ul>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';
    import ui from "@/mixins/ui";

    export default defineComponent({
        name: "Sidebar",
        mixins: [ui],
        methods: {
            select: function(tab) {
                this.setActiveTab({value: tab});
            }
        }
    });

</script>

<style scoped>
    div.sidebar {
        position: absolute;
        width: 13%;
        top: 10%;
        left: 8%;
        text-align: right;
        font-size: 0.8em;
    }

    div.sidebar > ul > li {
        margin-top: 1.4em;
        padding-right: 0.5em;
        list-style: none;
    }

    div.sidebar > ul > li > span {
        background-color: rgb(203, 185, 150);
        border: solid 0.05em rgb(59, 50, 50);
        border-top-left-radius: 0.2em;
        border-bottom-left-radius: 0.2em;
        padding: 0.5em;
        color: black;
    }

    div.sidebar > ul > li:hover > span {
        background-color: rgb(227, 221, 210);
        color: #171313;
        cursor: pointer;
    }
</style>
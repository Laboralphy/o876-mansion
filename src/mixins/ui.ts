import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useUiStore } from '@/stores/ui';
import * as MUTATIONS from '@/stores/ui/mutation-types';

export default defineComponent({
    computed: {
        ...mapState(useUiStore, [
            'getInventoryActiveTab',
            'getMainMenuPhase',
            'getPhotoDetailsContent',
            'getPhotoDetailsDescription',
            'getPhotoDetailsTitle',
            'getPhotoDetailsValue',
            'getPopup',
            'getShotScore',
            'getUIActiveTab',
            'isControlsPageDisplayed',
            'isHUDVisible',
            'isMainMenuPageDisplayed',
            'isLoadingPageDisplayed',
            'isMainMenuVisible',
            'isPhotoDetailsVisible',
            'isShotClose',
            'isShotCore',
            'isShotDamaging',
            'isShotDouble',
            'isShotFatal',
            'isShotMultiple',
            'isShotTriple',
            'isShotVisible',
            'isShotZero',
            'isStoryPageDisplayed',
            'isUIFrameFullyVisible',
            'isUIFrameVisible',
            'getNotes',
            'getNoteActiveTab',
            'isGameOverPromptVisible',
            'isEndOfGameVisible',
            'getSettingMouseFactor',
            'getSettingMusicVolume',
            'getSettingSFXVolume'
        ]),
        phase: {
            get: function() {
                return this.getMainMenuPhase;
            },
            set: function(value: number) {
                this.setPhase({value})
            }
        }
    },
    methods: {
        ...mapActions(useUiStore, {
            setPhase: MUTATIONS.SET_MAIN_MENU_PHASE,
            setActiveTab: MUTATIONS.SET_MAIN_ACTIVE_TAB,
            setActiveType: MUTATIONS.SET_ITEM_TYPE_ACTIVE_TYPE,
            setPhotoDetails: MUTATIONS.SET_PHOTO_DETAILS,
            setNoteActiveType: MUTATIONS.SET_NOTE_SELECTED_TYPE,
            setSettingMouseFactor: MUTATIONS.SET_MOUSE_FACTOR,
            setSettingMusicVolume: MUTATIONS.SET_MUSIC_VOLUME,
            setSettingSFXVolume: MUTATIONS.SET_SFX_VOLUME
        })
    }
});

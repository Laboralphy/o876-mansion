import { defineStore } from 'pinia';
import state from './state';
import * as TYPES from './mutation-types';
import * as ACTIONS from './action-types';
import * as CONSTS from '@/consts';
import { useAlbumStore } from '../album';
import type { ValuePayload } from '../payloads';
import type {
    MainTab,
    InventoryTab,
    NoteType,
    NoteEntryPayload,
    PhotoDetailsPayload,
    PopupPayload,
    PopupMessage,
    ShotPayload
} from './types';

let TIMEOUT_SHOT: ReturnType<typeof setTimeout> | null = null;

export const useUiStore = defineStore('ui', {
    state,

    getters: {
        getPopup: state => state.popup,
        getPopupQueue: state => state.popup.queue,

        isHUDVisible: state => state.hud.visible,
        isUIFrameVisible: state => state.uiframe.visible,
        isUIFrameFullyVisible: state => state.uiframe.fullyVisible,
        isMainMenuVisible: state => state.mainmenu.phase < state.mainmenu.phases.game,
        isGameOverPromptVisible: state => state.gameoverprompt.visible,
        isEndOfGameVisible: state => state.endofgame.visible,

        isShotVisible: state => state.shot.visible,
        isShotFatal: state => state.shot.targets > 0 && state.shot.shutter,
        isShotZero: state => state.shot.targets > 0 && state.shot.energy === 100,
        isShotCore: state => state.shot.targets > 0 && state.shot.angle >= 0.9,
        isShotClose: state => state.shot.targets > 0 && state.shot.distance < 64,
        isShotDouble: state => state.shot.targets === 2,
        isShotTriple: state => state.shot.targets === 3,
        isShotMultiple: state => state.shot.targets > 3,
        isShotDamaging: state => state.shot.damage > 0,

        getShotScore: state => state.shot.damage > 0 ? state.shot.damage : state.shot.value,

        getUIActiveTab: state => state.uiframe.activeTab,
        getInventoryActiveTab: state => state.uiframe.activeInventoryTab,

        isPhotoDetailsVisible: state => state.photodetails.visible,
        getPhotoDetailsDescription: state => state.photodetails.description.slice(0),
        getPhotoDetailsContent: state => state.photodetails.content,
        getPhotoDetailsValue: state => state.photodetails.value,
        getPhotoDetailsTitle: state => state.photodetails.title,

        getMainMenuPhase: state => state.mainmenu.phase,
        isLoadingPageDisplayed: state => state.mainmenu.phase === state.mainmenu.phases.init,
        isMainMenuPageDisplayed: state => state.mainmenu.phase === state.mainmenu.phases.main,
        isControlsPageDisplayed: state => state.mainmenu.phase === state.mainmenu.phases.controls,
        isStoryPageDisplayed: state => state.mainmenu.phase === state.mainmenu.phases.todo,
        isGameRunning: state => state.mainmenu.phase === state.mainmenu.phases.game,

        getNotes: state => state
            .notes
            .filter(n => n.type === state.uiframe.activeNoteTab)
            .sort((a, b) => {
                const ar = a.read ? 1 : 0;
                const br = b.read ? 1 : 0;
                if (ar !== br) {
                    return ar - br;
                }
                const ad = a.date;
                const bd = b.date;
                return bd - ad;
            }),
        getNoteActiveTab: state => state.uiframe.activeNoteTab,

        getSettingMouseFactor: state => state.settings.mouseFactor,
        getSettingMusicVolume: state => state.settings.musicVolume,
        getSettingSFXVolume: state => state.settings.sfxVolume
    },

    actions: {
        // ------------------------------------------------------------------
        // former mutations
        // ------------------------------------------------------------------

        [TYPES.SHIFT_POPUP]() {
            if (this.popup.queue.length > 0) {
                const {text, icon, time} = this.popup.queue.shift();
                this.popup.text = text;
                this.popup.icon = icon;
                this.popup.time = time;
                this.popup.visible = true;
            }
        },

        [TYPES.HIDE_POPUP]() {
            this.popup.visible = false;
        },

        [TYPES.SHOW_POPUP]() {
            this.popup.visible = true;
        },

        [TYPES.PUSH_POPUP]({text, icon}: PopupPayload) {
            const aWords = text.split(' ').filter(w => w.length > 1); // splits text into words
            const nWordCount = aWords.length; // number of words in the text
            const WPM = 180; // word read per minutes
            const MINIMUM_TIME = 1500; // minimum read time for a text
            const MS_IN_A_MINUTE = 60000; // number of milliseconds in a minute
            const time = Math.ceil(Math.max(MINIMUM_TIME, MS_IN_A_MINUTE * nWordCount / WPM));
            this.popup.queue.push({text, icon, time});
        },

        [TYPES.SET_HUD_VISIBLE]({value}: ValuePayload<boolean>) {
            this.hud.visible = value;
        },

        [TYPES.SET_UI_FRAME_VISIBLE]({value}: ValuePayload<boolean>) {
            this.uiframe.visible = value;
        },

        [TYPES.SET_SHOT]({value, energy, distance, angle, targets, shutter, damage = 0}: ShotPayload) {
            this.shot.visible = true;
            this.shot.shutter = shutter;
            this.shot.energy = energy;
            this.shot.distance = distance;
            this.shot.angle = angle;
            this.shot.targets = targets;
            this.shot.value = value;
            this.shot.damage = damage;
        },

        [TYPES.CLEAR_SHOT]() {
            this.shot.visible = false;
        },

        [TYPES.SET_UI_FULLY_VISIBLE]({value}: ValuePayload<boolean>) {
            this.uiframe.fullyVisible = value;
        },

        [TYPES.SET_ALBUM_ACTIVE_TYPE]({value}: ValuePayload<string>) {
            // the album active type belongs to the album store
            // (the former Vuex mutation wrote into a non-existent "state.album")
            useAlbumStore().SET_ACTIVE_TYPE({value});
        },

        [TYPES.SET_MAIN_ACTIVE_TAB]({value}: ValuePayload<MainTab>) {
            this.uiframe.activeTab = value;
        },

        [TYPES.SET_ITEM_TYPE_ACTIVE_TYPE]({value}: ValuePayload<InventoryTab>) {
            this.uiframe.activeInventoryTab = value;
        },

        [TYPES.SET_PHOTO_DETAILS]({visible, title = '', content = '', description = [], value = 0}: PhotoDetailsPayload) {
            const p = this.photodetails;
            p.visible = visible;
            p.title = title;
            p.content = content;
            p.description.splice(0, p.description.length, ...description);
            p.value = value;
        },

        [TYPES.SHOW_FIRST_PAGE]({value}: ValuePayload<boolean>) {
            this.mainmenu.visible = value;
        },

        [TYPES.SET_MAIN_MENU_PHASE]({value}: ValuePayload<number>) {
            this.mainmenu.phase = value;
        },

        [TYPES.SET_TODO_INNER_PHASE]({value}: ValuePayload<number>) {
            this.mainmenu.todo.innerPhase = value;
        },

        [TYPES.SET_NOTE_SELECTED_TYPE]({value}: ValuePayload<NoteType>) {
            this.uiframe.activeNoteTab = value;
        },

        [TYPES.SET_GAME_OVER_PROMPT_VISIBLE]({value}: ValuePayload<boolean>) {
            this.gameoverprompt.visible = value;
        },

        [TYPES.SET_END_OF_GAME_VISIBLE]({value}: ValuePayload<boolean>) {
            this.endofgame.visible = value;
        },

        [TYPES.SET_MOUSE_FACTOR]({value}: ValuePayload<number>) {
            this.settings.mouseFactor = value;
        },

        [TYPES.SET_MUSIC_VOLUME]({value}: ValuePayload<number>) {
            this.settings.musicVolume = value;
        },

        [TYPES.SET_SFX_VOLUME]({value}: ValuePayload<number>) {
            this.settings.sfxVolume = value;
        },

        [TYPES.ADD_NOTE_ENTRY]({ref, type}: NoteEntryPayload) {
            this.notes.push({
                ref,
                type,
                read: false,
                date: Date.now()
            });
        },

        // ------------------------------------------------------------------
        // former actions
        // ------------------------------------------------------------------

        [ACTIONS.SHOW_POPUP]({text, icon}: PopupPayload) {
            // is this text worth being displayed ?
            const aList = this.getPopupQueue;
            const oPopup = this.getPopup;
            const isAlreadyInList = aList.some((p: PopupMessage) => p.text === text && p.icon === icon);
            const isAlreadyDisplayed = oPopup.visible && oPopup.text === text && oPopup.icon === icon;
            const bWorthIt = !isAlreadyInList && !isAlreadyDisplayed;

            if (bWorthIt) {
                const bEmptyQueue = aList.length === 0;
                const bVisible = oPopup.visible;

                switch ((bEmptyQueue ? 'e' : 'f') + (bVisible ? 'v' : 'h')) {
                    case 'ev': // queue empty + current popup visible
                    case 'fv': // queue is full + current popup visible
                        // -> just push the popup
                        this[TYPES.PUSH_POPUP]({text, icon});
                        break;

                    case 'eh': // queue empty + current popup hidden
                        // -> timer is down, reactivate it
                        this[TYPES.PUSH_POPUP]({text, icon});
                        this[ACTIONS.SHOW_NEXT_POPUP]();
                        break;

                    case 'fh': // queue is full + current popup hidden (maybe transitionning)
                        // -> just push the popup
                        this[TYPES.PUSH_POPUP]({text, icon});
                        break;
                }
            }
        },

        [ACTIONS.SHOW_NEXT_POPUP]() {
            if (this.getPopupQueue.length > 0) {
                // if popup is already hidden we don't need to wait before shifting content.
                const CSS_TRANSITION_DELAY = this.getPopup.visible ? CONSTS.DELAY_BETWEEN_POPUPS : 0;
                this[TYPES.HIDE_POPUP](); // hide the previous popup if any
                setTimeout(() => { // show the popup again with new content
                    this[TYPES.SHIFT_POPUP]();
                    this[TYPES.SHOW_POPUP]();
                    setTimeout(() => this[ACTIONS.SHOW_NEXT_POPUP](), this.getPopup.time);
                }, CSS_TRANSITION_DELAY);
            } else {
                // nothing to shift : hide the popup
                this[TYPES.HIDE_POPUP]();
            }
        },

        [ACTIONS.SET_SHOT](payload: ShotPayload) {
            if (TIMEOUT_SHOT) {
                // Scores are being displayed currently
                clearTimeout(TIMEOUT_SHOT); // cancel previous time out
                TIMEOUT_SHOT = null; // clear time out flag
            }
            this[TYPES.SET_SHOT](payload); // sets new shot data
            TIMEOUT_SHOT = setTimeout(() => {
                this[TYPES.CLEAR_SHOT]();
                TIMEOUT_SHOT = null;
            }, CONSTS.SHOT_DISPLAY_DURATION);
        },

        [ACTIONS.HIDE_UI_FRAME]() {
            this[TYPES.SET_UI_FULLY_VISIBLE]({value: false});
            setTimeout(() => {
                this[TYPES.SET_UI_FRAME_VISIBLE]({value: false});
                this[TYPES.SET_HUD_VISIBLE]({value: true});
            }, 300);
        },

        [ACTIONS.SHOW_UI_FRAME]() {
            this[TYPES.SET_HUD_VISIBLE]({value: false});
            this[TYPES.SET_UI_FRAME_VISIBLE]({value: true});
            setTimeout(() => this[TYPES.SET_UI_FULLY_VISIBLE]({value: true}), 16);
        }
    }
});

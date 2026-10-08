import type { MainTab, InventoryTab, NoteType, Note, PopupMessage } from './types';

/**
 * initial state factory
 */
export default () => ({
    popup: {
        text: '',
        icon: '',
        time: 0,
        visible: false,
        queue: [] as PopupMessage[]
    },

    hud: {
        visible: false
    },

    gameoverprompt: {
        visible: false
    },

    endofgame: {
        visible: false
    },

    uiframe: {
        visible: false,
        fullyVisible: false,
        activeTab: 'album' as MainTab,
        activeInventoryTab: 'all' as InventoryTab,
        activeNoteTab: 'journal' as NoteType
    },

    shot: { // information sur le dernier tir
        visible: false,
        value: 0, // valeur du score,
        damage: 0, // valeur des dégats
        distance: 0, // distance à laquelle à été prise la photo
        angle: 0, // difference d'angle entre la visor et le fantome
        energy: 0, // quantité d'energy disponible lors du shot
        targets: 0, // nombre de cible touché par le shot
        shutter: false, // photo prise pendant le shutter chance
    },

    photodetails: {
        visible: false,
        content: '',
        title: '',
        value: 0,
        description: ['']
    },

    mainmenu: {
        visible: true, // see SHOW_FIRST_PAGE, not read by the components (they use the phase)
        phase: 0,
        phases: {
            init: 0,
            main: 1,
            controls: 2,
            todo: 4,
            game: 3
        },
        todo: {
            innerPhase: 0,
            splashIndex: 0,
            splashTransition: 0   // 0: fade-in 1: fade-out
        }
    },

    notes: <Note[]>[
        {
            ref: "story_so_far",
            type: 'journal',
            read: false,
            date: 0
        },
        {
            ref: "commands",
            type: "hint",
            read: false,
            date: 1
        },
        {
            ref: "how_to_hunt_ghosts",
            type: 'hint',
            read: false,
            date: 2
        },
        {
            ref: "look_for_books",
            type: 'hint',
            read: false,
            date: 3
        },
        {
            ref: "look_for_paintings",
            type: 'hint',
            read: false,
            date: 4
        }
    ],
    settings: {
        mouseFactor: 50,
        musicVolume: 50,
        sfxVolume: 50
    }
});

import { createApp, type App } from 'vue';
import { createPinia } from 'pinia';
import I18NextVue from 'i18next-vue';
import i18n from '@/i18n';
import * as UI_MUTATIONS from '@/stores/ui/mutation-types';
import * as UI_ACTIONS from '@/stores/ui/action-types';
import Application from '@/components/Application.vue';
import StoreAbstract from "@/StoreAbstract";

class UI extends StoreAbstract {
    private readonly _app: App;

    constructor(sDomSelector: string) {
        super('ui');
        const pinia = createPinia();
        this.store = pinia;
        this._app = this.createApplication(sDomSelector);
    }

    get vm(): App {
        return this._app;
    }

    createApplication(sWhere: string): App {
        const app = createApp(Application);
        app.use(this.store);
        app.use(I18NextVue, { i18next: i18n });
        app.mount(sWhere);
        return app;
    }

    /**
     * Displays a popup with a text inside, and an icon
     * @param sKey translation key (a text which is not a translation key is displayed as is)
     * @param sIconRef icon reference (see assets/icons)
     * @param values interpolation values, e.g. {item: 'the key'} for "You get : {{item}}"
     */
    popup(sKey: string, sIconRef?: string, values: Record<string, any> = {}) {
        const icon = !!sIconRef && sIconRef.length > 0 ? 'assets/icons/' + sIconRef + '.png' : '';
        const text = i18n.t(sKey, values);
        return this.dispatch(UI_ACTIONS.SHOW_POPUP, {text, icon});
    }

    show() {
        this.dispatch(UI_ACTIONS.SHOW_UI_FRAME, {});
    }

    hide() {
        this.dispatch(UI_ACTIONS.HIDE_UI_FRAME, {});
    }

    displayPhotoDetailScore({
        value,
        energy,
        distance,
        angle,
        targets,
        shutter,
        damage
    }) {
        this.dispatch(UI_ACTIONS.SET_SHOT, {
            value,
            energy,
            distance,
            angle,
            targets,
            shutter,
            damage
        });
    }

    displayPhotoScore(nValue) {
        this.dispatch(UI_ACTIONS.SET_SHOT, {
            value: nValue,
            energy: 0,
            distance: Infinity,
            angle: Infinity,
            targets: 0,
            shutter: false
        });
    }

    showFirstPage() {
        this.commit(UI_MUTATIONS.SHOW_FIRST_PAGE, {value: true});
    }

    hideFirstPage() {
        this.commit(UI_MUTATIONS.SHOW_FIRST_PAGE, {value: false});
    }

    /**
     *
     * @param ref
     * @param sType {string} voir components.Notes.getNoteTypes
     */
    addNote (ref, sType = 'note') {
        this.commit(UI_MUTATIONS.ADD_NOTE_ENTRY, { ref, type: sType })
    }
}

export default UI;

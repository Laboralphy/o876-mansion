import { createApp, type App } from 'vue';
import { createPinia } from 'pinia';
import * as UI_MUTATIONS from '@/stores/ui/mutation-types';
import * as UI_ACTIONS from '@/stores/ui/action-types';
import Application from '@/components/Application.vue';
import STRINGS from '@/strings';
import StoreAbstract from "@/StoreAbstract";
import ObjectExtender from '@/libs/object-helper/Extender';

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
        app.mount(sWhere);
        return app;
    }

    /**
     * Displays a popup with a text inside, and an icon
     * @param sText
     * @param sIconRef
     * @param params
     * @return {Promise<any>}
     */
    popup(sText, sIconRef, ...params) {
        const icon = !!sIconRef && sIconRef.length > 0 ? 'assets/icons/' + sIconRef + '.png' : '';
        let text = sText in STRINGS ? STRINGS[sText] : sText;
        for (let i = 0, l = params.length; i < l; ++i) {
            const p = params[i];
            switch (typeof p) {
                case 'string':
                    let sParamText = ObjectExtender.objectGet(STRINGS, p);
                    text = text.replace(/%s/, sParamText);
                    break;

                case 'number':
                    text = text.replace(/%d/, p);
                    break;
            }
        }
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

import { watch, type WatchStopHandle } from 'vue';
import type { Pinia } from 'pinia';
import { STORES, type StoreName } from '@/stores';

/**
 * StoreAbstract is a base class to be extended.
 * It provides basic tools to communicate with one of the Pinia stores
 * (run actions, read getters, watch getters).
 *
 * The former Vuex mutations and actions are all Pinia actions now, named after their
 * mutation/action type constant, so commit() and dispatch() are equivalent.
 */
class StoreAbstract {
    private _pinia: Pinia | null = null;
    private readonly _name: StoreName;

    constructor(sName: StoreName) {
        this._name = sName;
    }

    /**
     * the Pinia instance
     */
    get store(): Pinia {
        return this._pinia;
    }

    set store(value: Pinia) {
        this._pinia = value;
    }

    /**
     * The Pinia store this class is bound to
     */
    get state(): any {
        return STORES[this._name](this._pinia);
    }

    /**
     * runs an action of the store
     * @param action {string}
     * @param payload {*}
     */
    dispatch(action: string, payload?: any): any {
        const s = this.state;
        if (typeof s[action] !== 'function') {
            throw new Error(`store "${this._name}" has no action "${action}"`);
        }
        return s[action](payload);
    }

    commit(mutation: string, payload?: any): any {
        return this.dispatch(mutation, payload);
    }

    /**
     * reads a getter value
     */
    prop(getter: string): any {
        return this.state[getter];
    }

    /**
     * calls a function each time a getter value changes
     */
    watch(getter: string, callback: (newValue: any, oldValue: any) => void): WatchStopHandle {
        return watch(() => this.prop(getter), callback);
    }
}

export default StoreAbstract;

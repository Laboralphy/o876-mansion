import { watch, type WatchStopHandle } from 'vue';
import type { Pinia, StoreActions, StoreGetters } from 'pinia';
import { STORES, type StoreName } from '@/stores';

/**
 * The store instance of a given store name
 */
export type StoreOf<N extends StoreName> = ReturnType<typeof STORES[N]>;

/**
 * Actions of a given store (the former Vuex mutations and actions)
 */
export type ActionsOf<N extends StoreName> = StoreActions<StoreOf<N>>;
export type ActionName<N extends StoreName> = keyof ActionsOf<N> & string;

/**
 * Getters of a given store, with the type of their value
 */
export type GettersOf<N extends StoreName> = StoreGetters<StoreOf<N>>;
export type GetterName<N extends StoreName> = keyof GettersOf<N> & string;

/**
 * Parameters and result of an action
 * (written as conditional types : TypeScript cannot tell that ActionsOf<N>[A] is a function by itself)
 */
export type PayloadOf<N extends StoreName, A extends ActionName<N>> =
    ActionsOf<N>[A] extends (...args: infer P) => unknown ? P : never;
export type ResultOf<N extends StoreName, A extends ActionName<N>> =
    ActionsOf<N>[A] extends (...args: never[]) => infer R ? R : never;

type Action = (...args: unknown[]) => unknown;

/**
 * StoreAbstract is a base class to be extended.
 * It provides basic tools to communicate with one of the Pinia stores
 * (run actions, read getters, watch getters).
 *
 * The former Vuex mutations and actions are all Pinia actions now, named after their
 * mutation/action type constant, so commit() and dispatch() are equivalent.
 * Action names, payloads and getter values are all checked against the store definition.
 */
class StoreAbstract<N extends StoreName> {
    private _pinia: Pinia | null = null;
    private readonly _name: N;

    constructor(sName: N) {
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
    get state(): StoreOf<N> {
        return STORES[this._name](this._pinia) as StoreOf<N>;
    }

    /**
     * runs an action of the store
     * @param action action name (see the store mutation-types / action-types constants)
     * @param payload the action payload, if the action takes one
     */
    dispatch<A extends ActionName<N>>(action: A, ...payload: PayloadOf<N, A>): ResultOf<N, A> {
        const s = this.state as unknown as Record<string, unknown>;
        const f = s[action];
        if (typeof f !== 'function') {
            throw new Error(`store "${this._name}" has no action "${action}"`);
        }
        return (f as Action).apply(s, payload) as ResultOf<N, A>;
    }

    commit<A extends ActionName<N>>(mutation: A, ...payload: PayloadOf<N, A>): ResultOf<N, A> {
        return this.dispatch(mutation, ...payload);
    }

    /**
     * reads a getter value
     */
    prop<G extends GetterName<N>>(getter: G): GettersOf<N>[G] {
        return (this.state as unknown as GettersOf<N>)[getter];
    }

    /**
     * calls a function each time a getter value changes
     */
    watch<G extends GetterName<N>>(
        getter: G,
        callback: (newValue: GettersOf<N>[G], oldValue: GettersOf<N>[G]) => void
    ): WatchStopHandle {
        return watch(() => this.prop(getter), callback);
    }
}

export default StoreAbstract;

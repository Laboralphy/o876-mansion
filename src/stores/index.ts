import { useAlbumStore } from './album';
import { useLogicStore } from './logic';
import { useUiStore } from './ui';
import { useVisorStore } from './visor';

export { useAlbumStore, useLogicStore, useUiStore, useVisorStore };

/**
 * Store definitions, by name
 * (the names were the Vuex module namespaces)
 */
export const STORES = {
    album: useAlbumStore,
    logic: useLogicStore,
    ui: useUiStore,
    visor: useVisorStore
};

export type StoreName = keyof typeof STORES;

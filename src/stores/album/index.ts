import { defineStore } from 'pinia';
import state from './state';
import * as TYPES from './mutation-types';

export const useAlbumStore = defineStore('album', {
    state,

    getters: {
        getPhotos: state => state.photos.filter(p => p.type === state.activeType),
        getPhotoCount(): number {
            return this.getPhotos.length;
        },
        getActiveType: state => state.activeType,
        getFirstWorthyActiveType(state): string {
            if (this.getPhotoCount === 0) {
                const sWorthy = state.photoTypes.find(pt => !!state.photos.find(p => p.type === pt));
                return sWorthy === undefined ? '' : sWorthy;
            } else {
                return this.getActiveType;
            }
        },
        getPhotoTypes: state => state.photoTypes,
        getAllPhotos: state => state.photos,
        // pinia calls getters with the store itself as "state" : return the raw state only
        getStateContent(): any {
            return this.$state;
        },
        getAlbumTotalScore: state => state.photos.reduce((prev, curr) => prev + curr.value, 0)
    },

    actions: {
        [TYPES.STORE_PHOTO]({content, type, value, ref}) {
            const id = this.photoId++;
            if (this.photoTypes.includes(type)) {
                this.photos.push({
                    id,
                    type,
                    content,
                    value,
                    ref
                });
            }
        },

        [TYPES.SET_ACTIVE_TYPE]({value}) {
            if (this.photoTypes.includes(value)) {
                this.activeType = value;
            }
        },

        [TYPES.SET_PHOTO_TYPE]({ref, type}) {
            const oPhoto = this.photos.find(p => p.ref === ref);
            if (!oPhoto) {
                // ignore mutation, if photo is not in album
                return;
            }
            if (this.photoTypes.includes(type)) {
                oPhoto.type = type;
            }
        },

        [TYPES.SET_STATE_CONTENT]({content}) {
            for (const i in content) {
                this.$state[i] = content[i];
            }
        }
    }
});

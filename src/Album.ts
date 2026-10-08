import * as ALBUM_MUTATIONS from '@/stores/album/mutation-types';
import StoreAbstract from "@/StoreAbstract";
import * as CONSTS from "@/consts";
import type { Pinia } from 'pinia';
import type { PhotoType } from '@/stores/album/types';

class Album extends StoreAbstract<'album'> {

    constructor(store: Pinia) {
        super('album');
        this.store = store;
    }

    /**
     * Stores a photo in the album
     * @param content image, as a data url
     * @param type album category
     * @param value score
     * @param ref translation reference (photos namespace)
     */
    storePhoto(content: string, type: PhotoType, value: number, ref: string) {
        this.commit(ALBUM_MUTATIONS.STORE_PHOTO, {content, type, value, ref});
    }

    archivePhoto(ref: string) {
        this.commit(ALBUM_MUTATIONS.SET_PHOTO_TYPE, {ref, type: CONSTS.PHOTO_TYPE_ARCHIVE});
    }

    hasTakenPhoto(ref: string): boolean {
        const photos = this.prop('getAllPhotos');
        return photos.some(p => p.ref === ref);
    }
}

export default Album;
import * as ALBUM_MUTATIONS from '@/stores/album/mutation-types';
import StoreAbstract from "@/StoreAbstract";
import * as CONSTS from "@/consts";

class Album extends StoreAbstract {

    constructor(store) {
        super('album');
        this.store = store;
    }

    storePhoto(content, type, value, ref) {
        this.commit(ALBUM_MUTATIONS.STORE_PHOTO, {content, type, value, ref});
    }

    archivePhoto(ref) {
        this.commit(ALBUM_MUTATIONS.SET_PHOTO_TYPE, {ref, type: CONSTS.PHOTO_TYPE_ARCHIVE});
    }

    hasTakenPhoto(ref) {
        const photos = this.prop('getAllPhotos');
        return !!photos.find(p => {
            return p.ref === ref;
        });
    }
}

export default Album;
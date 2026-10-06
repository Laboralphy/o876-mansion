import { defineComponent } from 'vue';
import { mapState, mapActions } from 'pinia';
import { useAlbumStore } from '@/stores/album';
import * as MUTATIONS from '@/stores/album/mutation-types';

export default defineComponent({
    computed: {
        ...mapState(useAlbumStore, [
          'getPhotos',
          'getPhotoCount',
          'getPhotoTypes',
          'getActiveType',
          'getAlbumTotalScore',
          'getFirstWorthyActiveType'
        ])
    },

    methods: {
        ...mapActions(useAlbumStore, {
            setActiveType: MUTATIONS.SET_ACTIVE_TYPE
        })
    }
});

<template>
    <div class="ui-panel-window ui-size-60-90 album typewriter">
        <TitleAndCo :title="$t('MAIN_TAB_ALBUM')">
            <PhotoTypes></PhotoTypes>
        </TitleAndCo>
        <section class="description"><p>{{ $t('HINT_UI_ALBUM.' + getActiveType, { defaultValue: '' }) }}</p></section>
        <hr />
        <div class="photo-container" v-if="getPhotos.length > 0">
            <Photo
                v-for="photo in getPhotos"
                :key="photo.id"
                :content="photo.content"
                :caption="$i18next.exists('photos:' + photo.ref) ? $t('photos:' + photo.ref + '.title') : '[' + photo.ref + ']'"
                :gray="getActiveType === 'archive'"
                @click="photoClicked(photo.id)"
            ></Photo>
        </div>
        <div v-else class="no-item-here">
            <span>{{ $t('ALBUM_TAB_EMPTY') }}</span>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent } from 'vue';

    import Photo from "@/components/Photo.vue";
    import PhotoTypes from "@/components/PhotoTypes.vue";
    import TitleAndCo from "@/components/TitleAndCo.vue";
    import ui from "@/mixins/ui";
    import album from "@/mixins/album";

    export default defineComponent({
        name: "Album",
        mixins: [ui, album],
        components: {TitleAndCo, Photo, PhotoTypes},

        mounted: function () {
            this.setActiveType({value: this.getFirstWorthyActiveType})
        },
        methods: {
              photoClicked: function(id) {
                  const {ref, value, content} = this.getPhotos.find(p => p.id === id);
                  const oPhotoData = this.$t('photos:' + ref, { returnObjects: true });
                  if (ref === undefined) {
                      throw new Error('this photo is unknown : id ' + id + ' - ref ' + ref);
                  }
                  const title = oPhotoData.title;
                  const description = oPhotoData.description;
                  this.setPhotoDetails({
                      title,
                      description,
                      content,
                      value,
                      visible: true
                  });
              }
          }
    });

</script>

<style scoped>
    div.photo-container {
        overflow: auto;
        padding: 1%;
        margin: 0;
        width: 98%;
    }

    div.photo-details {
        height: 33%;
    }
</style>
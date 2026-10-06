<template>
  <section class="description">
    <p v-for="s in text" v-html="s"></p>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
name: "Description",
  props: {
    text: {
      type: Array,
      required: true
    }
  }
});

</script>

<style scoped>

</style>
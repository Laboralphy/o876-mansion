<template>
  <ul class="tab-list typewriter">
    <li
        v-for="t in types"
        :key="t.ref"
        :class="value === t.ref ? 'selected' : ''" @click="setActiveType(t.ref)">{{ t.caption }}</li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, type PropType } from 'vue';
export default defineComponent({
  name: "TypeList",
  emits: ["selected"],
  props: {
    types: {
      type: Array as PropType<{ ref: string, caption: string }[]>,
      required: true
    },
    value: {
      type: String,
      required: false,
      default: ''
    }
  },

  methods: {
    setActiveType: function(ref) {
      this.$emit('selected', {ref});
    }
  }
});

</script>

<style scoped>

ul.tab-list {
  margin: 0;
}

ul.tab-list > li {
  display: inline-block;
  background-color: #8b4513;
  border: solid thin #251205;
  border-radius: 0.25em;
  color: #b58868;
  font-size: 0.9em;
  padding: 0.125em 0.35em;
  margin: 0.1em;
}

ul.tab-list > li:hover {
  display: inline-block;
  background-color: #d76b1d;
  color: #caaa93;
  border: solid thin #381e0d;
  cursor: pointer;
}

ul.tab-list > li.selected,
ul.tab-list > li.selected:hover
{
  display: inline-block;
  background-color: #e0ab84;
  color: #f8f8f7;
  border: solid thin #5a3b26;
  cursor: default;
}

</style>
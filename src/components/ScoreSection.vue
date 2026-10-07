<template>
  <div class="typewriter score-section"><div class="label">{{ $t('ATTR_SCORE').toUpperCase() }} :</div><div class="value">{{ getScoreString }}</div></div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import logic from '@/mixins/logic';
import album from '@/mixins/album';

export default defineComponent({
  name: 'ScoreSection',
  mixins: [album, logic],
  computed: {
    getScoreString: function() {
      const nAlbumScore = this.getAlbumTotalScore;
      const nInventoryScore = this.getInventoryTotalValue;
      const nCombatScore = this.getCombatScore
      const nTotal = nAlbumScore + nInventoryScore + nCombatScore;
      return nTotal.toString();
    }
  }
});

</script>

<style scoped>
.score-section {
  font-weight: bolder;
  color: gold;
  text-shadow: 0 0 0.2em goldenrod, 0 0 1em black;
  text-align: right;
  margin-right: 1em;
  margin-top: 1em;
}

.score-section .label {
  font-size: 0.75em;
  opacity: 0.6;
  font-style: italic;
}

.score-section .value {
  font-size: 2em;
}
</style>

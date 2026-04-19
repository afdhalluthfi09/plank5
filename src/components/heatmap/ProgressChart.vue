<template>
  <div class="chart">
    <div class="bars">
      <div
        v-for="day in 30"
        :key="day"
        class="bar-wrap"
      >
        <div
          class="bar"
          :class="{
            'bar-past':   day < today,
            'bar-today':  day === today,
            'bar-future': day > today,
          }"
          :style="{ height: barHeight(day) + 'px' }"
        />
      </div>
    </div>
    <div class="chart-labels">
      <span class="text-muted" style="font-size:9px;">Hari 1: 10s</span>
      <span class="text-gold mono" style="font-size:9px;">Hari ini: {{ currentDuration }}s</span>
      <span class="text-muted" style="font-size:9px;">Hari 30: 19s</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { getTargetDuration } from '@/services/healthService.js'

const props = defineProps({
  today: { type: Number, default: new Date().getDate() },
})

const currentDuration = computed(() => getTargetDuration(props.today))

function barHeight(day) {
  const dur = getTargetDuration(day)
  return (dur - 9) * 7   // scale: 10s=7px, 19s=70px
}
</script>

<style scoped>
.chart { width: 100%; }

.bars {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 72px;
}

.bar-wrap { flex: 1; display: flex; align-items: flex-end; }

.bar {
  width: 100%;
  border-radius: 2px 2px 0 0;
  transition: height 0.5s ease;
}

.bar-past   { background: rgba(240,200,96,0.25); }
.bar-today  { background: var(--gold); }
.bar-future { background: rgba(240,200,96,0.07); }

.chart-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
}
</style>

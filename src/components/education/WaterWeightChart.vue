<template>
  <div class="water-chart">
    <svg :width="W" :height="H + 20" :viewBox="`0 0 ${W} ${H + 20}`" style="width:100%; height:auto;">
      <!-- Grid lines -->
      <g v-for="v in [79, 80, 81]" :key="v">
        <line :x1="0" :y1="toSvg(0, v).sy" :x2="W" :y2="toSvg(0, v).sy"
          stroke="rgba(255,255,255,0.04)" stroke-dasharray="3,3" />
        <text :x="W - 2" :y="toSvg(0, v).sy - 3"
          text-anchor="end" fill="rgba(221,213,200,0.2)" font-size="8" font-family="monospace">
          {{ v }}
        </text>
      </g>

      <!-- Area fill -->
      <path :d="areaPath" fill="rgba(168,200,255,0.06)" />

      <!-- Fluctuation line -->
      <path :d="linePath" fill="none" stroke="rgba(168,200,255,0.4)" stroke-width="1.5" />

      <!-- True fat trend (dashed green) -->
      <line
        :x1="toSvg(0, 80.4).sx" :y1="toSvg(0, 80.4).sy"
        :x2="toSvg(data.length - 1, 78.8).sx" :y2="toSvg(data.length - 1, 78.8).sy"
        stroke="var(--green)" stroke-width="1.5" stroke-dasharray="5,4"
      />

      <!-- Data points -->
      <circle
        v-for="(v, i) in data" :key="i"
        :cx="toSvg(i, v).sx" :cy="toSvg(i, v).sy"
        :r="i === activeDay ? 5 : 2.5"
        :fill="i === activeDay ? 'var(--gold)' : 'rgba(168,200,255,0.55)'"
        style="cursor:pointer; transition: r 0.15s;"
        @click="activeDay = i"
      />
    </svg>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <div style="width:16px; height:2px; background:rgba(168,200,255,0.5); border-radius:1px;" />
        <span>Timbangan harian</span>
      </div>
      <div class="legend-item">
        <div style="width:16px; height:2px; background:var(--green); border-radius:1px; opacity:0.7;" />
        <span>Tren lemak sesungguhnya</span>
      </div>
    </div>

    <!-- Active day tooltip -->
    <div class="day-info">
      <span>Hari ke-{{ activeDay + 1 }}:</span>
      <span class="mono" :style="{ color: activeData >= data[0] ? 'var(--peach)' : 'var(--green)' }">
        {{ activeData }} kg
        <span style="font-size:10px;">
          {{ activeData > data[0] ? '+' : '' }}{{ (activeData - data[0]).toFixed(1) }}
        </span>
      </span>
      <span class="text-muted" style="font-size:9px; font-style:italic;">
        {{ activeReason }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const data = [80, 80.8, 79.6, 81.2, 80.3, 79.9, 80.5, 79.8, 80.1, 79.4, 78.9, 79.7, 79.2, 78.8]
const W = 280, H = 100
const minY = 78, maxY = 82
const activeDay = ref(0)

function toSvg(x, y) {
  return {
    sx: (x / (data.length - 1)) * W,
    sy: H - ((y - minY) / (maxY - minY)) * H,
  }
}

const linePath = computed(() =>
  data.map((v, i) => {
    const { sx, sy } = toSvg(i, v)
    return i === 0 ? `M${sx},${sy}` : `L${sx},${sy}`
  }).join(' ')
)

const areaPath = computed(() => {
  const line = linePath.value
  const end = toSvg(data.length - 1, minY)
  const start = toSvg(0, minY)
  return `${line} L${end.sx},${H} L${start.sx},${H} Z`
})

const activeData = computed(() => data[activeDay.value])

const activeReason = computed(() => {
  const diff = activeData.value - data[0]
  if (Math.abs(diff) < 0.4) return '→ fluktuasi air normal'
  if (diff > 0.8) return '→ bisa karena sodium/karbohidrat'
  if (diff < -0.5) return '→ bisa karena dehidrasi'
  return ''
})
</script>

<style scoped>
.water-chart { margin-top: 14px; }

.legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  justify-content: center;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: rgba(221,213,200,0.3);
}

.day-info {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 10px;
  background: rgba(168,200,255,0.06);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 11px;
  color: rgba(221,213,200,0.45);
}
</style>

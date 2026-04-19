<template>
  <div class="heatmap">
    <!-- Prayer row labels + cells -->
    <div
      v-for="(prayer, pi) in PRAYERS"
      :key="prayer.id"
      class="heatmap-row"
    >
      <!-- Label -->
      <span class="row-label">{{ prayer.icon }}</span>

      <!-- 30 cells -->
      <div class="cells">
        <div
          v-for="day in 30"
          :key="day"
          class="cell"
          :class="cellClass(pi, day)"
          :title="`${prayer.label} hari ke-${day}`"
        />
      </div>
    </div>

    <!-- Legend -->
    <div class="legend">
      <div class="legend-item">
        <div class="legend-dot" style="background:rgba(255,255,255,0.04)" />
        <span>Terlewat</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background:rgba(110,231,122,0.35)" />
        <span>Done</span>
      </div>
      <div class="legend-item">
        <div class="legend-dot" style="background:rgba(240,200,96,0.3); border:1px solid rgba(240,200,96,0.5)" />
        <span>Hari ini</span>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  logs:      { type: Array,  default: () => [] },
  todayDone: { type: Object, default: () => ({}) },
})

const PRAYERS = [
  { id: 'subuh',   icon: '🌙' },
  { id: 'dzuhur',  icon: '☀️' },
  { id: 'ashar',   icon: '⛅' },
  { id: 'maghrib', icon: '🌅' },
  { id: 'isya',    icon: '🌃' },
]

const today = new Date().getDate()

function cellClass(prayerIndex, day) {
  const isToday  = day === today
  const isFuture = day > today

  if (isFuture) return 'cell-future'
  if (isToday) {
    const prayerId = PRAYERS[prayerIndex].id
    return props.todayDone[prayerId] ? 'cell-today-done' : 'cell-today'
  }

  // Find log for this day
  const log = props.logs.find(l => {
    const d = parseInt(l.date?.split('-')[2] || '0')
    return d === day
  })

  if (!log?.prayers) return 'cell-empty'
  const prayerId = PRAYERS[prayerIndex].id
  return log.prayers[prayerId]?.plank_done ? 'cell-done' : 'cell-empty'
}
</script>

<style scoped>
.heatmap { display: flex; flex-direction: column; gap: 4px; }

.heatmap-row {
  display: flex;
  align-items: center;
  gap: 5px;
}

.row-label {
  font-size: 13px;
  width: 22px;
  flex-shrink: 0;
  text-align: center;
}

.cells {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(30, 1fr);
  gap: 3px;
}

.cell {
  aspect-ratio: 1;
  border-radius: 2px;
  transition: background 0.3s;
}

.cell-future  { background: rgba(255,255,255,0.02); }
.cell-empty   { background: rgba(255,255,255,0.04); }
.cell-done    { background: rgba(110,231,122,0.35); }
.cell-today   { background: rgba(240,200,96,0.15); border: 1px solid rgba(240,200,96,0.35); }
.cell-today-done { background: rgba(110,231,122,0.5); border: 1px solid rgba(110,231,122,0.4); }

/* Legend */
.legend {
  display: flex;
  gap: 14px;
  margin-top: 10px;
  justify-content: flex-end;
}
.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 9px;
  color: rgba(221,213,200,0.3);
}
.legend-dot {
  width: 10px; height: 10px;
  border-radius: 2px;
}
</style>

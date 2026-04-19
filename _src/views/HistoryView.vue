<template>
  <div class="page-container">
    <header style="margin-bottom:28px;">
      <p class="label-upper">Riwayat</p>
      <h1 class="display-title">
        {{ monthName }}<br />
        <span class="text-gold">{{ year }}</span>
      </h1>
    </header>

    <!-- Heatmap 5×30 -->
    <div class="card" style="margin-bottom:14px;">
      <p class="label-upper" style="margin-bottom:16px;">Konsistensi Bulan Ini</p>
      <Heatmap5x30 :logs="store.monthlyLogs" :today-done="todayPlankDone" />
    </div>

    <!-- Stats grid -->
    <div class="stats-grid">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="card-sm stat-card"
      >
        <p class="label-upper">{{ stat.label }}</p>
        <div class="stat-value mono" :style="{ color: stat.color }">
          {{ stat.value }}
        </div>
        <p class="text-muted" style="font-size:9px; margin-top:4px;">{{ stat.unit }}</p>
      </div>
    </div>

    <!-- Progressive overload chart -->
    <div class="card" style="margin-top:14px;">
      <p class="label-upper" style="margin-bottom:4px;">Progressive Overload</p>
      <p class="text-muted" style="font-size:11px; margin-bottom:14px;">
        Durasi plank naik otomatis +1s setiap 3 hari
      </p>
      <ProgressChart :today="today.getDate()" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import { calcCalories, getTargetDuration } from '@/services/healthService.js'
import Heatmap5x30 from '@/components/heatmap/Heatmap5x30.vue'
import ProgressChart from '@/components/heatmap/ProgressChart.vue'

const store = useHealthStore()
const today = new Date()
const monthName = today.toLocaleDateString('id-ID', { month: 'long' })
const year      = today.getFullYear()

const todayPlankDone = computed(() => {
  const map = {}
  const p = store.todayPrayers
  ;['subuh','dzuhur','ashar','maghrib','isya'].forEach(id => {
    map[id] = p[id]?.plank_done || false
  })
  return map
})

const totalSessions = computed(() => {
  let count = 0
  store.monthlyLogs.forEach(log => {
    if (!log.prayers) return
    Object.values(log.prayers).forEach(p => { if (p.plank_done) count++ })
  })
  return count
})

const totalCalories = computed(() =>
  store.monthlyLogs.reduce((sum, log) => {
    if (!log.prayers) return sum
    return sum + Object.values(log.prayers)
      .filter(p => p.plank_done)
      .reduce((s, p) => s + calcCalories(store.weightKg, p.duration_seconds || 10), 0)
  }, 0)
)

const stats = computed(() => [
  {
    label: 'Streak',
    value: store.streak,
    unit: 'hari berturut-turut',
    color: 'var(--gold)',
  },
  {
    label: 'Total Sesi',
    value: totalSessions.value,
    unit: 'plank bulan ini',
    color: 'var(--blue)',
  },
  {
    label: 'Consistency',
    value: `${store.consistencyScore}%`,
    unit: 'dari target 5×/hari',
    color: 'var(--green)',
  },
  {
    label: 'Kalori',
    value: totalCalories.value.toFixed(1),
    unit: 'kcal bulan ini',
    color: 'var(--peach)',
  },
])
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.stat-card { display: flex; flex-direction: column; }

.stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
  margin-top: 6px;
}
</style>

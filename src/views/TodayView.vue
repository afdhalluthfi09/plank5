<template>
  <div class="page-container">
    <!-- Header -->
    <header class="today-header">
      <div>
        <p class="label-upper">{{ dayName }}</p>
        <h1 class="display-title">
          {{ dateDisplay }}<br />
          <span class="text-gold">{{ monthDisplay }}</span>
        </h1>
        <p class="text-muted" style="font-size:11px; margin-top:4px;">
          Target: <span class="text-gold mono">{{ store.targetDuration }}s</span>
          × 5 waktu sholat
        </p>
      </div>

      <!-- Weight pill -->
      <div class="weight-pill" @click="showWeightModal = true">
        <span class="label-upper">Berat</span>
        <div class="weight-value mono">
          {{ store.weightKg }}<span class="text-muted" style="font-size:11px">kg</span>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="store.isLoading" class="loading-state">
      <div class="loading-spinner" />
    </div>

    <template v-else>
      <!-- 5-Point Pentagon -->
      <PentagonCircle
        :plank-done="plankDoneMap"
        :prayer-done="prayerDoneMap"
        :selected="selectedPrayer"
        @select="selectedPrayer = $event"
      />
      <p class="text-muted" style="text-align:center; font-size:10px; letter-spacing:1px; margin-top:-8px; margin-bottom:20px;">
        Ketuk titik waktu sholat
      </p>

      <!-- Selected Prayer Card + Timer -->
      <PrayerTimerCard
        :prayer="selectedPrayerData"
        :prayer-time="store.prayerTimes[selectedPrayer]"
        :is-prayed="prayerDoneMap[selectedPrayer]"
        :is-plank-done="plankDoneMap[selectedPrayer]"
        :duration="store.targetDuration"
        :weight-kg="store.weightKg"
        @pray="store.togglePrayer(selectedPrayer)"
        @plank-complete="store.completePlank(selectedPrayer)"
      />

      <!-- All 5 Prayers compact list -->
      <div class="prayer-list">
        <div
          v-for="prayer in PRAYERS_DATA"
          :key="prayer.id"
          class="prayer-list-item"
          :class="{ 'is-selected': selectedPrayer === prayer.id }"
          @click="selectedPrayer = prayer.id"
        >
          <div class="prayer-list-left">
            <span>{{ prayer.icon }}</span>
            <span
              class="prayer-list-name"
              :style="{ color: plankDoneMap[prayer.id] ? 'var(--green)' : 'var(--text-secondary)' }"
            >
              {{ prayer.label }}
            </span>
            <span
              v-if="store.prayerTimes[prayer.id]"
              class="prayer-list-time mono text-muted"
            >
              {{ store.prayerTimes[prayer.id] }}
            </span>
          </div>
          <div class="prayer-list-badges">
            <span
              class="badge"
              :class="{ 'badge-active-blue': prayerDoneMap[prayer.id] }"
            >🕌</span>
            <span
              class="badge"
              :class="{ 'badge-active-green': plankDoneMap[prayer.id] }"
            >💪</span>
          </div>
        </div>
      </div>

      <!-- Total calories today -->
      <div v-if="store.todayCalories > 0" class="calories-summary card-sm">
        <span class="text-secondary" style="font-size:11px;">Total kalori terbakar hari ini</span>
        <span class="mono text-green" style="font-size:18px; font-weight:700;">
          {{ store.todayCalories.toFixed(2) }}
          <span class="text-muted" style="font-size:10px;">kcal</span>
        </span>
      </div>

      <!-- Arabic -->
      <p style="text-align:center; margin-top:28px; font-size:12px; color:rgba(221,213,200,0.1);">
        بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
      </p>
    </template>

    <!-- Weight Modal -->
    <Teleport to="body">
      <div v-if="showWeightModal" class="modal-overlay" @click.self="showWeightModal = false">
        <div class="modal-card">
          <p class="label-upper" style="margin-bottom:12px;">Update Berat Badan</p>
          <input
            v-model.number="newWeight"
            type="number"
            step="0.1"
            min="30"
            max="200"
            class="weight-input mono"
            placeholder="80.5"
            autofocus
          />
          <span class="text-muted" style="font-size:14px; margin-left:6px;">kg</span>
          <div style="display:flex; gap:10px; margin-top:18px;">
            <button class="btn-secondary" @click="showWeightModal = false">Batal</button>
            <button class="btn-primary" style="flex:1" @click="handleSaveWeight">Simpan</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import PentagonCircle from '@/components/shared/PentagonCircle.vue'
import PrayerTimerCard from '@/components/timer/PrayerTimerCard.vue'

const store = useHealthStore()

const PRAYERS_DATA = [
  { id: 'subuh',   label: 'Subuh',   icon: '🌙' },
  { id: 'dzuhur',  label: 'Dzuhur',  icon: '☀️' },
  { id: 'ashar',   label: 'Ashar',   icon: '⛅' },
  { id: 'maghrib', label: 'Maghrib', icon: '🌅' },
  { id: 'isya',    label: 'Isya',    icon: '🌃' },
]

const selectedPrayer   = ref('subuh')
const showWeightModal  = ref(false)
const newWeight        = ref(store.weightKg)

const today       = new Date()
const dayName     = today.toLocaleDateString('id-ID', { weekday: 'long' })
const dateDisplay = today.toLocaleDateString('id-ID', { day: 'numeric' })
const monthDisplay = today.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })

const selectedPrayerData = computed(() =>
  PRAYERS_DATA.find(p => p.id === selectedPrayer.value)
)

const plankDoneMap = computed(() => {
  const map = {}
  PRAYERS_DATA.forEach(p => {
    map[p.id] = store.todayPrayers[p.id]?.plank_done || false
  })
  return map
})

const prayerDoneMap = computed(() => {
  const map = {}
  PRAYERS_DATA.forEach(p => {
    map[p.id] = store.todayPrayers[p.id]?.prayed || false
  })
  return map
})

async function handleSaveWeight() {
  if (!newWeight.value || newWeight.value < 30) return
  await store.updateWeight(newWeight.value)
  showWeightModal.value = false
}
</script>

<style scoped>
.today-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 28px;
  position: relative;
  z-index: 1;
}

.weight-pill {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 10px 14px;
  cursor: pointer;
  text-align: center;
  min-width: 80px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.2s;
}
.weight-pill:active { border-color: var(--gold); }

.weight-value {
  font-size: 20px;
  font-weight: 700;
}

/* Loading */
.loading-state {
  display: flex;
  justify-content: center;
  padding: 60px 0;
}
.loading-spinner {
  width: 32px; height: 32px;
  border: 2px solid var(--border);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Prayer list */
.prayer-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}

.prayer-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  background: var(--bg-card);
  border: 1px solid transparent;
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.prayer-list-item.is-selected {
  background: var(--bg-card-hover);
  border-color: var(--border);
}
.prayer-list-item:active { opacity: 0.7; }

.prayer-list-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.prayer-list-name { font-size: 13px; font-weight: 500; }
.prayer-list-time { font-size: 10px; }

.prayer-list-badges { display: flex; gap: 5px; }

.badge {
  width: 24px; height: 24px;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.06);
  filter: grayscale(1) opacity(0.35);
  transition: all 0.2s;
}
.badge-active-blue  { background: rgba(168,200,255,0.15); border-color: rgba(168,200,255,0.3); filter: none; }
.badge-active-green { background: rgba(110,231,122,0.15); border-color: rgba(110,231,122,0.3); filter: none; }

/* Calories */
.calories-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* Weight modal */
.modal-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: flex-end;
  padding: 20px;
}
.modal-card {
  background: #131f1a;
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 24px;
  width: 100%;
  animation: slideUp 0.25s ease;
}
@keyframes slideUp {
  from { transform: translateY(30px); opacity: 0; }
  to   { transform: translateY(0); opacity: 1; }
}

.weight-input {
  background: transparent;
  border: none;
  border-bottom: 2px solid var(--gold);
  color: var(--gold);
  font-size: 36px;
  font-weight: 700;
  width: 120px;
  outline: none;
  font-family: var(--font-mono);
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-secondary);
  padding: 12px 20px;
  border-radius: var(--radius-md);
  font-size: 13px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
</style>

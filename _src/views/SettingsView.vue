<!-- src/views/SettingsView.vue -->
<template>
  <div class="page-container">
    <header style="margin-bottom:24px;">
      <p class="label-upper">Pengaturan</p>
      <h1 class="display-title">Profil <span class="text-gold">Saya</span></h1>
    </header>

    <!-- Profile card -->
    <div class="card" style="margin-bottom:12px;">
      <p class="label-upper" style="margin-bottom:14px;">Data Awal</p>

      <div class="setting-row">
        <span class="text-secondary" style="font-size:13px;">Berat Awal</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <input v-model.number="startWeight" type="number" step="0.1" class="setting-input mono text-gold" />
          <span class="text-muted" style="font-size:12px;">kg</span>
        </div>
      </div>

      <div class="setting-row">
        <span class="text-secondary" style="font-size:13px;">Tinggi Badan</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <input v-model.number="height" type="number" class="setting-input mono text-gold" />
          <span class="text-muted" style="font-size:12px;">cm</span>
        </div>
      </div>

      <div class="setting-row" style="border:none; padding-bottom:0;">
        <span class="text-secondary" style="font-size:13px;">Target Berat</span>
        <div style="display:flex; align-items:center; gap:6px;">
          <input v-model.number="targetWeight" type="number" step="0.1" class="setting-input mono text-gold" />
          <span class="text-muted" style="font-size:12px;">kg</span>
        </div>
      </div>
    </div>

    <!-- BMI card -->
    <div class="card" style="margin-bottom:12px;">
      <p class="label-upper" style="margin-bottom:10px;">BMI Saat Ini</p>
      <div style="display:flex; align-items:baseline; gap:8px;">
        <span class="mono text-gold" style="font-size:36px; font-weight:700;">{{ bmi }}</span>
        <span :class="bmiClass" style="font-size:12px; font-weight:600;">{{ bmiLabel }}</span>
      </div>
      <p class="text-muted" style="font-size:10px; margin-top:6px;">
        {{ store.weightKg }}kg ÷ ({{ height / 100 }}m)² = {{ bmi }}
      </p>
    </div>

    <!-- Notification settings -->
    <div class="card">
      <p class="label-upper" style="margin-bottom:14px;">Notifikasi</p>
      <div class="setting-row" style="border:none; padding-bottom:0;">
        <div>
          <span class="text-secondary" style="font-size:13px;">Reminder Plank</span>
          <p class="text-muted" style="font-size:10px; margin-top:2px;">
            +10 menit setelah waktu sholat
          </p>
        </div>
        <button
          class="toggle-btn"
          :class="{ 'toggle-active': notifEnabled }"
          @click="toggleNotification"
        >
          {{ notifEnabled ? 'ON' : 'OFF' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import { requestNotificationPermission } from '@/services/notificationService.js'

const store = useHealthStore()

const startWeight  = ref(72)
const height       = ref(170)
const targetWeight = ref(68)
const notifEnabled = ref(false)

const bmi = computed(() => {
  const h = height.value / 100
  return (store.weightKg / (h * h)).toFixed(1)
})

const bmiLabel = computed(() => {
  const b = parseFloat(bmi.value)
  if (b < 18.5) return 'Kurus'
  if (b < 25)   return 'Normal ✓'
  if (b < 30)   return 'Overweight'
  return 'Obesitas'
})

const bmiClass = computed(() => {
  const b = parseFloat(bmi.value)
  if (b < 18.5) return 'text-blue'
  if (b < 25)   return 'text-green'
  return 'text-muted'
})

async function toggleNotification() {
  if (!notifEnabled.value) {
    const token = await requestNotificationPermission()
    notifEnabled.value = !!token
  } else {
    notifEnabled.value = false
  }
}
</script>

<style scoped>
.setting-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
}

.setting-input {
  background: transparent;
  border: none;
  border-bottom: 1px solid rgba(240,200,96,0.3);
  color: var(--gold);
  font-size: 18px;
  font-weight: 700;
  width: 70px;
  text-align: right;
  outline: none;
  font-family: var(--font-mono);
}

.toggle-btn {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: var(--text-muted);
  transition: all 0.2s;
}
.toggle-active {
  background: rgba(110,231,122,0.15);
  border-color: rgba(110,231,122,0.3);
  color: var(--green);
}
</style>

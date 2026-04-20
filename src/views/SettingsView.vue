<template>
  <div class="page-container">
    <header style="margin-bottom:24px;">
      <p class="label-upper">Pengaturan</p>
      <h1 class="display-title">
        Profil <span class="text-gold">Saya</span>
      </h1>
    </header>

    <!-- User card -->
    <div class="card" style="margin-bottom:12px;">
      <div class="user-row">
        <img
          v-if="authStore.photoURL"
          :src="authStore.photoURL"
          class="user-avatar"
          :alt="authStore.displayName"
        />
        <div v-else class="user-avatar-placeholder">
          {{ authStore.displayName?.charAt(0) }}
        </div>
        <div>
          <div style="font-weight:700; font-size:15px;">{{ authStore.displayName }}</div>
          <div class="text-muted" style="font-size:11px;">{{ authStore.email }}</div>
        </div>
      </div>
    </div>

    <!-- Data awal -->
    <div class="card" style="margin-bottom:12px;">
      <p class="label-upper" style="margin-bottom:14px;">Data Kesehatan</p>

      <div v-for="field in fields" :key="field.key" class="setting-row">
        <div>
          <span class="text-secondary" style="font-size:13px;">{{ field.label }}</span>
          <p v-if="field.hint" class="text-muted" style="font-size:10px; margin-top:1px;">{{ field.hint }}</p>
        </div>
        <div style="display:flex; align-items:center; gap:6px;">
          <input
            v-model.number="form[field.key]"
            type="number"
            :step="field.step || 1"
            :placeholder="field.placeholder"
            class="setting-input mono text-gold"
          />
          <span class="text-muted" style="font-size:12px;">{{ field.unit }}</span>
        </div>
      </div>

      <!-- BMI realtime -->
      <div v-if="bmi" class="bmi-row">
        <span class="text-secondary" style="font-size:12px;">BMI saat ini</span>
        <div style="display:flex; align-items:baseline; gap:8px;">
          <span class="mono text-gold" style="font-size:22px; font-weight:700;">{{ bmi }}</span>
          <span :class="bmiClass" style="font-size:11px; font-weight:600;">{{ bmiLabel }}</span>
        </div>
      </div>

      <button
        class="btn-save"
        :disabled="isSaving"
        @click="saveData"
      >
        {{ isSaving ? 'Menyimpan...' : 'Simpan Data' }}
      </button>

      <div v-if="saveSuccess" class="save-success">
        ✓ Tersimpan
      </div>
    </div>


    <!-- Custom Timer -->
    <div class="card" style="margin-bottom:12px;">
      <p class="label-upper" style="margin-bottom:14px;">Timer Plank</p>

      <!-- Mode toggle -->
      <div class="setting-row">
        <div>
          <span class="text-secondary" style="font-size:13px;">Mode</span>
          <p class="text-muted" style="font-size:10px; margin-top:2px;">
            Auto: naik +1s setiap 3 hari (sekarang {{ healthStore.autoDuration }}s)
          </p>
        </div>
        <div class="mode-toggle">
          <button
            class="mode-btn" :class="{ active: !useCustom }"
            @click="setAutoMode">Auto</button>
          <button
            class="mode-btn" :class="{ active: useCustom }"
            @click="setCustomMode">Custom</button>
        </div>
      </div>

      <!-- Custom duration input — hanya tampil kalau mode Custom -->
      <Transition name="expand">
        <div v-if="useCustom" class="custom-timer-wrap">
          <p class="text-secondary" style="font-size:12px; margin-bottom:12px;">
            Pilih durasi plank kamu:
          </p>

          <!-- Quick presets -->
          <div class="presets">
            <button
              v-for="sec in presets" :key="sec"
              class="preset-btn"
              :class="{ 'preset-active': form.custom_duration === sec }"
              @click="form.custom_duration = sec"
            >
              {{ sec }}s
            </button>
          </div>

          <!-- Manual input -->
          <div class="custom-input-row">
            <span class="text-secondary" style="font-size:12px;">Atau ketik manual:</span>
            <div style="display:flex; align-items:center; gap:6px;">
              <input
                v-model.number="form.custom_duration"
                type="number" min="5" max="300"
                class="setting-input mono text-gold"
                style="width:70px"
              />
              <span class="text-muted" style="font-size:12px;">detik</span>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="form.custom_duration" class="timer-preview">
            <span class="text-muted" style="font-size:11px;">Preview:</span>
            <span class="mono text-gold" style="font-size:22px; font-weight:700;">
              {{ form.custom_duration }}s
            </span>
            <span class="text-muted" style="font-size:10px;">
              ≈ {{ previewCalories }} kcal/sesi
            </span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Notification -->
    <div class="card" style="margin-bottom:12px;">
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

    <!-- Logout -->
    <button class="btn-logout" @click="handleLogout">
      Keluar dari Akun
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useHealthStore } from '@/stores/health.js'
import { getProfile, saveProfile } from '@/services/healthService.js'
import { requestNotificationPermission } from '@/services/notificationService.js'

const authStore   = useAuthStore()
const healthStore = useHealthStore()
const router      = useRouter()

const isSaving     = ref(false)
const saveSuccess  = ref(false)
const notifEnabled = ref(false)
const useCustom    = ref(healthStore.customDuration !== null)

const presets = [10, 15, 20, 30, 45, 60, 90, 120]

const form = ref({
  weight_start:    null,
  weight_target:   null,
  height_cm:       null,
  custom_duration: healthStore.customDuration || 30,
})

const previewCalories = computed(() => {
  if (!form.value.custom_duration) return '0.00'
  return (((3.5 * healthStore.weightKg * 3.5) / 200) * (form.value.custom_duration / 60)).toFixed(2)
})

function setAutoMode() {
  useCustom.value = false
  healthStore.setCustomDuration(null)
}

function setCustomMode() {
  useCustom.value = true
  healthStore.setCustomDuration(form.value.custom_duration || 30)
}

const fields = [
  { key: 'weight_start',  label: 'Berat Awal',    unit: 'kg', step: 0.1, placeholder: '80', hint: 'Berat saat mulai program' },
  { key: 'weight_target', label: 'Target Berat',  unit: 'kg', step: 0.1, placeholder: '72' },
  { key: 'height_cm',     label: 'Tinggi Badan',  unit: 'cm', placeholder: '170' },
]

// Load profil saat mount
onMounted(async () => {
  try {
    const profile = await getProfile()
    if (profile) {
      form.value.weight_start  = profile.weight_start
      form.value.weight_target = profile.weight_target
      form.value.height_cm     = profile.height_cm
    }
  } catch (e) {
    console.error('Load profile error:', e)
  }
})

// BMI computed
const bmi = computed(() => {
  const w = healthStore.weightKg
  const h = form.value.height_cm
  if (!w || !h) return null
  return (w / ((h / 100) ** 2)).toFixed(1)
})

const bmiLabel = computed(() => {
  const b = parseFloat(bmi.value)
  if (!b) return ''
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

// Save ke Firestore
async function saveData() {
  isSaving.value    = true
  saveSuccess.value = false
  try {
    const dataToSave = {
      ...form.value,
      custom_duration: useCustom.value ? form.value.custom_duration : null,
    }
    await saveProfile(dataToSave)
    // Update store langsung
    if (useCustom.value) {
      healthStore.setCustomDuration(form.value.custom_duration)
    } else {
      healthStore.setCustomDuration(null)
    }
    saveSuccess.value = true
    setTimeout(() => { saveSuccess.value = false }, 2500)
  } catch (e) {
    console.error('Save error:', e)
  } finally {
    isSaving.value = false
  }
}

async function toggleNotification() {
  if (!notifEnabled.value) {
    const token = await requestNotificationPermission()
    notifEnabled.value = !!token
    if (token) await saveProfile({ fcm_token: token })
  } else {
    notifEnabled.value = false
  }
}

async function handleLogout() {
  await authStore.logout()
  router.push('/auth')
}
</script>

<style scoped>
.user-row {
  display: flex;
  align-items: center;
  gap: 14px;
}

.user-avatar {
  width: 48px; height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--border);
}

.user-avatar-placeholder {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(240,200,96,0.15);
  border: 2px solid rgba(240,200,96,0.3);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 700; color: var(--gold);
}

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
  width: 80px;
  text-align: right;
  outline: none;
  font-family: var(--font-mono);
}
.setting-input:focus {
  border-bottom-color: var(--gold);
}

.bmi-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.btn-save {
  width: 100%;
  margin-top: 16px;
  padding: 12px;
  background: rgba(240,200,96,0.14);
  border: 1px solid rgba(240,200,96,0.3);
  border-radius: var(--radius-md);
  color: var(--gold);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.btn-save:active:not(:disabled) { transform: scale(0.98); }
.btn-save:disabled { opacity: 0.5; cursor: default; }

.save-success {
  text-align: center;
  margin-top: 8px;
  font-size: 12px;
  color: var(--green);
  font-weight: 600;
}

.toggle-btn {
  padding: 6px 16px;
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

.btn-logout {
  width: 100%;
  padding: 13px;
  background: transparent;
  border: 1px solid rgba(255, 107, 107, 0.2);
  border-radius: var(--radius-md);
  color: rgba(255, 107, 107, 0.6);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.btn-logout:active {
  background: rgba(255,107,107,0.08);
  color: var(--red);
}

.mode-toggle {
  display: flex;
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 3px;
  gap: 2px;
}

.mode-btn {
  padding: 5px 12px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: var(--font-body);
}
.mode-btn.active {
  background: rgba(240,200,96,0.15);
  color: var(--gold);
}

.custom-timer-wrap {
  padding-top: 14px;
  border-top: 1px solid var(--border);
  margin-top: 4px;
}

.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 14px;
}

.preset-btn {
  padding: 7px 14px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-mono);
  transition: all 0.15s;
  -webkit-tap-highlight-color: transparent;
}
.preset-btn:active { transform: scale(0.95); }
.preset-active {
  background: rgba(240,200,96,0.15);
  border-color: rgba(240,200,96,0.4);
  color: var(--gold);
}

.custom-input-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.timer-preview {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(240,200,96,0.06);
  border: 1px solid rgba(240,200,96,0.15);
  border-radius: 10px;
}

/* Expand transition */
.expand-enter-active, .expand-leave-active {
  transition: all 0.25s ease;
  overflow: hidden;
}
.expand-enter-from, .expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
}
.expand-enter-to, .expand-leave-from {
  opacity: 1;
  max-height: 500px;
}
</style>

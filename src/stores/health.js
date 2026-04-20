import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDailyLog, getMonthlyLogs, getProfile,
  savePlankSession, saveWeight, markPrayer,
  getTargetDuration, calcCalories, calcConsistencyScore
} from '@/services/healthService.js'
import { getPrayerTimes, getUserLocation } from '@/services/prayerTimesService.js'
import { schedulePrayerReminders } from '@/services/notificationService.js'

export const useHealthStore = defineStore('health', () => {

  const todayLog     = ref(null)
  const monthlyLogs  = ref([])
  const prayerTimes  = ref({})
  const weightKg     = ref(80)
  const isLoading    = ref(false)
  const error        = ref(null)

  // ── Custom timer duration ────────────────────────────────────────────────
  // null = pakai progressive overload otomatis
  // number = durasi custom dari settings user
  const customDuration = ref(null)

  const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

  // ── Computed ──────────────────────────────────────────────────────────────
  const autoDuration = computed(() => getTargetDuration())

  // Durasi aktual yang dipakai: custom jika diset, otherwise auto
  const targetDuration = computed(() =>
    customDuration.value !== null ? customDuration.value : autoDuration.value
  )

  const todayPrayers = computed(() => todayLog.value?.prayers || {})

  const plankDoneCount = computed(() =>
    PRAYERS.filter(p => todayPrayers.value[p]?.plank_done).length
  )

  const prayerDoneCount = computed(() =>
    PRAYERS.filter(p => todayPrayers.value[p]?.prayed).length
  )

  const todayCalories = computed(() =>
    PRAYERS
      .filter(p => todayPrayers.value[p]?.plank_done)
      .reduce((sum, p) => {
        const dur = todayPrayers.value[p]?.duration_seconds || 0
        return sum + calcCalories(weightKg.value, dur)
      }, 0)
  )

  const consistencyScore = computed(() => calcConsistencyScore(monthlyLogs.value))

  const streak = computed(() => {
    let count = 0
    const sorted = [...monthlyLogs.value].reverse()
    for (const log of sorted) {
      const hasPlank = log.prayers &&
        Object.values(log.prayers).some(p => p.plank_done)
      if (hasPlank) count++
      else break
    }
    return count
  })

  // ── Actions ───────────────────────────────────────────────────────────────
  async function loadTodayData() {
    isLoading.value = true
    error.value     = null
    try {
      todayLog.value = await getDailyLog()
      if (todayLog.value?.weight_kg) {
        weightKg.value = todayLog.value.weight_kg
      }
    } catch (e) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function loadMonthlyData() {
    const now = new Date()
    monthlyLogs.value = await getMonthlyLogs(now.getFullYear(), now.getMonth() + 1)
  }

  async function loadPrayerTimes() {
    try {
      const { lat, lng } = await getUserLocation()
      prayerTimes.value  = await getPrayerTimes(lat, lng)
      schedulePrayerReminders(prayerTimes.value)
    } catch {
      prayerTimes.value = await getPrayerTimes(null, null).catch(() => ({}))
    }
  }

  async function loadProfile() {
    try {
      const profile = await getProfile()
      if (profile?.custom_duration !== undefined) {
        customDuration.value = profile.custom_duration
      }
      if (profile?.weight_start) {
        weightKg.value = profile.weight_start
      }
    } catch (_) {}
  }

  async function completePlank(prayerId) {
    const duration = targetDuration.value
    await savePlankSession(prayerId, duration)
    if (!todayLog.value)           todayLog.value = { prayers: {} }
    if (!todayLog.value.prayers)   todayLog.value.prayers = {}
    todayLog.value.prayers[prayerId] = {
      ...todayLog.value.prayers[prayerId],
      plank_done:       true,
      duration_seconds: duration,
    }
  }

  async function togglePrayer(prayerId) {
    await markPrayer(prayerId)
    if (!todayLog.value)          todayLog.value = { prayers: {} }
    if (!todayLog.value.prayers)  todayLog.value.prayers = {}
    todayLog.value.prayers[prayerId] = {
      ...todayLog.value.prayers[prayerId],
      prayed: true,
    }
  }

  async function updateWeight(kg) {
    weightKg.value = kg
    await saveWeight(kg)
  }

  function setCustomDuration(val) {
    customDuration.value = val   // null = kembali ke auto
  }

  return {
    todayLog, monthlyLogs, prayerTimes,
    weightKg, isLoading, error,
    customDuration, autoDuration, targetDuration,
    todayPrayers, plankDoneCount, prayerDoneCount,
    todayCalories, consistencyScore, streak,
    PRAYERS,
    loadTodayData, loadMonthlyData, loadPrayerTimes, loadProfile,
    completePlank, togglePrayer, updateWeight, setCustomDuration,
  }
})

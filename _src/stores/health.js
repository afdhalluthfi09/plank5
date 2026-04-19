// src/stores/health.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  getDailyLog, getMonthlyLogs,
  savePlankSession, saveWeight, markPrayer,
  getTargetDuration, calcCalories, calcConsistencyScore
} from '@/services/healthService.js'
import { getPrayerTimes, getUserLocation } from '@/services/prayerTimesService.js'
import { schedulePrayerReminders } from '@/services/notificationService.js'

export const useHealthStore = defineStore('health', () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const todayLog      = ref(null)
  const monthlyLogs   = ref([])
  const prayerTimes   = ref({})
  const weightKg      = ref(80)
  const isLoading     = ref(false)
  const error         = ref(null)

  const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya']

  // ── Computed ──────────────────────────────────────────────────────────────

  const targetDuration = computed(() => getTargetDuration())

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

  const consistencyScore = computed(() =>
    calcConsistencyScore(monthlyLogs.value)
  )

  const streak = computed(() => {
    // Hitung hari berturut-turut dengan minimal 1 plank
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
    error.value = null
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
      prayerTimes.value = await getPrayerTimes(lat, lng)
      schedulePrayerReminders(prayerTimes.value)
    } catch {
      // Geolokasi ditolak atau offline — pakai fallback (sudah di-handle di service)
      const { getPrayerTimes: gpt } = await import('@/services/prayerTimesService.js')
      prayerTimes.value = await gpt(null, null).catch(() => ({}))
    }
  }

  async function completePlank(prayerId) {
    const duration = targetDuration.value
    await savePlankSession(prayerId, duration)
    // Update local state langsung (optimistic update — tidak perlu reload)
    if (!todayLog.value) todayLog.value = { prayers: {} }
    if (!todayLog.value.prayers) todayLog.value.prayers = {}
    todayLog.value.prayers[prayerId] = {
      ...todayLog.value.prayers[prayerId],
      plank_done: true,
      duration_seconds: duration
    }
  }

  async function togglePrayer(prayerId) {
    await markPrayer(prayerId)
    if (!todayLog.value) todayLog.value = { prayers: {} }
    if (!todayLog.value.prayers) todayLog.value.prayers = {}
    todayLog.value.prayers[prayerId] = {
      ...todayLog.value.prayers[prayerId],
      prayed: true
    }
  }

  async function updateWeight(kg) {
    weightKg.value = kg
    await saveWeight(kg)
  }

  return {
    // State
    todayLog, monthlyLogs, prayerTimes,
    weightKg, isLoading, error,
    // Computed
    targetDuration, todayPrayers, plankDoneCount,
    prayerDoneCount, todayCalories, consistencyScore, streak,
    // Actions
    loadTodayData, loadMonthlyData, loadPrayerTimes,
    completePlank, togglePrayer, updateWeight,
    PRAYERS
  }
})

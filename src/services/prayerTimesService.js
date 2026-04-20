// src/services/prayerTimesService.js
const CACHE_KEY = 'plank5_prayer_times'
const API_BASE  = 'https://api.aladhan.com/v1'

export async function getPrayerTimes(lat, lng) {
  const today    = new Date().toISOString().split('T')[0]
  const cacheKey = `${CACHE_KEY}_${today}`

  // Cek cache
  const cached = localStorage.getItem(cacheKey)
  if (cached) return JSON.parse(cached)

  // Kalau lat/lng null → langsung fallback, jangan panggil API
  if (!lat || !lng) {
    console.warn('[PrayerTimes] Koordinat tidak tersedia, pakai fallback Jakarta')
    return getFallbackTimes()
  }

  try {
    const res  = await fetch(`${API_BASE}/timings?latitude=${lat}&longitude=${lng}&method=11`)
    const json = await res.json()
    if (json.code !== 200) throw new Error('API error')

    const raw   = json.data.timings
    const times = {
      subuh:   raw.Fajr,
      syuruq:  raw.Sunrise,
      dzuhur:  raw.Dhuhr,
      ashar:   raw.Asr,
      maghrib: raw.Maghrib,
      isya:    raw.Isha,
    }

    localStorage.setItem(cacheKey, JSON.stringify(times))
    cleanOldCache()
    return times
  } catch (err) {
    console.error('[PrayerTimes] Gagal fetch:', err)
    return getFallbackTimes()
  }
}

export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 8000, maximumAge: 3600000 }
    )
  })
}

function getFallbackTimes() {
  return {
    subuh:   '04:35',
    syuruq:  '05:50',
    dzuhur:  '12:00',
    ashar:   '15:20',
    maghrib: '18:05',
    isya:    '19:15',
  }
}

function cleanOldCache() {
  const today = new Date().toISOString().split('T')[0]
  Object.keys(localStorage)
    .filter(k => k.startsWith(CACHE_KEY) && !k.includes(today))
    .forEach(k => localStorage.removeItem(k))
}

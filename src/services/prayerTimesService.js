// src/services/prayerTimesService.js
// ── Waktu sholat otomatis berdasarkan lokasi ─────────────────────────────────
// API: AlAdhan — gratis, tanpa API key, akurat secara astronomi

const CACHE_KEY = 'plank5_prayer_times'
const API_BASE  = 'https://api.aladhan.com/v1'

/**
 * Ambil waktu sholat hari ini berdasarkan koordinat
 * Dengan caching harian di localStorage
 */
export async function getPrayerTimes(lat, lng) {
  const today   = new Date().toISOString().split('T')[0]
  const cacheKey = `${CACHE_KEY}_${today}`

  // Cek cache
  const cached = localStorage.getItem(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  try {
    const res = await fetch(
      `${API_BASE}/timings?latitude=${lat}&longitude=${lng}&method=11`
      //                                                    method=11 = SIHAT (Singapore/Malaysia/Indonesia)
    )
    const json = await res.json()

    if (json.code !== 200) throw new Error('API error')

    const raw = json.data.timings
    const times = {
      subuh:   raw.Fajr,
      syuruq:  raw.Sunrise,
      dzuhur:  raw.Dhuhr,
      ashar:   raw.Asr,
      maghrib: raw.Maghrib,
      isya:    raw.Isha,
    }

    // Cache sampai tengah malam
    localStorage.setItem(cacheKey, JSON.stringify(times))

    // Hapus cache hari kemarin
    cleanOldCache()

    return times
  } catch (err) {
    console.error('[PrayerTimes] Gagal fetch:', err)
    // Fallback: waktu estimasi untuk WIB (UTC+7)
    return getFallbackTimes()
  }
}

/**
 * Minta izin geolokasi dan return koordinat
 */
export async function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation tidak didukung'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { timeout: 10000, maximumAge: 3600000 }   // cache 1 jam
    )
  })
}

/**
 * Fallback waktu sholat (Jakarta, WIB)
 * Dipakai saat offline atau geolokasi ditolak
 */
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

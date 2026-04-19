// src/services/notificationService.js
// ── Push Notification untuk reminder waktu sholat ────────────────────────────

import { getToken, onMessage } from 'firebase/messaging'
import { messaging } from './firebase.js'

const VAPID_KEY = import.meta.env.VITE_VAPID_KEY

// ── Request permission & get FCM token ───────────────────────────────────────

export async function requestNotificationPermission() {
  if (!('Notification' in window)) {
    console.warn('[FCM] Browser tidak support notifikasi')
    return null
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    console.warn('[FCM] User menolak notifikasi')
    return null
  }

  if (!messaging) {
    console.warn('[FCM] Messaging tidak tersedia')
    return null
  }

  try {
    // Dapatkan registration dari service worker PWA
    const registration = await navigator.serviceWorker.ready
    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    })
    console.log('[FCM] Token:', token)

    // Simpan token ke Firestore untuk dikirim notifikasi dari server nanti
    // await saveProfile({ fcm_token: token })

    return token
  } catch (err) {
    console.error('[FCM] Gagal mendapatkan token:', err)
    return null
  }
}

// ── Handle foreground message (saat app terbuka) ─────────────────────────────

export function onForegroundMessage(callback) {
  if (!messaging) return
  return onMessage(messaging, callback)
}

// ── Local notification fallback (tanpa server) ───────────────────────────────
// Dipakai saat Phase 1 — reminder berbasis waktu lokal
// Cocok untuk personal use sebelum ada backend

const PRAYER_SCHEDULE = [
  { id: 'subuh',   label: 'Subuh',   icon: '🌙' },
  { id: 'dzuhur',  label: 'Dzuhur',  icon: '☀️' },
  { id: 'ashar',   label: 'Ashar',   icon: '⛅' },
  { id: 'maghrib', label: 'Maghrib', icon: '🌅' },
  { id: 'isya',    label: 'Isya',    icon: '🌃' },
]

let scheduledTimers = []

/**
 * Schedule local notifications berdasarkan waktu sholat dari API
 * @param {Object} prayerTimes - { subuh: "04:30", dzuhur: "12:00", ... }
 */
export function schedulePrayerReminders(prayerTimes) {
  // Clear existing
  scheduledTimers.forEach(t => clearTimeout(t))
  scheduledTimers = []

  const now = new Date()

  PRAYER_SCHEDULE.forEach(prayer => {
    const timeStr = prayerTimes[prayer.id]
    if (!timeStr) return

    const [hour, minute] = timeStr.split(':').map(Number)
    const prayerDate = new Date()
    prayerDate.setHours(hour, minute + 10, 0, 0)   // +10 menit setelah waktu sholat

    const msUntil = prayerDate - now
    if (msUntil <= 0) return   // Waktu sudah lewat hari ini

    const timer = setTimeout(() => {
      showLocalNotification({
        title: `${prayer.icon} Waktunya Plank — ${prayer.label}`,
        body: `Kamu sudah sholat ${prayer.label}? Yuk plank 10 detik sekarang! 💪`,
        tag: `plank-reminder-${prayer.id}`,
        data: { prayerId: prayer.id }
      })
    }, msUntil)

    scheduledTimers.push(timer)
    console.log(`[Notif] ${prayer.label} reminder dijadwalkan dalam ${Math.round(msUntil / 60000)} menit`)
  })
}

function showLocalNotification({ title, body, tag, data }) {
  if (Notification.permission !== 'granted') return

  navigator.serviceWorker.ready.then(registration => {
    registration.showNotification(title, {
      body,
      tag,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
      data,
      vibrate: [100, 50, 100],
      actions: [
        { action: 'plank', title: '💪 Plank sekarang' },
        { action: 'dismiss', title: 'Nanti' }
      ]
    })
  })
}

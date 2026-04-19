// src/services/healthService.js
// ── SERVICE LAYER: Satu-satunya pintu ke database ────────────────────────────
//
// ARSITEKTUR MIGRASI:
//   Phase 1 (sekarang): semua fungsi pakai Firebase
//   Phase 2 (Laravel/NestJS): tinggal ganti implementasi di sini
//   Komponen Vue TIDAK PERLU DIUBAH sama sekali
//
// Contoh swap nanti:
//   SEKARANG: await setDoc(doc(db, ...), data)
//   NANTI:    await axios.post('/api/health/logs', data)
// ─────────────────────────────────────────────────────────────────────────────

import {
  doc, getDoc, setDoc, updateDoc,
  collection, query, where, getDocs, orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase.js'

// ── Helpers ──────────────────────────────────────────────────────────────────

const USER_ID = 'personal_01'   // Phase 1: hardcoded. Phase 2: dari JWT token

/** Format tanggal ke string YYYY-MM-DD */
const toDateKey = (date = new Date()) =>
  date.toISOString().split('T')[0]

/** Path dokumen log harian */
const dailyDocRef = (dateKey) =>
  doc(db, 'health_logs', USER_ID, 'daily', dateKey)

// ── Struktur data satu dokumen harian ─────────────────────────────────────
//
// health_logs/{userId}/daily/{YYYY-MM-DD}
// {
//   date: "2026-04-19",
//   weight_kg: 80.5,           // null jika belum dicatat hari ini
//   prayers: {
//     subuh:   { prayed: true, plank_done: true, duration_seconds: 16, completed_at: Timestamp },
//     dzuhur:  { prayed: true, plank_done: false, duration_seconds: 0, completed_at: null },
//     ashar:   { ... },
//     maghrib: { ... },
//     isya:    { ... }
//   },
//   created_at: Timestamp,
//   updated_at: serverTimestamp()   // SELALU server time, bukan client
// }

// ── READ ─────────────────────────────────────────────────────────────────────

/**
 * Ambil log hari ini (atau tanggal tertentu)
 * Return null jika belum ada
 */
export async function getDailyLog(date = new Date()) {
  const ref = dailyDocRef(toDateKey(date))
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

/**
 * Ambil semua log dalam sebulan
 * Dipakai oleh heatmap & riwayat
 */
export async function getMonthlyLogs(year, month) {
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate   = `${year}-${String(month).padStart(2, '0')}-31`

  const colRef = collection(db, 'health_logs', USER_ID, 'daily')
  const q = query(
    colRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

/**
 * Ambil profil user (berat awal, target, dll)
 */
export async function getProfile() {
  const ref = doc(db, 'users', USER_ID)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ── WRITE ─────────────────────────────────────────────────────────────────────

/**
 * Simpan/update berat badan hari ini
 */
export async function saveWeight(weightKg, date = new Date()) {
  const dateKey = toDateKey(date)
  const ref = dailyDocRef(dateKey)
  await setDoc(ref, {
    date: dateKey,
    weight_kg: weightKg,
    updated_at: serverTimestamp()
  }, { merge: true })   // merge: true → tidak overwrite field lain
}

/**
 * Tandai sholat selesai
 */
export async function markPrayer(prayerId, date = new Date()) {
  const dateKey = toDateKey(date)
  const ref = dailyDocRef(dateKey)
  await setDoc(ref, {
    date: dateKey,
    [`prayers.${prayerId}.prayed`]: true,
    [`prayers.${prayerId}.prayed_at`]: serverTimestamp(),
    updated_at: serverTimestamp()
  }, { merge: true })
}

/**
 * Simpan hasil plank yang sudah selesai
 * @param {string} prayerId - subuh/dzuhur/ashar/maghrib/isya
 * @param {number} durationSeconds - durasi aktual (bisa lebih dari target)
 */
export async function savePlankSession(prayerId, durationSeconds, date = new Date()) {
  const dateKey = toDateKey(date)
  const ref = dailyDocRef(dateKey)

  await setDoc(ref, {
    date: dateKey,
    [`prayers.${prayerId}.plank_done`]: true,
    [`prayers.${prayerId}.duration_seconds`]: durationSeconds,
    [`prayers.${prayerId}.completed_at`]: serverTimestamp(),
    updated_at: serverTimestamp()
  }, { merge: true })
}

/**
 * Simpan atau update profil user
 */
export async function saveProfile(data) {
  const ref = doc(db, 'users', USER_ID)
  await setDoc(ref, {
    ...data,
    updated_at: serverTimestamp()
  }, { merge: true })
}

// ── COMPUTED (helper, bukan DB call) ─────────────────────────────────────────

/**
 * Hitung durasi plank target hari ini (progressive overload)
 * +1 detik setiap 3 hari
 */
export function getTargetDuration(dayOfMonth = new Date().getDate()) {
  return 10 + Math.floor(dayOfMonth / 3)
}

/**
 * Hitung kalori via MET formula
 * MET=3.5, standar Compendium of Physical Activities
 */
export function calcCalories(weightKg, seconds) {
  return ((3.5 * weightKg * 3.5) / 200) * (seconds / 60)
}

/**
 * Hitung consistency score bulan ini
 * @param {Array} monthlyLogs - dari getMonthlyLogs()
 */
export function calcConsistencyScore(monthlyLogs) {
  const today = new Date().getDate()
  const totalTarget = today * 5       // 5 waktu × hari yang sudah berlalu
  let totalDone = 0

  monthlyLogs.forEach(log => {
    if (!log.prayers) return
    Object.values(log.prayers).forEach(p => {
      if (p.plank_done) totalDone++
    })
  })

  return totalTarget > 0
    ? Math.round((totalDone / totalTarget) * 100)
    : 0
}

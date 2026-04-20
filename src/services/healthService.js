// src/services/healthService.js
// ── MIGRATION BOUNDARY ────────────────────────────────────────────────────────
// Phase 1: Firebase | Phase 2: swap ke axios.post('/api/...') saja

import {
  doc, getDoc, setDoc,
  collection, query, where, getDocs, orderBy,
  serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase.js'
import { auth } from './firebase.js'

// ── Helper: selalu pakai UID dari auth, bukan hardcoded ──────────────────────
function getUserId() {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('User tidak login')
  return uid
}

const toDateKey = (date = new Date()) => date.toISOString().split('T')[0]

const dailyDocRef = (uid, dateKey) =>
  doc(db, 'health_logs', uid, 'daily', dateKey)

// ── READ ─────────────────────────────────────────────────────────────────────
export async function getDailyLog(date = new Date()) {
  const uid  = getUserId()
  const ref  = dailyDocRef(uid, toDateKey(date))
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

export async function getMonthlyLogs(year, month) {
  const uid       = getUserId()
  const startDate = `${year}-${String(month).padStart(2, '0')}-01`
  const endDate   = `${year}-${String(month).padStart(2, '0')}-31`
  const colRef    = collection(db, 'health_logs', uid, 'daily')
  const q         = query(
    colRef,
    where('date', '>=', startDate),
    where('date', '<=', endDate),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => d.data())
}

export async function getProfile() {
  const uid  = getUserId()
  const ref  = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// ── WRITE ─────────────────────────────────────────────────────────────────────
export async function saveWeight(weightKg, date = new Date()) {
  const uid     = getUserId()
  const dateKey = toDateKey(date)
  await setDoc(dailyDocRef(uid, dateKey), {
    date:       dateKey,
    weight_kg:  weightKg,
    updated_at: serverTimestamp()
  }, { merge: true })
}

export async function markPrayer(prayerId, date = new Date()) {
  const uid     = getUserId()
  const dateKey = toDateKey(date)
  await setDoc(dailyDocRef(uid, dateKey), {
    date: dateKey,
    [`prayers.${prayerId}.prayed`]:    true,
    [`prayers.${prayerId}.prayed_at`]: serverTimestamp(),
    updated_at: serverTimestamp()
  }, { merge: true })
}

export async function savePlankSession(prayerId, durationSeconds, date = new Date()) {
  const uid     = getUserId()
  const dateKey = toDateKey(date)
  await setDoc(dailyDocRef(uid, dateKey), {
    date: dateKey,
    [`prayers.${prayerId}.plank_done`]:        true,
    [`prayers.${prayerId}.duration_seconds`]:  durationSeconds,
    [`prayers.${prayerId}.completed_at`]:      serverTimestamp(),
    updated_at: serverTimestamp()
  }, { merge: true })
}

export async function saveProfile(data) {
  const uid = getUserId()
  await setDoc(doc(db, 'users', uid), {
    ...data,
    updated_at: serverTimestamp()
  }, { merge: true })
}

// ── COMPUTED ─────────────────────────────────────────────────────────────────
export function getTargetDuration(dayOfMonth = new Date().getDate()) {
  return 10 + Math.floor(dayOfMonth / 3)
}

export function calcCalories(weightKg, seconds) {
  return ((3.5 * weightKg * 3.5) / 200) * (seconds / 60)
}

export function calcConsistencyScore(monthlyLogs) {
  const today       = new Date().getDate()
  const totalTarget = today * 5
  let   totalDone   = 0
  monthlyLogs.forEach(log => {
    if (!log.prayers) return
    Object.values(log.prayers).forEach(p => { if (p.plank_done) totalDone++ })
  })
  return totalTarget > 0 ? Math.round((totalDone / totalTarget) * 100) : 0
}

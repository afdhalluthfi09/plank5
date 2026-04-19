// src/services/firebase.js
// ── Satu-satunya file yang tahu tentang Firebase SDK ─────────────────────────
// Saat migrasi ke Laravel/NestJS nanti, hanya file ini & healthService.js yang diganti

import { initializeApp } from 'firebase/app'
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
}

// Init app
const app = initializeApp(firebaseConfig)

// Firestore — dengan offline persistence (penting untuk mobile!)
export const db = getFirestore(app)
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    // Multiple tabs terbuka — persistence hanya aktif di satu tab
    console.warn('[Firestore] Persistence tidak aktif: multiple tabs')
  } else if (err.code === 'unimplemented') {
    // Browser tidak support
    console.warn('[Firestore] Persistence tidak didukung browser ini')
  }
})

// Auth
export const auth = getAuth(app)

// FCM (Firebase Cloud Messaging) — hanya jika browser support
export let messaging = null
isSupported().then((supported) => {
  if (supported) {
    messaging = getMessaging(app)
  }
})

export default app

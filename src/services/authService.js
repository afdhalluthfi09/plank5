// src/services/authService.js
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { auth, googleProvider, db } from './firebase.js'

// ── Google Sign-In ────────────────────────────────────────────────────────────
export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  const user   = result.user

  // Buat/update profil user di Firestore
  const userRef  = doc(db, 'users', user.uid)
  const userSnap = await getDoc(userRef)

  if (!userSnap.exists()) {
    // User baru — init profil default
    await setDoc(userRef, {
      uid:          user.uid,
      displayName:  user.displayName,
      email:        user.email,
      photoURL:     user.photoURL,
      weight_start: null,
      weight_target: null,
      height_cm:    null,
      created_at:   serverTimestamp(),
      updated_at:   serverTimestamp(),
    })
  } else {
    // User lama — update info Google terbaru
    await setDoc(userRef, {
      displayName: user.displayName,
      email:       user.email,
      photoURL:    user.photoURL,
      updated_at:  serverTimestamp(),
    }, { merge: true })
  }

  return user
}

// ── Sign Out ──────────────────────────────────────────────────────────────────
export async function signOutUser() {
  await signOut(auth)
}

// ── Auth State Listener ───────────────────────────────────────────────────────
export function onAuthChange(callback) {
  return onAuthStateChanged(auth, callback)
}

// ── Get current user ──────────────────────────────────────────────────────────
export function getCurrentUser() {
  return auth.currentUser
}

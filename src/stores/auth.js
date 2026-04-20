// src/stores/auth.js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { signInWithGoogle, signOutUser, onAuthChange } from '@/services/authService.js'

export const useAuthStore = defineStore('auth', () => {

  const user       = ref(null)
  const isLoading  = ref(true)   // true saat pertama load (cek session)
  const error      = ref(null)

  const isLoggedIn  = computed(() => !!user.value)
  const userId      = computed(() => user.value?.uid || null)
  const displayName = computed(() => user.value?.displayName || 'User')
  const photoURL    = computed(() => user.value?.photoURL || null)
  const email       = computed(() => user.value?.email || null)

  // ── Init: listen auth state ─────────────────────────────────────────────────
  // Dipanggil sekali di App.vue — persistent session otomatis
  function init() {
    return new Promise((resolve) => {
      onAuthChange((firebaseUser) => {
        user.value      = firebaseUser
        isLoading.value = false
        resolve(firebaseUser)
      })
    })
  }

  // ── Actions ─────────────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    error.value = null
    try {
      const firebaseUser = await signInWithGoogle()
      user.value = firebaseUser
    } catch (e) {
      error.value = e.message
      throw e
    }
  }

  async function logout() {
    await signOutUser()
    user.value = null
  }

  return {
    user, isLoading, error,
    isLoggedIn, userId, displayName, photoURL, email,
    init, loginWithGoogle, logout,
  }
})

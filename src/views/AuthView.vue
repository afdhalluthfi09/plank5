<template>
  <div class="auth-screen">
    <!-- Background -->
    <div class="auth-bg" />

    <div class="auth-container">
      <!-- Logo / Branding -->
      <div class="auth-brand">
        <div class="brand-pentagon">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <polygon
              points="36,6 66,26 55,60 17,60 6,26"
              fill="none" stroke="rgba(240,200,96,0.3)" stroke-width="1.5"
            />
            <polygon
              points="36,14 58,30 49,54 23,54 14,30"
              fill="rgba(240,200,96,0.08)" stroke="rgba(240,200,96,0.5)" stroke-width="1"
            />
            <text x="36" y="40" text-anchor="middle"
              fill="#f0c860" font-size="18" font-weight="700"
              font-family="'DM Mono', monospace">P5</text>
          </svg>
        </div>
        <h1 class="brand-title">Plank<span class="text-gold">5</span></h1>
        <p class="brand-subtitle">Kesehatan harian dengan 5 waktu sholat</p>
      </div>

      <!-- Value props -->
      <div class="value-props">
        <div v-for="prop in props" :key="prop.text" class="value-item">
          <span class="value-icon">{{ prop.icon }}</span>
          <span class="value-text">{{ prop.text }}</span>
        </div>
      </div>

      <!-- Google Sign-In Button -->
      <button
        class="btn-google"
        :disabled="isLoading"
        @click="handleGoogleLogin"
      >
        <svg v-if="!isLoading" width="20" height="20" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        <div v-else class="btn-spinner" />
        <span>{{ isLoading ? 'Menghubungkan...' : 'Masuk dengan Google' }}</span>
      </button>

      <!-- Error -->
      <div v-if="error" class="auth-error">
        {{ errorMessage }}
      </div>

      <!-- Footer note -->
      <p class="auth-note">
        Dengan masuk, data kesehatanmu tersimpan aman di cloud
        dan bisa diakses di semua perangkat.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const authStore = useAuthStore()
const router    = useRouter()
const isLoading = ref(false)
const error     = ref(null)

const props = [
  { icon: '🕌', text: 'Plank setiap waktu sholat — 5× sehari' },
  { icon: '📊', text: 'Pantau konsistensi & berat badan harian' },
  { icon: '🔬', text: 'Data ilmiah di balik setiap gerakan' },
  { icon: '🔔', text: 'Reminder otomatis setelah sholat' },
]

const errorMessage = computed(() => {
  if (!error.value) return ''
  if (error.value.includes('popup-closed')) return 'Login dibatalkan.'
  if (error.value.includes('network'))      return 'Tidak ada koneksi internet.'
  return 'Gagal login. Coba lagi.'
})

async function handleGoogleLogin() {
  isLoading.value = true
  error.value     = null
  try {
    await authStore.loginWithGoogle()
    router.push('/')
  } catch (e) {
    error.value = e.message
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.auth-screen {
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 20px;
  position: relative;
  overflow: hidden;
}

.auth-bg {
  position: fixed;
  inset: 0;
  background:
    radial-gradient(ellipse 100% 60% at 50% 0%, rgba(15,55,30,0.6) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 100%, rgba(30,15,5,0.3) 0%, transparent 50%);
  pointer-events: none;
}

.auth-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 360px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
}

/* Brand */
.auth-brand { text-align: center; }

.brand-pentagon {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}

.brand-title {
  font-family: 'Playfair Display', serif;
  font-size: 40px;
  font-weight: 800;
  color: var(--text-primary);
  margin: 0 0 6px;
  letter-spacing: -1px;
}

.brand-subtitle {
  font-size: 13px;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

/* Value props */
.value-props {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.value-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
}

.value-icon { font-size: 16px; }

.value-text {
  font-size: 12px;
  color: var(--text-secondary);
}

/* Google button */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 14px 20px;
  background: #fff;
  border: none;
  border-radius: var(--radius-md);
  color: #3c4043;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 12px rgba(0,0,0,0.3);
  -webkit-tap-highlight-color: transparent;
}
.btn-google:active:not(:disabled) {
  transform: scale(0.98);
  box-shadow: 0 1px 6px rgba(0,0,0,0.2);
}
.btn-google:disabled {
  opacity: 0.7;
  cursor: default;
}

.btn-spinner {
  width: 20px; height: 20px;
  border: 2px solid #e0e0e0;
  border-top-color: #4285F4;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Error */
.auth-error {
  width: 100%;
  padding: 10px 14px;
  background: rgba(255, 107, 107, 0.1);
  border: 1px solid rgba(255, 107, 107, 0.25);
  border-radius: var(--radius-sm);
  color: var(--red);
  font-size: 12px;
  text-align: center;
}

/* Note */
.auth-note {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
  line-height: 1.6;
  padding: 0 10px;
}
</style>

<template>
  <!-- Loading awal saat cek sesi Firebase -->
  <div v-if="authStore.isLoading" class="splash">
    <div class="splash-logo">
      <svg width="60" height="60" viewBox="0 0 72 72">
        <polygon points="36,6 66,26 55,60 17,60 6,26"
          fill="none" stroke="rgba(240,200,96,0.2)" stroke-width="1.5"/>
        <polygon points="36,14 58,30 49,54 23,54 14,30"
          fill="rgba(240,200,96,0.08)" stroke="rgba(240,200,96,0.4)" stroke-width="1"/>
        <text x="36" y="40" text-anchor="middle"
          fill="#f0c860" font-size="16" font-weight="700"
          font-family="monospace">P5</text>
      </svg>
    </div>
    <div class="splash-spinner" />
  </div>

  <!-- App -->
  <template v-else>
    <div class="bg-ambient" />

    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Bottom Nav — hanya tampil kalau sudah login -->
    <nav v-if="authStore.isLoggedIn" class="bottom-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        custom
        v-slot="{ navigate, isActive }"
      >
        <button class="bottom-nav-item" @click="navigate">
          <span class="bottom-nav-icon">{{ item.icon }}</span>
          <span
            class="bottom-nav-label"
            :style="{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }"
          >{{ item.label }}</span>
        </button>
      </RouterLink>
    </nav>
  </template>
</template>

<script setup>
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'
import { useHealthStore } from '@/stores/health.js'
import { requestNotificationPermission } from '@/services/notificationService.js'

const authStore   = useAuthStore()
const healthStore = useHealthStore()
const router      = useRouter()

const navItems = [
  { to: '/',         icon: '🏠', label: 'Hari Ini'   },
  { to: '/history',  icon: '📊', label: 'Riwayat'    },
  { to: '/science',  icon: '🔬', label: 'Sains'      },
  { to: '/settings', icon: '⚙️', label: 'Pengaturan' },
]

// Init auth — cek sesi yang tersimpan
authStore.init().then(async (user) => {
  if (user) {
    // Sudah login — load data
    await Promise.all([
      healthStore.loadTodayData(),
      healthStore.loadMonthlyData(),
      healthStore.loadPrayerTimes(),
    ])
    await requestNotificationPermission()
  } else {
    // Belum login — redirect ke auth
    router.push('/auth')
  }
})

// Watch auth state changes
watch(() => authStore.isLoggedIn, async (loggedIn) => {
  if (!loggedIn) {
    router.push('/auth')
  }
})
</script>

<style>
.page-enter-active, .page-leave-active {
  transition: all 0.2s ease;
}
.page-enter-from { opacity: 0; transform: translateX(10px); }
.page-leave-to   { opacity: 0; transform: translateX(-10px); }

/* Splash screen */
.splash {
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  background: var(--bg);
}

.splash-logo { opacity: 0.8; }

.splash-spinner {
  width: 24px; height: 24px;
  border: 2px solid rgba(240,200,96,0.15);
  border-top-color: var(--gold);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>

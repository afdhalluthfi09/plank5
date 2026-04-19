<template>
  <div>
    <div class="bg-ambient" />

    <!-- Router view dengan transisi -->
    <RouterView v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="bottom-nav-item"
        :class="{ 'nav-active': $route.path === item.to }"
        custom
        v-slot="{ navigate, isActive }"
      >
        <button class="bottom-nav-item" @click="navigate">
          <span class="bottom-nav-icon">{{ item.icon }}</span>
          <span
            class="bottom-nav-label"
            :style="{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }"
          >
            {{ item.label }}
          </span>
        </button>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import { requestNotificationPermission } from '@/services/notificationService.js'

const store = useHealthStore()

const navItems = [
  { to: '/',         icon: '🏠', label: 'Hari Ini'  },
  { to: '/history',  icon: '📊', label: 'Riwayat'   },
  { to: '/science',  icon: '🔬', label: 'Sains'     },
  { to: '/settings', icon: '⚙️', label: 'Pengaturan'},
]

onMounted(async () => {
  // Load data awal
  await Promise.all([
    store.loadTodayData(),
    store.loadMonthlyData(),
    store.loadPrayerTimes(),
  ])

  // Minta izin notifikasi
  await requestNotificationPermission()
})
</script>

<style>
/* Page transition — slide feel seperti native app */
.page-enter-active,
.page-leave-active {
  transition: all 0.22s ease;
}
.page-enter-from {
  opacity: 0;
  transform: translateX(12px);
}
.page-leave-to {
  opacity: 0;
  transform: translateX(-12px);
}
</style>

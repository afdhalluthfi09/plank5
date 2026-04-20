import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth.js'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { requiresGuest: true }  // redirect ke / kalau sudah login
  },
  {
    path: '/',
    name: 'Today',
    component: () => import('@/views/TodayView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/history',
    name: 'History',
    component: () => import('@/views/HistoryView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/science',
    name: 'Science',
    component: () => import('@/views/ScienceView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// Navigation guard
router.beforeEach((to) => {
  const authStore = useAuthStore()

  // Belum selesai load sesi — biarkan lewat
  if (authStore.isLoading) return true

  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    return { name: 'Auth' }
  }
  if (to.meta.requiresGuest && authStore.isLoggedIn) {
    return { name: 'Today' }
  }
})

export default router

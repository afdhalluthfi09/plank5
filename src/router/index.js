import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/',         name: 'Today',    component: () => import('@/views/TodayView.vue') },
  { path: '/history',  name: 'History',  component: () => import('@/views/HistoryView.vue') },
  { path: '/science',  name: 'Science',  component: () => import('@/views/ScienceView.vue') },
  { path: '/settings', name: 'Settings', component: () => import('@/views/SettingsView.vue') },
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

export default createRouter({
  // Pakai import.meta.env.BASE_URL — otomatis baca dari vite.config.js
  // Dev: '/'   →   Production (GitHub Pages): '/plank5/'
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

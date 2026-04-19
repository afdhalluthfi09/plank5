import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  // GitHub Pages deploy di: https://USERNAME.github.io/plank5/
  // Ubah '/plank5/' sesuai nama repo kamu
  base: process.env.NODE_ENV === 'production' ? '/plank5/' : '/',

  plugins: [
    vue(),

    // ── PWA Configuration ────────────────────────────────────────────────────
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'icons/*.svg'],

      // Web App Manifest
      manifest: {
        name: 'Plank5 — Kesehatan Harian',
        short_name: 'Plank5',
        description: 'Catat plank 5 waktu sholat, pantau berat badan, konsisten setiap hari.',
        theme_color: '#0a1814',
        background_color: '#0a1814',
        display: 'standalone',          // Hilangkan browser chrome, tampil seperti native app
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },

      // Workbox: caching strategy
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            // Firestore calls: network first, fallback ke cache
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }   // 24 jam
            }
          },
          {
            // API waktu sholat: stale-while-revalidate (cukup akurat)
            urlPattern: /^https:\/\/api\.aladhan\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'prayer-times-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }   // update tiap hari
            }
          }
        ]
      },

      // Dev mode: aktifkan service worker di development
      devOptions: {
        enabled: true,
        type: 'module'
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: '0.0.0.0',   // Wajib untuk Docker
    port: 5173,
    watch: {
      usePolling: true  // Wajib untuk file watching di Docker volume
    }
  }
})
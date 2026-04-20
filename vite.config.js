import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/plank5/' : '/',

  plugins: [
    vue(),
    VitePWA({
      // 'prompt' — kita handle sendiri via UpdateBanner.vue
      // (bukan autoUpdate agar user tahu ada update)
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],

      manifest: {
        name: 'Plank5 — Kesehatan Harian',
        short_name: 'Plank5',
        description: 'Catat plank 5 waktu sholat, pantau berat badan, konsisten setiap hari.',
        theme_color: '#0a1814',
        background_color: '#0a1814',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/plank5/',
        scope: '/plank5/',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },

      workbox: {
        // skipWaiting: SW langsung aktif tanpa nunggu tab lama ditutup
        skipWaiting: true,
        clientsClaim: true,

        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/firestore\.googleapis\.com/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firestore-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }
            }
          },
          {
            urlPattern: /^https:\/\/api\.aladhan\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'prayer-times-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 24 }
            }
          }
        ]
      },

      devOptions: {
        enabled: false  // matikan di dev agar tidak ganggu HMR
      }
    })
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },

  server: {
    host: '0.0.0.0',
    port: 5173,
    watch: { usePolling: true }
  }
})

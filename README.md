# Plank5 — Catatan Kesehatan Harian

> Plank 5× sehari, setiap waktu sholat. Mobile PWA dengan Vue 3 + Firebase.

---

## 🚀 Quick Start (Docker)

```bash
# 1. Clone & masuk folder
git clone <repo> plank5 && cd plank5

# 2. Setup env
cp .env.example .env
# Edit .env — isi dengan kredensial Firebase kamu

# 3. Jalankan dev server
docker compose up app

# Buka di browser: http://localhost:5173
# Test di HP: http://<IP-komputer-kamu>:5173
```

---

## 📁 Struktur Project

```
plank5/
├── docker/
│   ├── Dockerfile.dev        # Dev: Node 20 + Vite HMR
│   ├── Dockerfile.prod       # Prod: Multi-stage build → Nginx
│   └── nginx/nginx.conf      # PWA-aware: SW headers, SPA fallback
│
├── src/
│   ├── services/
│   │   ├── firebase.js           # Firebase init (satu-satunya yang tahu SDK)
│   │   ├── healthService.js      # ← MIGRATION BOUNDARY: swap ini saat ke Laravel/NestJS
│   │   ├── prayerTimesService.js # API AlAdhan + caching
│   │   └── notificationService.js# FCM + local scheduler
│   │
│   ├── stores/
│   │   └── health.js             # Pinia store: semua state app
│   │
│   ├── components/
│   │   ├── timer/
│   │   │   ├── PlankTimer.vue       # SVG ring timer + audio + wake lock
│   │   │   └── PrayerTimerCard.vue  # Card wrapper per waktu sholat
│   │   ├── heatmap/
│   │   │   ├── Heatmap5x30.vue      # Grid 5 sholat × 30 hari
│   │   │   └── ProgressChart.vue    # Bar chart progressive overload
│   │   └── shared/
│   │       └── PentagonCircle.vue   # SVG 5-point interactive circle
│   │
│   ├── views/
│   │   ├── TodayView.vue      # Halaman utama
│   │   ├── HistoryView.vue    # Riwayat + heatmap
│   │   ├── ScienceView.vue    # Edukasi ilmiah
│   │   └── SettingsView.vue   # Profil + BMI + notifikasi
│   │
│   ├── router/index.js
│   ├── App.vue                # Root + bottom navigation
│   ├── main.js
│   └── assets/main.css        # Design tokens + utility classes
│
├── vite.config.js             # PWA config (manifest, Workbox, caching)
├── docker-compose.yml
└── .env.example
```

---

## 🔥 Setup Firebase

1. Buka [console.firebase.google.com](https://console.firebase.google.com)
2. Buat project baru
3. Aktifkan **Firestore Database** (mode production)
4. Tambahkan **Web App** → copy config ke `.env`
5. Untuk notifikasi: **Project Settings → Cloud Messaging → Web Push certificates** → Generate VAPID key → paste ke `VITE_VAPID_KEY`

### Firestore Rules (sementara untuk personal use)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;  // ← ganti dengan auth nanti
    }
  }
}
```

---

## 📱 Install sebagai PWA di HP

1. Buka app di Chrome Android
2. Tap menu (⋮) → **"Add to Home screen"**
3. App akan muncul seperti native app, tanpa browser bar

---

## 🐳 Production Build

```bash
# Build + serve via Nginx
docker compose --profile prod up --build

# Buka: http://localhost
```

---

## 🔄 Rencana Migrasi ke Laravel/NestJS (Phase 2)

Satu-satunya file yang perlu diubah: `src/services/healthService.js`

```js
// Ganti dari Firebase:
await setDoc(doc(db, 'logs', id), data)

// Ke Axios:
await axios.post('/api/health/logs', data)
```

Semua komponen Vue, store Pinia, dan router **tidak perlu diubah sama sekali**.

---

## 📊 Struktur Data Firestore

```
health_logs/{userId}/daily/{YYYY-MM-DD}
{
  date: "2026-04-19",
  weight_kg: 80.5,
  prayers: {
    subuh:   { prayed: true, plank_done: true, duration_seconds: 16, completed_at: Timestamp },
    dzuhur:  { prayed: false, plank_done: false, duration_seconds: 0, completed_at: null },
    ...
  },
  updated_at: serverTimestamp()
}

users/{userId}
{
  weight_start: 80,
  height_cm: 170,
  target_weight: 72,
  fcm_token: "...",
  updated_at: Timestamp
}
```

---

## 🧮 Formula Kalori (MET)

```
Kalori = (MET × berat_kg × 3.5) ÷ 200 × menit
MET plank = 3.5 (Compendium of Physical Activities, Ainsworth et al.)
```

80kg, 16 detik = **≈ 0.37 kcal/sesi** — kecil, tapi bukan tujuan utama.
Tujuan utama: **habit stacking + core strength**.

<template>
  <Transition name="slide-up">
    <div v-if="showBanner" class="update-banner">
      <div class="update-content">
        <span class="update-icon">🔄</span>
        <div>
          <div class="update-title">Versi baru tersedia</div>
          <div class="update-sub">Tap untuk memperbarui aplikasi</div>
        </div>
      </div>
      <button class="update-btn" @click="doUpdate">Perbarui</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'

const showBanner = ref(false)
let updateSW = null

const { needRefresh, updateServiceWorker } = useRegisterSW({
  onRegistered(r) {
    // Cek update setiap 60 detik saat app aktif
    r && setInterval(() => r.update(), 60 * 1000)
  },
  onNeedRefresh() {
    showBanner.value = true
  },
})

function doUpdate() {
  showBanner.value = false
  updateServiceWorker(true)
}
</script>

<style scoped>
.update-banner {
  position: fixed;
  bottom: calc(70px + env(safe-area-inset-bottom));
  left: 16px;
  right: 16px;
  z-index: 999;
  background: #1a2f24;
  border: 1px solid rgba(110, 231, 122, 0.3);
  border-radius: 14px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.update-content {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
}

.update-icon { font-size: 20px; }

.update-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
}

.update-sub {
  font-size: 10px;
  color: var(--text-muted);
  margin-top: 1px;
}

.update-btn {
  background: rgba(110, 231, 122, 0.15);
  border: 1px solid rgba(110, 231, 122, 0.3);
  color: var(--green);
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  -webkit-tap-highlight-color: transparent;
  flex-shrink: 0;
}
.update-btn:active { opacity: 0.7; }

/* Transition */
.slide-up-enter-active, .slide-up-leave-active {
  transition: all 0.3s ease;
}
.slide-up-enter-from, .slide-up-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>

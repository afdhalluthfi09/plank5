<template>
  <div class="timer-card card" :class="{ 'card-done': isPlankDone }">
    <!-- Prayer header -->
    <div class="card-header">
      <div class="prayer-info">
        <span class="prayer-icon">{{ prayer?.icon }}</span>
        <div>
          <div class="prayer-name">{{ prayer?.label }}</div>
          <div class="text-muted" style="font-size:10px;">
            {{ prayerTime || '—' }} •
            ≈ <span class="mono text-gold">{{ cal.toFixed(2) }}</span>
            <span class="text-muted"> kcal/sesi</span>
          </div>
        </div>
      </div>

      <!-- Sholat checkbox -->
      <button
        class="pray-btn"
        :class="{ 'pray-btn-active': isPrayed }"
        @click="$emit('pray')"
        :aria-label="isPrayed ? 'Sholat tercatat' : 'Tandai sudah sholat'"
      >
        {{ isPrayed ? '✓' : '' }}
      </button>
    </div>

    <!-- Timer -->
    <div class="timer-body">
      <PlankTimer
        :key="prayer?.id"
        :duration="duration"
        :done="isPlankDone"
        @complete="$emit('plank-complete')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import PlankTimer from './PlankTimer.vue'
import { calcCalories } from '@/services/healthService.js'

const props = defineProps({
  prayer:      { type: Object,  default: null },
  prayerTime:  { type: String,  default: null },
  isPrayed:    { type: Boolean, default: false },
  isPlankDone: { type: Boolean, default: false },
  duration:    { type: Number,  default: 10 },
  weightKg:    { type: Number,  default: 80 },
})

defineEmits(['pray', 'plank-complete'])

const cal = computed(() => calcCalories(props.weightKg, props.duration))
</script>

<style scoped>
.timer-card {
  margin-bottom: 16px;
  transition: border-color 0.4s;
}
.card-done { border-color: rgba(110, 231, 122, 0.2); }

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}

.prayer-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.prayer-icon { font-size: 24px; }

.prayer-name {
  font-weight: 700;
  font-size: 17px;
  color: var(--text-primary);
}

.pray-btn {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.12);
  background: transparent;
  color: transparent;
  font-size: 15px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.pray-btn:active { transform: scale(0.9); }
.pray-btn-active {
  border-color: rgba(168, 200, 255, 0.5);
  background: rgba(168, 200, 255, 0.12);
  color: var(--blue);
}

.timer-body {
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 16px;
}
</style>

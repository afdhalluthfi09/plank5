<template>
  <div class="plank-timer">
    <!-- SVG Ring -->
    <div class="ring-wrapper">
      <!-- Ambient glow when running -->
      <div
        v-if="phase === 'running'"
        class="ring-glow"
        :class="{ 'ring-glow-warn': isWarn }"
      />

      <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
        <!-- Track -->
        <circle
          :cx="cx" :cy="cy" :r="R"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          stroke-width="6"
        />

        <!-- Progress arc -->
        <circle
          :cx="cx" :cy="cy" :r="R"
          fill="none"
          :stroke="ringColor"
          stroke-width="6"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="strokeOffset"
          stroke-linecap="round"
          :transform="`rotate(-90 ${cx} ${cy})`"
          class="progress-arc"
        />

        <!-- Second markers -->
        <line
          v-for="(_, i) in duration"
          :key="i"
          :x1="markerInner(i).x" :y1="markerInner(i).y"
          :x2="markerOuter(i).x" :y2="markerOuter(i).y"
          :stroke="i < (duration - timeLeft) ? ringColor : 'rgba(255,255,255,0.07)'"
          stroke-width="1.5"
          class="second-marker"
        />

        <!-- Center: Done state -->
        <template v-if="isDone">
          <text :x="cx" :y="cy - 4" text-anchor="middle" fill="var(--green)" font-size="28">✓</text>
          <text :x="cx" :y="cy + 14" text-anchor="middle" fill="rgba(110,231,122,0.5)" font-size="9" letter-spacing="1">SELESAI</text>
        </template>

        <!-- Center: Timer -->
        <template v-else>
          <text
            :x="cx" :y="cy + 10"
            text-anchor="middle"
            :fill="timerColor"
            :font-size="phase === 'running' ? 40 : 34"
            font-weight="700"
            font-family="'DM Mono', monospace"
            class="timer-text"
          >{{ timeLeft }}</text>
          <text :x="cx" :y="cy + 26" text-anchor="middle" fill="rgba(255,255,255,0.18)" font-size="10" letter-spacing="1">detik</text>
        </template>
      </svg>

      <!-- Pulse on each tick -->
      <div v-if="pulse && phase === 'running'" class="tick-pulse" :class="{ 'warn-pulse': isWarn }" />
    </div>

    <!-- Calorie counter while running -->
    <div v-if="phase === 'running'" class="calorie-live mono text-muted">
      ≈ {{ liveCalories }} kcal terbakar
    </div>

    <!-- Controls -->
    <div class="controls">
      <!-- Start button -->
      <button
        v-if="!isDone"
        class="start-btn"
        :class="{
          'start-btn-idle':    phase === 'idle',
          'start-btn-running': phase === 'running' && !isWarn,
          'start-btn-warn':    isWarn,
        }"
        :disabled="phase === 'running'"
        @click="startTimer"
      >
        <span v-if="phase === 'idle'">MULAI PLANK</span>
        <span v-else-if="isWarn">TAHAN...! 💪</span>
        <span v-else>BERJALAN...</span>
      </button>

      <!-- Done state -->
      <div v-if="isDone" class="done-badge">
        💪 +{{ finalCalories }} kcal tercatat
      </div>

      <!-- Reset (only while running) -->
      <button
        v-if="phase === 'running'"
        class="reset-btn"
        @click="resetTimer"
      >↺</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onUnmounted } from 'vue'
import { calcCalories } from '@/services/healthService.js'

const props = defineProps({
  duration: { type: Number, default: 10 },
  done:     { type: Boolean, default: false },
  weightKg: { type: Number, default: 80 },
})

const emit = defineEmits(['complete'])

// ── SVG geometry ─────────────────────────────────────────────────────────────
const SIZE = 180
const cx = SIZE / 2, cy = SIZE / 2
const R = 70
const circumference = 2 * Math.PI * R

// ── State ─────────────────────────────────────────────────────────────────────
const phase    = ref('idle')   // idle | running | done
const timeLeft = ref(props.duration)
const pulse    = ref(false)
let   interval = null

watch(() => props.duration, (v) => {
  if (phase.value === 'idle') timeLeft.value = v
})

// ── Computed ──────────────────────────────────────────────────────────────────
const isDone   = computed(() => props.done || phase.value === 'done')
const isWarn   = computed(() => timeLeft.value <= 3 && phase.value === 'running')
const progress = computed(() => (props.duration - timeLeft.value) / props.duration)

const strokeOffset = computed(() =>
  circumference - progress.value * circumference
)

const ringColor = computed(() => {
  if (isDone.value)               return 'var(--green)'
  if (isWarn.value)               return 'var(--red)'
  if (phase.value === 'running')  return 'var(--gold)'
  return 'rgba(255,255,255,0.12)'
})

const timerColor = computed(() => {
  if (isWarn.value)               return 'var(--red)'
  if (phase.value === 'running')  return 'var(--gold)'
  return 'rgba(255,255,255,0.4)'
})

const elapsed = computed(() => props.duration - timeLeft.value)

const liveCalories = computed(() =>
  calcCalories(props.weightKg, elapsed.value).toFixed(4)
)

const finalCalories = computed(() =>
  calcCalories(props.weightKg, props.duration).toFixed(2)
)

// ── SVG tick markers ─────────────────────────────────────────────────────────
function markerAngle(i) {
  return ((i / props.duration) * 360 - 90) * (Math.PI / 180)
}
function markerInner(i) {
  const a = markerAngle(i)
  return { x: cx + (R - 10) * Math.cos(a), y: cy + (R - 10) * Math.sin(a) }
}
function markerOuter(i) {
  const a = markerAngle(i)
  return { x: cx + (R + 1) * Math.cos(a), y: cy + (R + 1) * Math.sin(a) }
}

// ── Audio ─────────────────────────────────────────────────────────────────────
function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain); gain.connect(ctx.destination)

    if (type === 'tick') {
      osc.frequency.value = 880
      gain.gain.setValueAtTime(0.12, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)
      osc.start(); osc.stop(ctx.currentTime + 0.07)
    } else if (type === 'warn') {
      osc.type = 'sawtooth'
      osc.frequency.value = 440
      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12)
      osc.start(); osc.stop(ctx.currentTime + 0.12)
    } else if (type === 'done') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523, ctx.currentTime)
      osc.frequency.setValueAtTime(659, ctx.currentTime + 0.15)
      osc.frequency.setValueAtTime(784, ctx.currentTime + 0.3)
      gain.gain.setValueAtTime(0.28, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6)
      osc.start(); osc.stop(ctx.currentTime + 0.6)
    }
  } catch (_) {}
}

// ── Timer logic ───────────────────────────────────────────────────────────────
async function startTimer() {
  if (phase.value !== 'idle') return
  phase.value = 'running'

  // Wake Lock — layar tidak mati saat plank
  if ('wakeLock' in navigator) {
    try { await navigator.wakeLock.request('screen') } catch (_) {}
  }

  interval = setInterval(() => {
    timeLeft.value--

    // Audio + pulse
    playSound(timeLeft.value <= 3 ? 'warn' : 'tick')
    pulse.value = true
    setTimeout(() => { pulse.value = false }, 150)

    if (timeLeft.value <= 0) {
      clearInterval(interval)
      phase.value = 'done'
      playSound('done')
      if (navigator.vibrate) navigator.vibrate([200, 80, 400])
      emit('complete')
    }
  }, 1000)
}

function resetTimer() {
  clearInterval(interval)
  phase.value = 'idle'
  timeLeft.value = props.duration
}

onUnmounted(() => clearInterval(interval))
</script>

<style scoped>
.plank-timer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
}

.ring-wrapper {
  position: relative;
  width: 180px;
  height: 180px;
}

.ring-glow {
  position: absolute;
  inset: -10px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(240,200,96,0.12) 0%, transparent 70%);
  transition: background 0.5s;
}
.ring-glow-warn {
  background: radial-gradient(circle, rgba(255,107,107,0.14) 0%, transparent 70%);
}

.progress-arc {
  transition: stroke-dashoffset 0.95s linear, stroke 0.3s ease;
}

.timer-text {
  transition: font-size 0.1s, fill 0.3s;
}

.tick-pulse {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  border: 2px solid rgba(240, 200, 96, 0.3);
  animation: pulseOut 0.4s ease-out forwards;
}
.warn-pulse {
  border-color: rgba(255, 107, 107, 0.35);
}
@keyframes pulseOut {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.28); opacity: 0; }
}

.calorie-live {
  font-size: 11px;
  letter-spacing: 1px;
}

.controls {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Start button */
.start-btn {
  padding: 11px 28px;
  border-radius: var(--radius-md);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  transition: all 0.2s;
  -webkit-tap-highlight-color: transparent;
}
.start-btn:active:not(:disabled) { transform: scale(0.96); }

.start-btn-idle {
  background: rgba(240,200,96,0.15);
  border: 1px solid rgba(240,200,96,0.35);
  color: var(--gold);
}
.start-btn-running {
  background: rgba(240,200,96,0.07);
  border: 1px solid rgba(240,200,96,0.18);
  color: rgba(240,200,96,0.45);
  cursor: default;
}
.start-btn-warn {
  background: rgba(255,107,107,0.12);
  border: 1px solid rgba(255,107,107,0.3);
  color: var(--red);
  cursor: default;
}

.done-badge {
  padding: 10px 18px;
  background: rgba(110,231,122,0.1);
  border: 1px solid rgba(110,231,122,0.2);
  border-radius: var(--radius-md);
  color: var(--green);
  font-size: 13px;
  font-weight: 600;
}

.reset-btn {
  width: 38px; height: 38px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text-muted);
  font-size: 16px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: border-color 0.2s;
}
.reset-btn:active { border-color: var(--text-secondary); }
</style>

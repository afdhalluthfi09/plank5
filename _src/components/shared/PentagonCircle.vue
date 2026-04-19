<template>
  <div style="display:flex; justify-content:center; position:relative; z-index:1;">
    <svg :width="SIZE" :height="SIZE" :viewBox="`0 0 ${SIZE} ${SIZE}`">
      <!-- Connecting lines -->
      <line
        v-for="(p, i) in PRAYERS"
        :key="`line-${p.id}`"
        :x1="node(p.id).x" :y1="node(p.id).y"
        :x2="node(PRAYERS[(i + 1) % 5].id).x"
        :y2="node(PRAYERS[(i + 1) % 5].id).y"
        stroke="rgba(255,255,255,0.05)"
        stroke-width="1"
      />

      <!-- Center glow when all done -->
      <circle
        v-if="allDone"
        :cx="cx" :cy="cy" r="38"
        fill="rgba(110,231,122,0.06)"
      />

      <!-- Center count -->
      <text
        :x="cx" :y="cy + 7"
        text-anchor="middle"
        :fill="allDone ? 'var(--green)' : 'rgba(255,255,255,0.18)'"
        font-size="30"
        font-weight="700"
        font-family="'DM Mono', monospace"
      >{{ doneCount }}</text>
      <text
        :x="cx" :y="cy + 22"
        text-anchor="middle"
        fill="rgba(255,255,255,0.14)"
        font-size="9"
        letter-spacing="1"
      >/ 5</text>

      <!-- Prayer nodes -->
      <g
        v-for="p in PRAYERS"
        :key="p.id"
        class="prayer-node"
        @click="$emit('select', p.id)"
      >
        <!-- Glow rings -->
        <circle
          v-if="plankDone[p.id]"
          :cx="node(p.id).x" :cy="node(p.id).y"
          :r="DOT_R + 7"
          fill="none"
          stroke="rgba(110,231,122,0.18)"
          stroke-width="1.5"
        />
        <circle
          v-if="selected === p.id"
          :cx="node(p.id).x" :cy="node(p.id).y"
          :r="DOT_R + 7"
          fill="none"
          stroke="rgba(240,200,96,0.3)"
          stroke-width="1.5"
        />

        <!-- Main dot -->
        <circle
          :cx="node(p.id).x" :cy="node(p.id).y"
          :r="DOT_R"
          :fill="dotFill(p.id)"
          :stroke="dotStroke(p.id)"
          stroke-width="1.5"
        />

        <!-- Icon -->
        <text
          :x="node(p.id).x" :y="node(p.id).y"
          text-anchor="middle"
          dominant-baseline="middle"
          font-size="14"
        >{{ p.icon }}</text>

        <!-- Label -->
        <text
          :x="node(p.id).x"
          :y="node(p.id).y + DOT_R + 13"
          text-anchor="middle"
          :fill="labelColor(p.id)"
          font-size="9"
          font-weight="600"
        >{{ p.label }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  plankDone:  { type: Object, default: () => ({}) },
  prayerDone: { type: Object, default: () => ({}) },
  selected:   { type: String, default: 'subuh' },
})

defineEmits(['select'])

const PRAYERS = [
  { id: 'subuh',   label: 'Subuh',   icon: '🌙', angle: -90  },
  { id: 'dzuhur',  label: 'Dzuhur',  icon: '☀️', angle: -18  },
  { id: 'ashar',   label: 'Ashar',   icon: '⛅', angle:  54  },
  { id: 'maghrib', label: 'Maghrib', icon: '🌅', angle: 126  },
  { id: 'isya',    label: 'Isya',    icon: '🌃', angle: 198  },
]

const SIZE  = 240
const cx    = SIZE / 2
const cy    = SIZE / 2
const R     = 82
const DOT_R = 22

function node(id) {
  const p = PRAYERS.find(x => x.id === id)
  const a = (p.angle * Math.PI) / 180
  return { x: cx + R * Math.cos(a), y: cy + R * Math.sin(a) }
}

const doneCount = computed(() =>
  Object.values(props.plankDone).filter(Boolean).length
)

const allDone = computed(() => doneCount.value === 5)

function dotFill(id) {
  if (props.plankDone[id])  return 'rgba(110,231,122,0.16)'
  if (props.selected === id) return 'rgba(240,200,96,0.1)'
  if (props.prayerDone[id]) return 'rgba(168,200,255,0.1)'
  return 'rgba(255,255,255,0.04)'
}

function dotStroke(id) {
  if (props.plankDone[id])  return 'rgba(110,231,122,0.55)'
  if (props.selected === id) return 'rgba(240,200,96,0.5)'
  if (props.prayerDone[id]) return 'rgba(168,200,255,0.35)'
  return 'rgba(255,255,255,0.1)'
}

function labelColor(id) {
  if (props.plankDone[id])  return 'var(--green)'
  if (props.selected === id) return 'var(--gold)'
  return 'rgba(255,255,255,0.25)'
}
</script>

<style scoped>
.prayer-node { cursor: pointer; }
.prayer-node:active { opacity: 0.7; }
</style>

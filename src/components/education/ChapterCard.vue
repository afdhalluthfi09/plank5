<template>
  <div class="chapter-card" :class="{ 'is-open': isOpen }" :style="{ '--chapter-color': color }">
    <!-- Header toggle -->
    <button class="chapter-header" @click="$emit('toggle')" :aria-expanded="isOpen">
      <div class="chapter-icon-wrap">{{ icon }}</div>
      <div class="chapter-meta">
        <span class="chapter-number mono text-muted">{{ number }}</span>
        <div class="chapter-title">{{ title }}</div>
        <div class="chapter-subtitle text-muted">{{ subtitle }}</div>
      </div>
      <div class="chapter-chevron" :class="{ 'is-open': isOpen }">▼</div>
    </button>

    <!-- Expandable content -->
    <Transition name="expand">
      <div v-if="isOpen" class="chapter-body">
        <slot />
      </div>
    </Transition>
  </div>
</template>

<script setup>
defineProps({
  number:   { type: String, required: true },
  title:    { type: String, required: true },
  subtitle: { type: String, default: '' },
  icon:     { type: String, default: '📖' },
  color:    { type: String, default: '#f0c860' },
  isOpen:   { type: Boolean, default: false },
})
defineEmits(['toggle'])
</script>

<style scoped>
.chapter-card {
  background: rgba(255,255,255,0.025);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 10px;
  transition: border-color 0.3s;
}
.chapter-card.is-open {
  border-color: color-mix(in srgb, var(--chapter-color) 30%, transparent);
}

.chapter-header {
  width: 100%;
  background: transparent;
  border: none;
  padding: 16px 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: left;
  -webkit-tap-highlight-color: transparent;
}
.chapter-header:active { opacity: 0.7; }

.chapter-icon-wrap {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, var(--chapter-color) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--chapter-color) 25%, transparent);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.chapter-meta { flex: 1; }

.chapter-number { font-size: 9px; letter-spacing: 2px; }

.chapter-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 2px;
}

.chapter-subtitle { font-size: 10px; margin-top: 1px; letter-spacing: 0.3px; }

.chapter-chevron {
  width: 24px; height: 24px;
  border-radius: 50%;
  background: rgba(255,255,255,0.04);
  display: flex; align-items: center; justify-content: center;
  font-size: 9px;
  color: var(--text-muted);
  transition: transform 0.25s ease, background 0.2s;
  flex-shrink: 0;
}
.chapter-chevron.is-open {
  transform: rotate(180deg);
  background: color-mix(in srgb, var(--chapter-color) 20%, transparent);
  color: var(--chapter-color);
}

.chapter-body {
  padding: 0 18px 18px;
  border-top: 1px solid rgba(255,255,255,0.04);
}

/* Expand transition */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.28s ease;
  overflow: hidden;
}
.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
}
.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 1000px;
}
</style>

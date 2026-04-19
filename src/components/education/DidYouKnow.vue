<template>
  <div class="dyk-card">
    <p class="label-upper" style="margin-bottom:12px; color:rgba(240,200,96,0.4);">Tahukah kamu?</p>

    <Transition name="fade" mode="out-in">
      <div :key="idx" class="dyk-content">
        <div class="dyk-emoji">{{ current.emoji }}</div>
        <p class="dyk-text">{{ current.text }}</p>
      </div>
    </Transition>

    <div class="dyk-footer">
      <!-- Dots -->
      <div class="dots">
        <button
          v-for="(_, i) in facts"
          :key="i"
          class="dot"
          :class="{ 'dot-active': i === idx }"
          @click="idx = i"
          :aria-label="`Fakta ${i + 1}`"
        />
      </div>
      <button class="btn-next" @click="next">Fakta berikutnya →</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const facts = [
  { emoji: '🧬', text: 'Otot 3× lebih padat dari lemak. Kamu bisa menyusut 2 celana ukuran meski beratmu tetap sama.' },
  { emoji: '⚡', text: '1 kg otot membakar 13 kcal per hari saat diam. 1 kg lemak hanya 4 kcal. Core yang kuat = metabolisme lebih tinggi 24 jam.' },
  { emoji: '💧', text: 'Berat badanmu bisa berfluktuasi 1–2 kg dalam satu hari hanya karena air. Ini bukan lemak.' },
  { emoji: '🕌', text: 'Habit yang ditempel pada rutinitas kuat (seperti sholat) memiliki tingkat keberhasilan 91% lebih tinggi.' },
  { emoji: '🦴', text: 'Plank mengaktifkan Transverse Abdominis — "ikat pinggang alami" tubuhmu yang melindungi tulang belakang.' },
  { emoji: '📐', text: 'Postur tegak akibat core kuat bisa membuatmu terlihat 2–3 cm lebih tinggi secara visual.' },
]

const idx     = ref(0)
const current = computed(() => facts[idx.value])

function next() {
  idx.value = (idx.value + 1) % facts.length
}
</script>

<style scoped>
.dyk-card {
  background: rgba(240,200,96,0.06);
  border: 1px solid rgba(240,200,96,0.15);
  border-radius: var(--radius-lg);
  padding: 18px 20px;
  margin-bottom: 20px;
}

.dyk-content { min-height: 72px; }

.dyk-emoji { font-size: 28px; margin-bottom: 8px; }

.dyk-text {
  font-size: 13px;
  color: rgba(221,213,200,0.75);
  line-height: 1.65;
}

.dyk-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
}

.dots { display: flex; gap: 5px; }

.dot {
  height: 5px; border-radius: 3px;
  border: none; cursor: pointer;
  background: rgba(240,200,96,0.2);
  transition: all 0.3s;
  width: 5px;
  -webkit-tap-highlight-color: transparent;
}
.dot-active {
  width: 16px;
  background: var(--gold);
}

.btn-next {
  background: rgba(240,200,96,0.12);
  border: 1px solid rgba(240,200,96,0.2);
  color: var(--gold);
  border-radius: var(--radius-sm);
  padding: 6px 12px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
.btn-next:active { opacity: 0.7; }

/* Transition */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>

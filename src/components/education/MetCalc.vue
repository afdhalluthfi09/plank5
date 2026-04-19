<template>
  <div class="met-calc">
    <p class="label-upper" style="margin-bottom:14px; color:rgba(240,200,96,0.5);">
      Kalkulator Interaktif
    </p>

    <div class="sliders">
      <div v-for="s in sliders" :key="s.label" class="slider-row">
        <div class="slider-header">
          <span class="text-secondary" style="font-size:11px;">{{ s.label }}</span>
          <span class="mono" :style="{ color: s.color, fontSize: '13px', fontWeight: 700 }">
            {{ s.val }}{{ s.unit }}
          </span>
        </div>
        <input
          type="range"
          :min="s.min" :max="s.max" :step="s.step || 1"
          :value="s.val"
          @input="s.set(Number($event.target.value))"
          class="slider"
          :style="sliderBg(s)"
        />
      </div>
    </div>

    <!-- Formula live -->
    <div class="formula-box mono">
      <div style="color:rgba(221,213,200,0.4); font-size:11px;">
        ({{ met }} × {{ weight }} × 3.5) ÷ 200 × ({{ seconds }} ÷ 60)
      </div>
      <div class="text-gold" style="font-weight:700; font-size:13px; margin-top:4px;">
        = {{ cal.toFixed(4) }} kcal / sesi
      </div>
    </div>

    <!-- Results grid -->
    <div class="results-grid">
      <div v-for="r in results" :key="r.label" class="result-card">
        <p class="label-upper" style="margin-bottom:4px;">{{ r.label }}</p>
        <div class="mono" :style="{ color: r.color, fontSize: '16px', fontWeight: 700 }">
          {{ r.value }}
        </div>
        <p class="text-muted" style="font-size:8px; margin-top:2px;">{{ r.unit }}</p>
      </div>
    </div>

    <!-- Fat equivalence -->
    <div class="fat-row">
      <span class="text-secondary" style="font-size:11px;">Setara lemak terbakar / bulan</span>
      <span class="mono" style="color:rgba(255,100,100,0.7); font-size:14px; font-weight:700;">
        ≈ {{ kgFat.toFixed(4) }} kg
      </span>
    </div>
    <p class="text-muted" style="font-size:10px; font-style:italic; text-align:center; margin-top:8px;">
      * 1 kg lemak ≈ 7.700 kcal. Ini angka jujur — plank bukan untuk membakar lemak secara langsung.
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const weight  = ref(80)
const seconds = ref(10)
const met     = ref(3.5)

const cal     = computed(() => ((met.value * weight.value * 3.5) / 200) * (seconds.value / 60))
const daily5  = computed(() => cal.value * 5)
const monthly = computed(() => daily5.value * 30)
const kgFat   = computed(() => monthly.value / 7700)

const sliders = computed(() => [
  { label: 'Berat badan', val: weight.value,  set: v => weight.value  = v, min: 40,  max: 120, unit: 'kg',    color: '#f0c860' },
  { label: 'Durasi plank', val: seconds.value, set: v => seconds.value = v, min: 5,   max: 120, unit: 'detik', color: '#a8e6a3' },
  { label: 'Nilai MET',   val: met.value,     set: v => met.value     = v, min: 2.5, max: 5,   unit: '',      color: '#a8c8ff', step: 0.1 },
])

const results = computed(() => [
  { label: '1 sesi',  value: cal.value.toFixed(3),     unit: 'kcal', color: '#f0c860' },
  { label: '5×/hari', value: daily5.value.toFixed(2),  unit: 'kcal', color: '#a8e6a3' },
  { label: '30 hari', value: monthly.value.toFixed(1), unit: 'kcal', color: '#a8c8ff' },
])

function sliderBg(s) {
  const pct = ((s.val - s.min) / (s.max - s.min)) * 100
  return {
    background: `linear-gradient(to right,
      ${s.color}60 0%, ${s.color}60 ${pct}%,
      rgba(255,255,255,0.07) ${pct}%, rgba(255,255,255,0.07) 100%)`
  }
}
</script>

<style scoped>
.met-calc {
  background: rgba(240,200,96,0.05);
  border: 1px solid rgba(240,200,96,0.15);
  border-radius: 16px;
  padding: 18px;
  margin-top: 14px;
}

.sliders { display: flex; flex-direction: column; gap: 14px; margin-bottom: 14px; }

.slider-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.slider {
  width: 100%;
  height: 3px;
  appearance: none;
  -webkit-appearance: none;
  border-radius: 2px;
  cursor: pointer;
  outline: none;
  border: none;
}
.slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 16px; height: 16px;
  border-radius: 50%;
  background: #f0c860;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(240,200,96,0.4);
}

.formula-box {
  background: rgba(0,0,0,0.25);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 12px;
}

.results-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 8px;
  margin-bottom: 12px;
}

.result-card {
  background: rgba(255,255,255,0.03);
  border-radius: 10px;
  padding: 10px 8px;
  text-align: center;
}

.fat-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid rgba(255,255,255,0.05);
  padding-top: 12px;
}
</style>

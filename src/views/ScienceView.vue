<template>
  <div class="page-container">
    <header style="margin-bottom:24px;">
      <p class="label-upper" style="letter-spacing:3px;">The Science Behind</p>
      <h1 class="display-title" style="margin-top:6px;">
        Kenapa Plank<br />
        <span class="text-gold">5 Kali Sehari</span> Bekerja
      </h1>
      <p class="text-secondary" style="font-size:12px; line-height:1.6; margin-top:8px;">
        Data, rumus, dan penjelasan ilmiah di balik setiap detik yang kamu catat.
      </p>
    </header>

    <DidYouKnow />

    <!-- 01 MET -->
    <ChapterCard number="01" title="MET: Bahasa Universal Energi"
      subtitle="Metabolic Equivalent of Task" icon="⚗️" color="#f0c860"
      :is-open="open === 'met'" @toggle="toggle('met')">
      <p class="body-text" style="margin-top:14px;">
        <strong class="text-gold">MET (Metabolic Equivalent of Task)</strong> adalah standar
        internasional kedokteran olahraga untuk mengukur intensitas aktivitas fisik.
        Plank memiliki nilai MET <strong class="text-gold">3.5</strong> — aktivitas ringan-sedang.
      </p>
      <div class="formula mono">Kalori = (MET × berat_kg × 3.5) ÷ 200 × menit</div>
      <p class="src-note">Sumber: Compendium of Physical Activities, Ainsworth et al. [1]</p>
      <MetCalc />
    </ChapterCard>

    <!-- 02 Scale -->
    <ChapterCard number="02" title="Kenapa Timbangan Berbohong"
      subtitle="Water Weight vs Fat Loss" icon="⚖️" color="#a8c8ff"
      :is-open="open === 'scale'" @toggle="toggle('scale')">
      <p class="body-text" style="margin-top:14px;">
        Timbangan mengukur <strong style="color:var(--blue)">total massa tubuh</strong> —
        termasuk air, glikogen, makanan, dan lemak. Fluktuasi 1–2 kg per hari adalah
        <strong style="color:var(--blue)">normal dan bukan lemak.</strong>
      </p>
      <WaterWeightChart />
      <div class="factor-list">
        <div v-for="f in factors" :key="f.factor" class="factor-row">
          <span class="text-secondary" style="font-size:11px;">{{ f.factor }}</span>
          <span class="mono" :style="{ color: f.color, fontWeight:600, fontSize:'11px' }">{{ f.effect }}</span>
        </div>
      </div>
      <p class="text-muted" style="font-size:10px; font-style:italic; margin-top:10px;">
        💡 Timbang di waktu sama setiap hari — pagi setelah buang air, sebelum makan.
      </p>
    </ChapterCard>

    <!-- 03 Habit -->
    <ChapterCard number="03" title="Habit Stacking"
      subtitle="Ilmu di Balik Konsistensi" icon="🔗" color="#a8e6a3"
      :is-open="open === 'habit'" @toggle="toggle('habit')">
      <p class="body-text" style="margin-top:14px;">
        <strong style="color:var(--green)">Habit Stacking</strong> — teknik dari
        <em>Atomic Habits</em> (James Clear, 2018). Menempelkan habit baru pada rutinitas kuat
        meningkatkan keberhasilan karena triggernya sudah otomatis.
      </p>
      <div class="habit-stack">
        <div v-for="p in prayers" :key="p.id" class="stack-row">
          <div class="stack-trigger">{{ p.icon }} {{ p.label }}</div>
          <span class="stack-sep">→</span>
          <div class="stack-habit">Sholat</div>
          <span class="stack-sep">+</span>
          <div class="stack-new" :style="{ color: p.color, background: p.color+'12', borderColor: p.color+'35' }">
            Plank {{ store.targetDuration }}s
          </div>
        </div>
      </div>
      <div class="insight-box" style="border-color:rgba(168,230,163,0.15); background:rgba(168,230,163,0.05);">
        <strong style="color:rgba(168,230,163,0.8);">Kenapa 10 detik cukup?</strong><br />
        <span class="text-secondary" style="font-size:10px;">
          Frekuensi (5× sehari) memperkuat jalur neural lebih efektif dari durasi panjang tapi jarang.
          Konsistensi 66 hari = habit otomatis.
        </span>
      </div>
    </ChapterCard>

    <!-- 04 Core -->
    <ChapterCard number="04" title="Core Training"
      subtitle="Lebih dari Sekadar Kurus" icon="🫀" color="#ffb3a3"
      :is-open="open === 'core'" @toggle="toggle('core')">
      <p class="body-text" style="margin-top:14px;">
        Plank mengaktifkan <strong style="color:var(--peach)">20+ kelompok otot</strong> sekaligus.
        Kuncinya bukan yang terlihat (six-pack), tapi
        <strong style="color:var(--peach)">transverse abdominis</strong> — ikat pinggang alami tubuh.
      </p>
      <div class="muscle-list">
        <div v-for="m in muscles" :key="m.name" class="muscle-row">
          <div class="muscle-hdr">
            <div>
              <span :style="{ color: m.color, fontSize:'12px', fontWeight:600 }">{{ m.name }}</span>
              <span class="text-muted" style="font-size:9px; margin-left:6px;">{{ m.role }}</span>
            </div>
            <span class="mono" :style="{ color: m.color, fontSize:'11px' }">{{ m.pct }}%</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" :style="{ width: m.pct+'%', background: m.color }" />
          </div>
        </div>
        <p class="src-note">Sumber: Calatayud et al., JSCR 2017 [2]</p>
      </div>
      <div class="benefits-grid">
        <div v-for="b in benefits" :key="b.title" class="benefit-card">
          <div style="font-size:11px; font-weight:700; color:var(--peach);">{{ b.title }}</div>
          <div class="text-muted" style="font-size:9px; line-height:1.5; margin-top:3px;">{{ b.desc }}</div>
        </div>
      </div>
    </ChapterCard>

    <!-- 05 Metrics -->
    <ChapterCard number="05" title="Metrik yang Jujur"
      subtitle="Apa yang Harus Diukur" icon="📊" color="#c8b8ff"
      :is-open="open === 'metric'" @toggle="toggle('metric')">
      <p class="body-text" style="margin-top:14px;">
        Tidak semua metrik setara.
        <strong style="color:var(--purple)">Metrik jujur</strong> vs
        <strong style="color:rgba(255,100,100,0.7)">yang bisa menyesatkan.</strong>
      </p>
      <div class="metric-list">
        <div v-for="m in metrics" :key="m.name"
          class="metric-card"
          :style="m.honest
            ? 'background:rgba(255,255,255,0.03); border-color:rgba(255,255,255,0.07)'
            : 'background:rgba(255,40,40,0.03); border-color:rgba(255,40,40,0.1)'">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px;">
            <div>
              <span :style="{ color: m.color, fontSize:'12px', fontWeight:700 }">{{ m.name }}</span>
              <span v-if="!m.honest" style="font-size:9px; color:rgba(255,100,100,0.5); margin-left:6px;">⚠ misleading</span>
            </div>
            <span class="mono" :style="{ color: m.color, fontSize:'13px', fontWeight:700 }">{{ m.result }}</span>
          </div>
          <div class="mono text-muted" style="font-size:9px; margin-bottom:4px;">{{ m.example }}</div>
          <div class="text-secondary" style="font-size:10px; font-style:italic;">{{ m.interpretation }}</div>
        </div>
      </div>
    </ChapterCard>

    <!-- Sources -->
    <div class="sources-card">
      <p class="label-upper" style="margin-bottom:12px;">Sumber Ilmiah</p>
      <div v-for="(s, i) in sources" :key="i" class="source-row">
        <span class="mono text-muted" style="font-size:9px; min-width:24px;">[{{ i+1 }}]</span>
        <div>
          <div class="text-secondary" style="font-size:10px;">{{ s.title }}</div>
          <div class="text-muted" style="font-size:9px; font-style:italic;">{{ s.author }}</div>
        </div>
      </div>
    </div>

    <p style="text-align:center; margin-top:28px; font-size:11px; color:rgba(221,213,200,0.1);">
      بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHealthStore } from '@/stores/health.js'
import DidYouKnow from '@/components/education/DidYouKnow.vue'
import ChapterCard from '@/components/education/ChapterCard.vue'
import MetCalc from '@/components/education/MetCalc.vue'
import WaterWeightChart from '@/components/education/WaterWeightChart.vue'

const store = useHealthStore()
const open  = ref('met')
const toggle = (id) => { open.value = open.value === id ? null : id }

const prayers = [
  { id:'subuh',   label:'Subuh',   icon:'🌙', color:'#a8c8ff' },
  { id:'dzuhur',  label:'Dzuhur',  icon:'☀️', color:'#f0c860' },
  { id:'ashar',   label:'Ashar',   icon:'⛅', color:'#a8e6a3' },
  { id:'maghrib', label:'Maghrib', icon:'🌅', color:'#ffb3a3' },
  { id:'isya',    label:'Isya',    icon:'🌃', color:'#c8b8ff' },
]
const factors = [
  { factor:'Garam berlebih',           effect:'+0.5–1 kg',   color:'var(--peach)' },
  { factor:'Karbohidrat tinggi',       effect:'+0.5–1.5 kg', color:'var(--peach)' },
  { factor:'Kurang tidur',             effect:'+0.3–0.8 kg', color:'var(--peach)' },
  { factor:'Setelah olahraga (dehidrasi)', effect:'−0.5–1 kg', color:'var(--green)' },
]
const muscles = [
  { name:'Transverse Abdominis', role:'Stabilisasi tulang belakang', pct:100, color:'#6ee77a' },
  { name:'Rectus Abdominis',     role:'Fleksi tulang belakang',      pct:85,  color:'#f0c860' },
  { name:'Obliques',             role:'Rotasi & stabilisasi lateral', pct:72, color:'#a8c8ff' },
  { name:'Erector Spinae',       role:'Otot punggung, postur tegak', pct:60,  color:'#ffb3a3' },
  { name:'Glutes',               role:'Stabilisasi pinggul',          pct:55, color:'#c8b8ff' },
]
const benefits = [
  { title:'Postur Tegak',     desc:'Core kuat = tulang belakang tertopang = berdiri lebih lurus' },
  { title:'Perut Lebih Flat', desc:'Bukan karena lemak hilang, tapi otot penahan lebih kuat' },
  { title:'Nyeri Punggung ↓', desc:'Studi: penurunan low back pain 35% dengan core training' },
  { title:'Metabolisme ↑',    desc:'Otot membakar kalori saat istirahat lebih banyak dari lemak' },
]
const w = computed(() => store.weightKg)
const metrics = computed(() => [
  { name:'Time Under Tension', example:`${w.value}kg × 10s × 5 × 30 hari`,
    result:`${(w.value*10*5*30).toLocaleString()} kg·s`,
    interpretation:'Beban nyata yang kamu tahan. Bangga!', color:'#f0c860', honest:true },
  { name:'Accumulated Volume', example:'10s × 5 × 30',
    result:'1.500 detik', interpretation:'25 menit latihan penuh bulan ini.',
    color:'#a8e6a3', honest:true },
  { name:'Consistency Score', example:'Sesi selesai ÷ target × 100',
    result:`${store.consistencyScore}%`, interpretation:'Lebih berarti dari angka timbangan.',
    color:'#a8c8ff', honest:true },
  { name:'Kalori Langsung', example:`3.5 × ${w.value}kg × durasi`,
    result:`≈ ${((3.5*w.value*3.5)/200*(10/60)*5*30).toFixed(1)} kcal/bulan`,
    interpretation:'Kecil — jangan jadikan motivasi utama.', color:'rgba(255,100,100,0.7)', honest:false },
])
const sources = [
  { title:'Compendium of Physical Activities',    author:'Ainsworth et al., 2011' },
  { title:'Core muscle activation during planks', author:'Calatayud et al., JSCR 2017' },
  { title:'Atomic Habits',                        author:'James Clear, 2018' },
  { title:'WHO Physical Activity Guidelines',     author:'World Health Organization, 2020' },
  { title:'Isometric exercise VO₂ measurement',  author:'JSCR Plank Study, 2021' },
]
</script>

<style scoped>
.body-text { font-size:12px; color:rgba(221,213,200,0.5); line-height:1.7; margin-bottom:8px; }
.formula   { background:rgba(0,0,0,0.3); border-radius:8px; padding:10px 14px; font-size:12px; color:var(--gold); margin:8px 0 4px; }
.src-note  { font-size:9px; color:var(--text-muted); font-style:italic; }

.factor-list { display:flex; flex-direction:column; gap:5px; margin-top:12px; }
.factor-row  { display:flex; justify-content:space-between; padding:7px 10px; background:rgba(255,255,255,0.02); border-radius:6px; }

.habit-stack { display:flex; flex-direction:column; gap:5px; margin:12px 0; }
.stack-row   { display:flex; align-items:center; font-size:11px; }
.stack-trigger { background:rgba(255,255,255,0.04); border:1px solid var(--border); border-right:none; border-radius:6px 0 0 6px; padding:7px 8px; color:var(--text-secondary); min-width:82px; }
.stack-sep    { padding:7px 4px; color:var(--text-muted); font-size:10px; background:rgba(255,255,255,0.02); border-top:1px solid var(--border); border-bottom:1px solid var(--border); }
.stack-habit  { padding:7px 8px; color:var(--text-secondary); background:rgba(255,255,255,0.03); border:1px solid var(--border); border-left:none; border-right:none; }
.stack-new    { flex:1; padding:7px 8px; font-weight:600; border-radius:0 6px 6px 0; border:1px solid; border-left:none; text-align:center; }
.insight-box  { margin-top:12px; border:1px solid; border-radius:10px; padding:12px 14px; font-size:11px; line-height:1.6; }

.muscle-list { margin-top:12px; display:flex; flex-direction:column; gap:10px; }
.muscle-hdr  { display:flex; justify-content:space-between; align-items:baseline; margin-bottom:5px; }
.bar-track   { height:3px; background:rgba(255,255,255,0.05); border-radius:2px; }
.bar-fill    { height:100%; border-radius:2px; transition:width 0.8s ease; }

.benefits-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:12px; }
.benefit-card  { background:rgba(255,179,163,0.05); border:1px solid rgba(255,179,163,0.1); border-radius:10px; padding:10px 12px; }

.metric-list { display:flex; flex-direction:column; gap:8px; margin-top:12px; }
.metric-card { border:1px solid; border-radius:12px; padding:14px; }

.sources-card { background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); border-radius:14px; padding:16px; margin-top:10px; }
.source-row   { display:flex; gap:8px; padding:7px 0; border-bottom:1px solid rgba(255,255,255,0.04); }
.source-row:last-child { border-bottom:none; }
</style>

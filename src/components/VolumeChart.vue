<template>
  <v-card class="dashboard__section" id="section-trend" aria-labelledby="trend-heading">
    <div class="section-header">
      <h2 class="section-title" id="trend-heading">
        Shipment Volume
        <!--
          Period chip in the heading mirrors Regional Performance.
          Closable here because VolumeChart owns the selection state.
        -->
        <v-chip
          v-if="selectedIndex !== null"
          size="x-small"
          variant="tonal"
          color="primary"
          closable
          class="section-period-chip"
          :aria-label="`Active period filter: ${activePeriodLabel}. Click X to clear.`"
          @click:close="clearSelection"
        >{{ activePeriodLabel }}</v-chip>
      </h2>
      <button
        class="section-toggle"
        :aria-expanded="isExpanded"
        :title="isExpanded ? 'Collapse section' : 'Expand section'"
        @click="isExpanded = !isExpanded"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </div>

    <div
      class="section-content"
      :class="{ 'section-content--collapsed': !isExpanded }"
      id="trend-content"
    >
      <!-- Controls row — styled to match the exceptions controls row -->
      <div class="volume-controls" role="group" aria-label="Chart time range">
        <v-select
          v-model="viewMode"
          :items="viewOptions"
          :menu-props="{ class: 'volume-view-menu' }"
          density="compact"
          variant="outlined"
          hide-details
          class="volume-view-select"
          aria-label="Select chart time range"
        />
      </div>

      <div
        class="volume-chart-container"
        role="img"
        :aria-label="chartAriaLabel"
      >
        <Bar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Tooltip,
} from 'chart.js'
import type { ChartOptions, ActiveElement, ChartEvent } from 'chart.js'
import { useTheme } from 'vuetify'
import { volumeTrendData, volumeMonthlyData } from '@/data/index'
import type { SelectedPeriod, VolumeTrendDay, VolumeMonthRow } from '@/types/index'

// Register only the Chart.js modules required for a bar chart
ChartJS.register(CategoryScale, LinearScale, BarElement, BarController, Tooltip)

const emit = defineEmits<{
  'period-selected': [period: SelectedPeriod | null]
}>()

// ── Local state ────────────────────────────────────────────────────────────────

const vuetifyTheme = useTheme()
const isExpanded    = ref(true)
const viewMode      = ref<'7day' | '12month'>('7day')
const selectedIndex = ref<number | null>(null)

const viewOptions = [
  { title: '7-Day Trend',    value: '7day'    },
  { title: '12-Month Trend', value: '12month' },
]

// ── Theme-aware color tokens ───────────────────────────────────────────────────
// Chart.js renders to <canvas> so CSS variables are not available inside the
// drawing context. Colors are derived reactively from the Vuetify theme state.

const isDark = computed(() => vuetifyTheme.global.current.value.dark)

const colors = computed(() => ({
  barDefault:    isDark.value ? 'rgba(59,130,246,0.72)' : 'rgba(59,130,246,0.65)',
  barSelected:   '#3b82f6',
  barDimmed:     isDark.value ? 'rgba(59,130,246,0.22)' : 'rgba(59,130,246,0.18)',
  barHover:      '#3b82f6',
  borderSel:     '#3b82f6',
  grid:          isDark.value ? '#2e3244' : '#e2e8f0',
  tick:          isDark.value ? '#94a3b8' : '#475569',
  tooltipBg:     isDark.value ? '#21263a' : '#f8fafc',
  tooltipText:   isDark.value ? '#f1f5f9' : '#0f172a',
  tooltipBorder: isDark.value ? '#2e3244' : '#e2e8f0',
}))

// ── Active dataset ─────────────────────────────────────────────────────────────

const activeData = computed(() =>
  viewMode.value === '7day'
    ? (volumeTrendData as VolumeTrendDay[])
    : (volumeMonthlyData as VolumeMonthRow[])
)

// ── Chart data ─────────────────────────────────────────────────────────────────

const chartLabels = computed(() =>
  viewMode.value === '7day'
    ? volumeTrendData.map(d => [d.day.toUpperCase(), d.date])
    : volumeMonthlyData.map(d => [d.month, String(d.year)])
)

const chartVolumes = computed(() => activeData.value.map(d => d.volume))

/**
 * Per-bar background colors:
 *   No selection  → all bars at default opacity
 *   Bar selected  → selected bar full blue, others dimmed
 */
const bgColors = computed(() =>
  chartVolumes.value.map((_, i) => {
    if (selectedIndex.value === null) return colors.value.barDefault
    return i === selectedIndex.value  ? colors.value.barSelected : colors.value.barDimmed
  })
)

/** Accent border on the selected bar only. */
const borderColors = computed(() =>
  chartVolumes.value.map((_, i) =>
    i === selectedIndex.value ? colors.value.borderSel : 'transparent'
  )
)

const chartData = computed(() => ({
  labels: chartLabels.value,
  datasets: [
    {
      label:                'Shipments',
      data:                 chartVolumes.value,
      backgroundColor:      bgColors.value,
      borderColor:          borderColors.value,
      borderWidth:          2,
      borderRadius:         4,
      hoverBackgroundColor: colors.value.barHover,
      hoverBorderColor:     colors.value.barHover,
      hoverBorderWidth:     2,
    },
  ],
}))

// ── Click handler (stable reference — not inside computed) ─────────────────────

/**
 * Clicking the same bar a second time deselects (toggle).
 * Clicking empty canvas space also clears the selection.
 */
function handleChartClick(_event: ChartEvent, elements: ActiveElement[]) {
  if (elements.length === 0) {
    clearSelection()
    return
  }
  const index = elements[0].index
  if (selectedIndex.value === index) {
    clearSelection()
    return
  }
  selectedIndex.value = index
  emit('period-selected', buildPeriod(index))
}

/** Builds a SelectedPeriod from the clicked bar index. */
function buildPeriod(index: number): SelectedPeriod {
  if (viewMode.value === '7day') {
    const d = volumeTrendData[index] as VolumeTrendDay
    return { type: 'day', periodKey: d.dateISO, label: `${d.day}, ${d.date}` }
  }
  const m = volumeMonthlyData[index] as VolumeMonthRow
  return { type: 'month', periodKey: m.periodKey, label: `${m.month} ${m.year}` }
}

function clearSelection() {
  selectedIndex.value = null
  emit('period-selected', null)
}

// ── Chart options ──────────────────────────────────────────────────────────────

const chartOptions = computed((): ChartOptions<'bar'> => ({
  responsive:          true,
  maintainAspectRatio: false,
  onClick:             handleChartClick,
  animation:           { duration: 280 },
  plugins: {
    legend:  { display: false },
    tooltip: {
      backgroundColor: colors.value.tooltipBg,
      titleColor:      colors.value.tooltipText,
      bodyColor:       colors.value.tooltipText,
      borderColor:     colors.value.tooltipBorder,
      borderWidth:     1,
      padding:         10,
      callbacks: {
        title: (items) => {
          const raw = items[0].label
          return Array.isArray(raw) ? raw.join(' ') : raw
        },
        label: (item) => ` ${Number(item.raw).toLocaleString()} shipments`,
      },
    },
  },
  scales: {
    x: {
      grid:   { display: false },
      border: { display: false },
      ticks:  { color: colors.value.tick, font: { size: 11 } },
    },
    y: {
      grid:   { color: colors.value.grid },
      border: { display: false },
      ticks:  {
        color:         colors.value.tick,
        font:          { size: 11 },
        maxTicksLimit: 5,
        callback: (value) =>
          typeof value === 'number' ? value.toLocaleString() : value,
      },
    },
  },
}))

// ── Derived labels & accessibility ────────────────────────────────────────────

const activePeriodLabel = computed(() => {
  if (selectedIndex.value === null) return ''
  if (viewMode.value === '7day') {
    const d = volumeTrendData[selectedIndex.value] as VolumeTrendDay
    return d ? `${d.day}, ${d.date}` : ''
  }
  const m = volumeMonthlyData[selectedIndex.value] as VolumeMonthRow
  return m ? `${m.month} ${m.year}` : ''
})

const chartAriaLabel = computed(() =>
  viewMode.value === '7day'
    ? 'Bar chart: daily shipment volume for the past 7 days. Click a bar to filter the dashboard to that day.'
    : 'Bar chart: monthly shipment volume for the past 12 months. Click a bar to filter the dashboard to that month.'
)

// Clear selection whenever the user switches view modes
watch(viewMode, () => clearSelection())
</script>


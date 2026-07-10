<template>
  <section class="dashboard__section" id="section-kpi" aria-labelledby="kpi-heading">
    <div class="section-header">
      <h2 class="section-title" id="kpi-heading">Key Performance Indicators</h2>
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
      id="kpi-content"
    >
      <div class="kpi-grid" role="list" aria-label="Key performance indicator summary cards">
        <KpiCard
          v-for="(card, i) in cardDefs"
          :key="card.kpiKey"
          v-bind="card"
          :delay="i * 0.07"
          :refreshing="refreshing"
          @show-tooltip="onShowTooltip"
          @hide-tooltip="onHideTooltip"
        />
      </div>
    </div>

    <!-- Tooltip teleported to body so it renders above all other content -->
    <Teleport to="body">
      <div
        class="tooltip"
        :class="{ 'tooltip--visible': tooltip.visible }"
        role="tooltip"
        :aria-hidden="!tooltip.visible"
        :style="{ top: `${tooltip.top}px`, left: `${tooltip.left}px` }"
      >
        {{ tooltip.text }}
      </div>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import KpiCard from './KpiCard.vue'
import { kpiData, kpiTooltips } from '@/data/index'

const isExpanded = ref(true)
const refreshing = ref(false)

const tooltip = reactive({
  visible: false,
  text: '',
  top: 0,
  left: 0,
})

/**
 * Determines the status class for a KPI based on business threshold rules.
 * @param key - KPI data key
 * @param value - Current KPI value
 */
function getKpiStatus(key: string, value: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (key === 'onTimeDeliveryRate') {
    if (value >= 90) return 'success'
    if (value >= 80) return 'warning'
    return 'danger'
  }
  if (key === 'openExceptions') {
    if (value > 30) return 'danger'
    if (value >= 15) return 'warning'
    return 'success'
  }
  return 'neutral'
}

const cardDefs = computed(() => [
  {
    kpiKey: 'totalShipmentsMTD',
    label: 'Total Shipments',
    sublabel: 'Month to Date',
    value: kpiData.totalShipmentsMTD,
    status: getKpiStatus('totalShipmentsMTD', kpiData.totalShipmentsMTD),
    tooltipText: kpiTooltips['totalShipmentsMTD'],
  },
  {
    kpiKey: 'onTimeDeliveryRate',
    label: 'On-Time Delivery',
    sublabel: 'Target ≥ 90%',
    value: kpiData.onTimeDeliveryRate,
    status: getKpiStatus('onTimeDeliveryRate', kpiData.onTimeDeliveryRate),
    tooltipText: kpiTooltips['onTimeDeliveryRate'],
  },
  {
    kpiKey: 'openExceptions',
    label: 'Open Exceptions',
    sublabel: 'Requires Attention',
    value: kpiData.openExceptions,
    status: getKpiStatus('openExceptions', kpiData.openExceptions),
    tooltipText: kpiTooltips['openExceptions'],
  },
  {
    kpiKey: 'avgTransitTime',
    label: 'Avg Transit Time',
    sublabel: 'Trailing 7 Days',
    value: kpiData.avgTransitTime,
    status: getKpiStatus('avgTransitTime', kpiData.avgTransitTime),
    trend: kpiData.avgTransitTimeTrend,
    tooltipText: kpiTooltips['avgTransitTime'],
  },
] as const)

/** Shows the KPI tooltip positioned near the hovered card element. */
function onShowTooltip(cardEl: HTMLElement, text: string) {
  tooltip.text = text
  tooltip.visible = true

  const cardRect = cardEl.getBoundingClientRect()
  tooltip.top = cardRect.bottom + window.scrollY + 10
  tooltip.left = 8 // temp — re-centered on next frame

  requestAnimationFrame(() => {
    const ttEl = document.querySelector('[role="tooltip"]') as HTMLElement | null
    if (!ttEl) return
    const ttWidth = ttEl.offsetWidth
    const centered = cardRect.left + window.scrollX + cardRect.width / 2 - ttWidth / 2
    tooltip.left = Math.max(8, Math.min(centered, window.innerWidth - ttWidth - 8))
  })
}

/** Hides the shared KPI tooltip. */
function onHideTooltip() {
  tooltip.visible = false
}

let refreshInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // Simulate live data refresh pulse every 60 seconds
  refreshInterval = setInterval(() => {
    refreshing.value = true
    setTimeout(() => {
      refreshing.value = false
    }, 1500)
  }, 60_000)
})

onUnmounted(() => {
  clearInterval(refreshInterval)
})
</script>

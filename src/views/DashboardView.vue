<template>
  <NavBar />

  <main class="dashboard" id="main-content" role="main" aria-label="Operations Dashboard">
    <!-- KPI Summary Row -->
    <KpiGrid />

    <!-- Two-column row: Regional Performance (left) + Open Exceptions (right) -->
    <div
      class="dashboard__row"
      :class="rowClass"
    >
      <RegionalTable v-model:expanded="regionalExpanded" />
      <ExceptionsFeed v-model:expanded="exceptionsExpanded" />
    </div>

    <!-- Shipment Volume 7-Day Trend -->
    <VolumeChart />

    <!-- Carrier Performance Snapshot -->
    <CarrierGrid />
  </main>

  <!-- Fixed print/export button -->
  <button
    class="print-btn"
    id="print-btn"
    aria-label="Print or export dashboard view"
    @click="printDashboard"
  >
    <span aria-hidden="true">🖨</span> Export
  </button>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import KpiGrid from '@/components/KpiGrid.vue'
import RegionalTable from '@/components/RegionalTable.vue'
import ExceptionsFeed from '@/components/ExceptionsFeed.vue'
import VolumeChart from '@/components/VolumeChart.vue'
import CarrierGrid from '@/components/CarrierGrid.vue'

const regionalExpanded = ref(true)
const exceptionsExpanded = ref(true)

/**
 * Returns the drawer modifier class for the 2-column row based on which panel
 * is collapsed. When neither or both are collapsed, no modifier is applied and
 * the row uses the default 1fr/1fr split.
 */
const rowClass = computed(() => {
  if (!regionalExpanded.value && exceptionsExpanded.value) return 'dashboard__row--left-collapsed'
  if (regionalExpanded.value && !exceptionsExpanded.value) return 'dashboard__row--right-collapsed'
  return ''
})

/** Triggers the browser print/export dialog. */
function printDashboard() {
  window.print()
}
</script>

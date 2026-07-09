<template>
  <NavBar />

  <main class="dashboard" id="main-content" role="main" aria-label="Operations Dashboard">
    <!-- KPI Summary Row -->
    <KpiGrid />

    <!-- Two-column row: Regional Performance (left) + Open Exceptions (right) -->
    <div
      class="dashboard__row"
      :class="{ 'dashboard__row--single': rowIsSingle }"
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
 * Row switches to single-column layout when exactly one section is collapsed,
 * allowing the expanded section to fill the full row width.
 */
const rowIsSingle = computed(
  () => regionalExpanded.value !== exceptionsExpanded.value,
)

/** Triggers the browser print/export dialog. */
function printDashboard() {
  window.print()
}
</script>

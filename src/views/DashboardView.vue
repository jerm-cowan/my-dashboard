<template>
  <NavBar />

  <v-main>
    <v-container
      fluid
      class="dashboard-container"
      id="main-content"
      role="main"
      aria-label="Operations Dashboard"
    >
      <!-- KPI Summary Row -->
      <KpiGrid :selected-period="selectedPeriod" />

      <!-- Two-column row: Regional Performance (left) + Open Exceptions (right) -->
      <v-row
        class="dashboard__row"
        :class="rowClass"
        no-gutters
      >
        <v-col class="dashboard__col-left">
          <RegionalTable v-model:expanded="regionalExpanded" :selected-period="selectedPeriod" />
        </v-col>
        <v-col class="dashboard__col-right">
          <ExceptionsFeed v-model:expanded="exceptionsExpanded" :selected-period="selectedPeriod" />
        </v-col>
      </v-row>

      <!-- Shipment Volume chart with period selection -->
      <VolumeChart @period-selected="onPeriodSelected" />

      <!-- Carrier Performance Snapshot -->
      <CarrierGrid :selected-period="selectedPeriod" />
    </v-container>
  </v-main>

  <!-- Fixed print/export button -->
  <v-btn
    color="primary"
    class="print-fab"
    prepend-icon="mdi-printer"
    aria-label="Print or export dashboard view"
    @click="printDashboard"
  >
    Export
  </v-btn>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import NavBar from '@/components/NavBar.vue'
import KpiGrid from '@/components/KpiGrid.vue'
import RegionalTable from '@/components/RegionalTable.vue'
import ExceptionsFeed from '@/components/ExceptionsFeed.vue'
import VolumeChart from '@/components/VolumeChart.vue'
import CarrierGrid from '@/components/CarrierGrid.vue'
import type { SelectedPeriod } from '@/types/index'

const regionalExpanded   = ref(true)
const exceptionsExpanded = ref(true)

/**
 * The period currently selected in the Shipment Volume chart.
 * Passed as a prop to every dashboard section so they can display
 * context-aware data without a global state library.
 */
const selectedPeriod = ref<SelectedPeriod | null>(null)

/** Receives the emitted period from VolumeChart and stores it. */
function onPeriodSelected(period: SelectedPeriod | null) {
  selectedPeriod.value = period
}

/**
 * Returns the drawer modifier class for the 2-column row based on which panel
 * is collapsed. When neither or both are collapsed, no modifier is applied and
 * the row uses the default equal-width split.
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

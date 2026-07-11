<template>
  <v-card class="dashboard__section" id="section-carriers" aria-labelledby="carriers-heading">
    <div class="section-header">
      <h2 class="section-title" id="carriers-heading">
        Carrier Performance
        <v-chip
          v-if="props.selectedPeriod"
          size="x-small"
          variant="tonal"
          color="primary"
          class="section-period-chip"
          aria-label="Period context"
        >{{ props.selectedPeriod.label }}</v-chip>
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
      id="carriers-content"
    >
      <v-row
        no-gutters
        class="carrier-grid-row"
        id="carrier-grid"
        role="list"
        aria-label="Carrier performance snapshot"
      >
        <v-col
          v-for="(carrier, i) in activeCarrierData"
          :key="carrier.carrier"
          cols="12"
          sm="6"
          lg="3"
        >
          <v-card
            class="carrier-card animate-in"
            :style="{ '--delay': `${0.08 + i * 0.07}s` }"
            role="listitem"
            :aria-label="`${carrier.carrier}: ${carrier.shipments.toLocaleString()} shipments, ${carrier.onTimeRate}% on-time, trend ${carrier.trend}`"
          >
            <div class="carrier-card__name">{{ carrier.carrier }}</div>
            <div class="carrier-card__stats">
              <div class="carrier-card__stat">
                <span class="carrier-stat-label">Shipments</span>
                <span class="carrier-stat-value">{{ carrier.shipments.toLocaleString() }}</span>
              </div>
              <div class="carrier-card__stat">
                <span class="carrier-stat-label">On-Time</span>
                <div class="carrier-ontime-row">
                  <span
                    class="carrier-stat-value"
                    :class="`carrier-stat-value--${onTimeRateStatus(carrier.onTimeRate)}`"
                  >{{ carrier.onTimeRate }}%</span>
                  <span
                    class="carrier-trend"
                    :class="`carrier-stat-value--${onTimeRateStatus(carrier.onTimeRate)}`"
                    :aria-label="`Trend: ${trendLabel(carrier.trend)}`"
                  >{{ trendIcon(carrier.trend) }}</span>
                </div>
              </div>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { carrierData, thresholds, carrierSnapshots } from '@/data/index'
import type { SelectedPeriod, CarrierRow } from '@/types/index'

const props = defineProps<{ selectedPeriod?: SelectedPeriod | null }>()
const isExpanded = ref(true)

/** Canonical carrier display order. */
const CARRIER_ORDER = ['FedEx Freight', 'XPO Logistics', 'Old Dominion', 'Estes Express']

/**
 * Returns carrier rows for the active period when a chart bar is selected,
 * or the base dataset when no period is active.
 */
const activeCarrierData = computed((): CarrierRow[] => {
  if (!props.selectedPeriod) return carrierData
  const snaps = carrierSnapshots
    .filter(s => s.periodKey === props.selectedPeriod!.periodKey)
    .sort((a, b) => CARRIER_ORDER.indexOf(a.carrier) - CARRIER_ORDER.indexOf(b.carrier))
  if (snaps.length === 0) return carrierData
  return snaps.map(s => ({
    carrier:    s.carrier,
    shipments:  s.shipments,
    onTimeRate: s.onTimeRate,
    trend:      s.trend,
  }))
})

/**
 * Returns the status class key for an on-time rate value.
 * Thresholds sourced from metrics.json — shared with KpiGrid and RegionalTable.
 */
function onTimeRateStatus(value: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value >= thresholds.onTimeRate.success) return 'success'
  if (value >= thresholds.onTimeRate.warning) return 'warning'
  return 'danger'
}

/** Returns the trend arrow character for a trend direction. */
function trendIcon(trend: string): string {
  const icons: Record<string, string> = { up: '↑', flat: '→', down: '↓' }
  return icons[trend] ?? '→'
}

/** Returns a human-readable label for a trend direction. */
function trendLabel(trend: string): string {
  const labels: Record<string, string> = { up: 'improving', flat: 'stable', down: 'declining' }
  return labels[trend] ?? trend
}
</script>

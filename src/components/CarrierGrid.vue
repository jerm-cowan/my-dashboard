<template>
  <v-card class="dashboard__section" id="section-carriers" aria-labelledby="carriers-heading">
    <div class="section-header">
      <h2 class="section-title" id="carriers-heading">Carrier Performance</h2>
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
        class="pa-6 pt-5 ma-0"
        id="carrier-grid"
        role="list"
        aria-label="Carrier performance snapshot"
      >
        <v-col
          v-for="(carrier, i) in carrierData"
          :key="carrier.carrier"
          cols="12"
          sm="6"
          lg="3"
          class="pa-2"
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
                <span
                  class="carrier-stat-value"
                  :class="`carrier-stat-value--${onTimeRateStatus(carrier.onTimeRate)}`"
                >{{ carrier.onTimeRate }}%</span>
              </div>
              <span
                class="carrier-trend"
                :class="`trend--${carrier.trend}`"
                :aria-label="`Trend: ${trendLabel(carrier.trend)}`"
              >{{ trendIcon(carrier.trend) }}</span>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { carrierData } from '@/data/index'

const isExpanded = ref(true)

/** Returns the status class key for an on-time rate value. */
function onTimeRateStatus(value: number): 'success' | 'warning' | 'danger' | 'neutral' {
  if (value >= 90) return 'success'
  if (value >= 80) return 'warning'
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

<template>
  <v-card
    class="dashboard__section"
    id="section-regional"
    aria-labelledby="regional-heading"
    height="100%"
  >
    <div class="section-header">
      <h2 class="section-title" id="regional-heading">Regional Performance</h2>
      <button
        class="section-toggle"
        :aria-expanded="expanded"
        :title="expanded ? 'Collapse section' : 'Expand section'"
        @click="$emit('update:expanded', !expanded)"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </div>

    <div
      class="section-content"
      :class="{ 'section-content--collapsed': !expanded }"
      id="regional-content"
      role="region"
      aria-label="Regional performance data"
    >
      <v-table
        class="regional-table"
        density="compact"
        aria-label="Performance metrics by operating region"
      >
        <thead>
          <tr>
            <th scope="col">Region</th>
            <th scope="col" class="text-right">Shipments</th>
            <th scope="col" class="text-right">On-Time %</th>
            <th scope="col" class="text-right">Exceptions</th>
            <th scope="col">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(row, i) in regionalData"
            :key="row.region"
            class="animate-in"
            :style="{ '--delay': `${0.08 + i * 0.05}s` }"
            tabindex="0"
            :aria-label="`${row.region}: ${row.shipments.toLocaleString()} shipments, ${row.onTimeRate}% on-time, ${row.exceptions} exceptions`"
          >
            <td class="table-cell--region">{{ row.region }}</td>
            <td class="table-cell--number text-right">{{ row.shipments.toLocaleString() }}</td>
            <td class="table-cell--number text-right">
              <span
                class="rate-value"
                :class="`rate--${onTimeRateStatus(row.onTimeRate)}`"
              >{{ row.onTimeRate }}%</span>
            </td>
            <td class="table-cell--number text-right">
              <span
                class="exception-count"
                :class="row.exceptions > 10 ? 'exception-count--warning' : 'exception-count--normal'"
              >{{ row.exceptions }}</span>
            </td>
            <td>
              <v-chip
                size="x-small"
                variant="tonal"
                :color="statusChipColor(row.status)"
              >
                {{ statusLabel(row.status) }}
              </v-chip>
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { regionalData } from '@/data/index'

defineProps<{ expanded: boolean }>()
defineEmits<{ 'update:expanded': [value: boolean] }>()

/** Returns the status class key for an on-time rate value. */
function onTimeRateStatus(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 90) return 'success'
  if (value >= 80) return 'warning'
  return 'danger'
}

/** Maps a row status key to its Vuetify chip color name. */
function statusChipColor(status: string): string {
  const map: Record<string, string> = {
    'on-track': 'success',
    'at-risk': 'warning',
    critical: 'error',
  }
  return map[status] ?? 'success'
}

/** Maps a row status key to its display label. */
function statusLabel(status: string): string {
  const map: Record<string, string> = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    critical: 'Critical',
  }
  return map[status] ?? status
}
</script>

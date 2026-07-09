<template>
  <section
    class="dashboard__section"
    id="section-regional"
    aria-labelledby="regional-heading"
  >
    <div class="section-header">
      <h2 class="section-title" id="regional-heading">Regional Performance</h2>
      <button
        class="section-toggle"
        :aria-expanded="expanded.toString()"
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
    >
      <div class="table-wrapper" role="region" aria-label="Regional performance data">
        <table
          class="data-table"
          id="regional-table"
          aria-label="Performance metrics by operating region"
        >
          <thead>
            <tr>
              <th scope="col">Region</th>
              <th scope="col" class="col-num">Shipments</th>
              <th scope="col" class="col-num">On-Time %</th>
              <th scope="col" class="col-num">Exceptions</th>
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
              <td class="table-cell--number">{{ row.shipments.toLocaleString() }}</td>
              <td class="table-cell--number">
                <span
                  class="rate-value"
                  :class="`rate--${onTimeRateStatus(row.onTimeRate)}`"
                >{{ row.onTimeRate }}%</span>
              </td>
              <td class="table-cell--number">
                <span
                  class="exception-count"
                  :class="row.exceptions > 10 ? 'exception-count--warning' : 'exception-count--normal'"
                >{{ row.exceptions }}</span>
              </td>
              <td>
                <span class="status-badge" :class="statusBadgeClass(row.status)">
                  <span aria-hidden="true">●</span> {{ statusLabel(row.status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
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

/** Maps a row status key to its badge CSS class. */
function statusBadgeClass(status: string): string {
  const map: Record<string, string> = {
    'on-track': 'badge--success',
    'at-risk': 'badge--warning',
    critical: 'badge--danger',
  }
  return map[status] ?? 'badge--success'
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

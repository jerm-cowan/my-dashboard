<template>
  <v-card
    class="dashboard__section"
    id="section-exceptions"
    aria-labelledby="exceptions-heading"
    height="100%"
  >
    <div class="section-header">
      <h2 class="section-title" id="exceptions-heading">
        <!--
          Heading is context-aware:
          - No selection or current-month period  → "Open Exceptions" + live count badge
          - Historical month selected             → "Exceptions" + period chip
          The count badge updates dynamically as the period filter changes,
          so clicking Jul 7 shows "Open Exceptions 9" not "Open Exceptions 41".
        -->
        {{ isCurrentMonthPeriod ? 'Open Exceptions' : 'Exceptions' }}
        <span
          v-if="isCurrentMonthPeriod"
          class="section-title__count"
          :aria-label="`${filteredData.length} ${props.selectedPeriod ? 'exceptions' : 'open exceptions'}`"
          aria-live="polite"
        >{{ filteredData.length }}</span>
        <!-- Period chip shown for ALL selected periods — current month and historical alike -->
        <v-chip
          v-if="props.selectedPeriod"
          size="x-small"
          variant="tonal"
          color="primary"
          class="section-period-chip"
          :aria-label="`Showing exceptions for ${props.selectedPeriod.label}`"
        >{{ props.selectedPeriod.label }}</v-chip>
      </h2>
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
      id="exceptions-content"
    >
      <!-- Controls: search → filter → sort -->
      <div
        class="exceptions-controls"
        role="group"
        aria-label="Search, filter, and sort exceptions"
      >
        <v-text-field
          v-model="searchQuery"
          type="text"
          class="exceptions-search-field"
          placeholder="Search: ID, issue type, region, time"
          aria-label="Search exceptions by ID, shipment, type, region, priority, or time open"
          :hint="searchQuery ? 'Search: ID, issue type, region, time' : ''"
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details="auto"
          clearable
          autocomplete="off"
          @click:clear="searchQuery = ''"
        />

        <v-select
          v-model="filterValue"
          :items="filterItems"
          :menu-props="{ class: 'exceptions-filter-menu' }"
          aria-label="Filter exceptions by region or priority"
          variant="outlined"
          density="compact"
          hide-details
          class="exceptions-filter-select"
        />

        <v-select
          v-model="sortValue"
          :items="sortItems"
          :menu-props="{ class: 'exceptions-sort-menu' }"
          aria-label="Sort exceptions"
          variant="outlined"
          density="compact"
          hide-details
          class="exceptions-sort-select"
        />
      </div>

      <!-- Exceptions feed -->
      <div
        class="exceptions-feed"
        id="exceptions-feed"
        role="feed"
        aria-label="Open exceptions feed"
        aria-live="polite"
        aria-relevant="additions removals"
      >
        <p v-if="filteredData.length === 0" class="exceptions-empty">
          <template v-if="monthAggregateCount !== null">
            <strong>{{ monthAggregateCount }}</strong> exceptions were logged in
            {{ props.selectedPeriod!.label }}.
            Individual records are available for the current month and 7-day window.
          </template>
          <template v-else-if="props.selectedPeriod">
            No exceptions recorded for {{ props.selectedPeriod.label }}.
          </template>
          <template v-else>
            No exceptions match the current filter or search.
          </template>
        </p>

        <article
          v-for="(exc, i) in filteredData"
          :key="exc.id"
          class="exception-item animate-in"
          :class="`exception-item--${exc.priority.toLowerCase()}`"
          :style="{ '--delay': `${i * 0.03}s` }"
          tabindex="0"
          :aria-label="`${exc.id}, ${exc.type}, ${exc.priority} priority, ${exc.region}, open ${exc.hoursOpen} hours`"
        >
          <div class="exception-item__header">
            <div class="exception-item__ids">
              <span class="exception-item__id">{{ exc.id }}</span>
              <span class="exception-item__shipment">{{ exc.shipmentId }}</span>
            </div>
            <v-chip
              size="small"
              variant="tonal"
              :color="priorityColor(exc.priority)"
              class="font-weight-black text-uppercase"
            >
              {{ exc.priority }}
            </v-chip>
          </div>
          <div class="exception-item__body">
            <span class="exception-item__type">{{ exc.type }}</span>
            <span class="exception-item__region">{{ exc.region }}</span>
            <span class="exception-item__time">{{ exc.hoursOpen }} hrs open</span>
          </div>
        </article>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { exceptionsData, regionalData, kpiSnapshots } from '@/data/index'
import type { Exception, SelectedPeriod } from '@/types/index'

const props = defineProps<{ expanded: boolean; selectedPeriod?: SelectedPeriod | null }>()
defineEmits<{ 'update:expanded': [value: boolean] }>()

const searchQuery = ref('')
const filterValue = ref('all')
const sortValue = ref('priority-time')

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

/**
 * Filter dropdown items.
 * Region options are derived from regionalData so adding a region to
 * metrics.json automatically appears here — no hardcoded list to maintain.
 */
const filterItems = [
  { title: 'All Exceptions',   value: 'all'            },
  { title: 'HIGH Priority',    value: 'priority-HIGH'  },
  { title: 'MEDIUM Priority',  value: 'priority-MEDIUM'},
  { title: 'LOW Priority',     value: 'priority-LOW'   },
  ...regionalData.map(r => ({ title: r.region, value: `region-${r.region}` })),
]

/**
 * Base exception set for the active period.
 * When a period is selected, only exceptions whose dateISO matches are included.
 * For a monthly period, all exceptions whose dateISO starts with the month key
 * are included (e.g. "2026-07" matches "2026-07-05").
 * When no period is active the full dataset is used.
 */
const periodBaseData = computed((): Exception[] => {
  if (!props.selectedPeriod) return exceptionsData
  const { type, periodKey } = props.selectedPeriod
  if (type === 'day')   return exceptionsData.filter(e => e.dateISO === periodKey)
  if (type === 'month') return exceptionsData.filter(e => e.dateISO.startsWith(periodKey))
  return exceptionsData
})

/**
 * ISO month key for the current calendar month (e.g. "2026-07").
 * Computed dynamically so it stays correct as time passes.
 */
const currentMonthKey = computed(() => {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
})

/**
 * True when no period is selected OR the selected period falls within the
 * current calendar month (daily or monthly bar in the current month).
 * Controls whether the heading reads "Open Exceptions" vs "Exceptions".
 */
const isCurrentMonthPeriod = computed((): boolean => {
  if (!props.selectedPeriod) return true
  const { type, periodKey } = props.selectedPeriod
  if (type === 'month') return periodKey === currentMonthKey.value
  if (type === 'day')   return periodKey.startsWith(currentMonthKey.value)
  return false
})

/**
 * When a 12-month bar is selected and no individual exception records exist for
 * that period, return the aggregate count from kpiSnapshots so the empty state
 * can show a meaningful summary instead of just "no results".
 */
const monthAggregateCount = computed((): number | null => {
  if (!props.selectedPeriod || props.selectedPeriod.type !== 'month') return null
  if (periodBaseData.value.length > 0) return null   // records exist — no summary needed
  const snap = kpiSnapshots.find(s => s.periodKey === props.selectedPeriod!.periodKey)
  return snap?.openExceptions ?? null
})

/** Sort dropdown items. */
const sortItems = [
  { title: 'Priority & Time Open', value: 'priority-time' },
  { title: 'Time Open (Descending)', value: 'time' },
  { title: 'Exception ID', value: 'id' },
  { title: 'Shipment ID', value: 'shipment-id' },
  { title: 'Region', value: 'region' },
]

/** Applies current filter, search, and sort state to the period-filtered base. */
const filteredData = computed((): Exception[] => {
  let data = [...periodBaseData.value]

  // 1. Apply dropdown filter (region or priority)
  if (filterValue.value !== 'all') {
    if (filterValue.value.startsWith('priority-')) {
      const priority = filterValue.value.slice('priority-'.length)
      data = data.filter((e) => e.priority === priority)
    } else if (filterValue.value.startsWith('region-')) {
      const region = filterValue.value.slice('region-'.length)
      data = data.filter((e) => e.region === region)
    }
  }

  // 2. Apply search query against all exception fields (case-insensitive)
  const query = (searchQuery.value ?? '').trim().toLowerCase()
  if (query) {
    data = data.filter(
      (e) =>
        e.id.toLowerCase().includes(query) ||
        e.shipmentId.toLowerCase().includes(query) ||
        e.type.toLowerCase().includes(query) ||
        e.region.toLowerCase().includes(query) ||
        e.priority.toLowerCase().includes(query) ||
        String(e.hoursOpen).includes(query),
    )
  }

  // 3. Apply sort
  switch (sortValue.value) {
    case 'priority-time':
      data.sort((a, b) => {
        const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
        return pd !== 0 ? pd : b.hoursOpen - a.hoursOpen
      })
      break
    case 'id':
      data.sort((a, b) => a.id.localeCompare(b.id))
      break
    case 'shipment-id':
      data.sort((a, b) => a.shipmentId.localeCompare(b.shipmentId))
      break
    case 'region':
      data.sort((a, b) => a.region.localeCompare(b.region))
      break
    case 'time':
      data.sort((a, b) => b.hoursOpen - a.hoursOpen)
      break
  }

  return data
})

/** Maps a priority value to its Vuetify color name.
 *  LOW uses the default/secondary neutral rather than 'success' (green).
 *  Green means "healthy / no problem" elsewhere in the dashboard; LOW
 *  exceptions are still open issues — just less urgent — so a muted neutral
 *  avoids the false-positive signal that green would create.
 */
function priorityColor(priority: string): string {
  const map: Record<string, string> = {
    HIGH: 'error',
    MEDIUM: 'warning',
    LOW: 'secondary',
  }
  return map[priority] ?? 'secondary'
}
</script>

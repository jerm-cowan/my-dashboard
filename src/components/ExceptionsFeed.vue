<template>
  <v-card
    class="dashboard__section"
    id="section-exceptions"
    aria-labelledby="exceptions-heading"
    height="100%"
  >
    <div class="section-header">
      <h2 class="section-title" id="exceptions-heading">
        Open Exceptions
        <span
          class="section-title__count"
          :aria-label="`${filteredData.length} exceptions`"
          aria-live="polite"
        >{{ filteredData.length }}</span>
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
          No exceptions match the current filter or search.
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
import { exceptionsData } from '@/data/index'
import type { Exception } from '@/types/index'

defineProps<{ expanded: boolean }>()
defineEmits<{ 'update:expanded': [value: boolean] }>()

const searchQuery = ref('')
const filterValue = ref('all')
const sortValue = ref('priority-time')

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

/** Filter dropdown items — flattened Priority and Region groups. */
const filterItems = [
  { title: 'All Exceptions', value: 'all' },
  { title: 'HIGH Priority', value: 'priority-HIGH' },
  { title: 'MEDIUM Priority', value: 'priority-MEDIUM' },
  { title: 'LOW Priority', value: 'priority-LOW' },
  { title: 'Northeast', value: 'region-Northeast' },
  { title: 'Southeast', value: 'region-Southeast' },
  { title: 'Midwest', value: 'region-Midwest' },
  { title: 'Southwest', value: 'region-Southwest' },
  { title: 'West Coast', value: 'region-West Coast' },
]

/** Sort dropdown items. */
const sortItems = [
  { title: 'Priority & Time Open', value: 'priority-time' },
  { title: 'Time Open (Descending)', value: 'time' },
  { title: 'Exception ID', value: 'id' },
  { title: 'Shipment ID', value: 'shipment-id' },
  { title: 'Region', value: 'region' },
]

/** Applies current filter, search, and sort state to the exceptions dataset. */
const filteredData = computed((): Exception[] => {
  let data = [...exceptionsData]

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

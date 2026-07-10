<template>
  <section
    class="dashboard__section"
    id="section-exceptions"
    aria-labelledby="exceptions-heading"
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
        <div class="exceptions-search">
          <span class="exceptions-search__icon" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            v-model="searchQuery"
            type="search"
            id="exceptions-search-input"
            class="exceptions-search__input"
            placeholder="Search by"
            aria-label="Search exceptions by ID, shipment, type, region, priority, or time open"
            autocomplete="off"
            spellcheck="false"
          />
        </div>

        <label for="exception-filter" class="sr-only">Filter exceptions by region or priority</label>
        <select
          v-model="filterValue"
          class="filter-select"
          id="exception-filter"
          aria-label="Filter exceptions by region or priority"
        >
          <option value="all">All Exceptions</option>
          <optgroup label="By Priority">
            <option value="priority-HIGH">HIGH Priority</option>
            <option value="priority-MEDIUM">MEDIUM Priority</option>
            <option value="priority-LOW">LOW Priority</option>
          </optgroup>
          <optgroup label="By Region">
            <option value="region-Northeast">Northeast</option>
            <option value="region-Southeast">Southeast</option>
            <option value="region-Midwest">Midwest</option>
            <option value="region-Southwest">Southwest</option>
            <option value="region-West Coast">West Coast</option>
          </optgroup>
        </select>

        <label for="exception-sort" class="sr-only">Sort exceptions</label>
        <select
          v-model="sortValue"
          class="filter-select"
          id="exception-sort"
          aria-label="Sort exceptions"
        >
          <option value="priority-time">Sort by: Priority &amp; Time Open</option>
          <option value="id">Sort by: Exception ID (EXC-#####)</option>
          <option value="shipment-id">Sort by: Shipment ID (SHP-#####)</option>
          <option value="region">Sort by: Region</option>
          <option value="time">Sort by: Time Open (Descending)</option>
        </select>
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
            <span class="priority-badge" :class="priorityClass(exc.priority)">{{ exc.priority }}</span>
          </div>
          <div class="exception-item__body">
            <span class="exception-item__type">{{ exc.type }}</span>
            <span class="exception-item__region">{{ exc.region }}</span>
            <span class="exception-item__time">{{ exc.hoursOpen }} hrs open</span>
          </div>
        </article>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { exceptionsData } from '@/data/index'
import type { Exception } from '@/data/index'

defineProps<{ expanded: boolean }>()
defineEmits<{ 'update:expanded': [value: boolean] }>()

const searchQuery = ref('')
const filterValue = ref('all')
const sortValue = ref('priority-time')

const PRIORITY_ORDER: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }

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
  const query = searchQuery.value.trim().toLowerCase()
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

/** Maps a priority value to its CSS class. */
function priorityClass(priority: string): string {
  const map: Record<string, string> = {
    HIGH: 'priority--high',
    MEDIUM: 'priority--medium',
    LOW: 'priority--low',
  }
  return map[priority] ?? 'priority--low'
}
</script>

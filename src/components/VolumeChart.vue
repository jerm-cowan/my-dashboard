<template>
  <section class="dashboard__section" id="section-trend" aria-labelledby="trend-heading">
    <div class="section-header">
      <h2 class="section-title" id="trend-heading">Shipment Volume — 7-Day Trend</h2>
      <button
        class="section-toggle"
        :aria-expanded="isExpanded.toString()"
        :title="isExpanded ? 'Collapse section' : 'Expand section'"
        @click="isExpanded = !isExpanded"
      >
        <span aria-hidden="true">▾</span>
      </button>
    </div>

    <div
      class="section-content"
      :class="{ 'section-content--collapsed': !isExpanded }"
      id="trend-content"
    >
      <div
        class="bar-chart"
        id="volume-chart"
        role="img"
        aria-label="Bar chart: daily shipment volume for the past 7 days"
      >
        <div
          v-for="(day, i) in volumeTrendData"
          :key="day.day"
          class="bar-chart__group animate-in"
          :class="{ 'bar-chart__group--today': i === volumeTrendData.length - 1 }"
          :style="{ '--delay': `${0.12 + i * 0.06}s` }"
        >
          <span class="bar-chart__value" aria-hidden="true">{{ day.volume.toLocaleString() }}</span>
          <div
            class="bar-chart__bar"
            :style="{ height: `${barHeight(day.volume)}px`, '--bar-delay': `${0.2 + i * 0.06}s` }"
            :aria-label="`${day.day} ${day.date}: ${day.volume.toLocaleString()} shipments`"
          ></div>
          <div class="bar-chart__day-label" aria-hidden="true">
            <span class="bar-chart__day">{{ day.day }}</span>
            <span class="bar-chart__date">{{ day.date }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { volumeTrendData } from '@/data/index'

const isExpanded = ref(true)

/** Maximum bar height in pixels — bars scale proportionally to the peak volume day. */
const MAX_BAR_PX = 160

const maxVolume = computed(() => Math.max(...volumeTrendData.map((d) => d.volume)))

/** Computes a proportional bar height in pixels clamped to a minimum of 4px. */
function barHeight(volume: number): number {
  return Math.max(4, Math.round((volume / maxVolume.value) * MAX_BAR_PX))
}
</script>

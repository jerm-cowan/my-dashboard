<template>
  <v-card
    class="kpi-card animate-in"
    :class="[`kpi-card--${status}`, { 'kpi-card--refreshing': refreshing }]"
    :style="{ '--delay': `${delay}s` }"
    :data-kpi="kpiKey"
    :aria-label="`${label}: ${formattedValue}`"
    tabindex="0"
    role="listitem"
    @mouseenter="$emit('show-tooltip', ($el as HTMLElement), tooltipText)"
    @mouseleave="$emit('hide-tooltip')"
    @focus="$emit('show-tooltip', ($el as HTMLElement), tooltipText)"
    @blur="$emit('hide-tooltip')"
  >
    <span class="kpi-card__label">{{ label }}</span>
    <div class="kpi-card__value-row">
      <span class="kpi-card__value">{{ formattedValue }}</span>
      <span
        v-if="status !== 'neutral'"
        class="kpi-card__dot"
        :class="`status-dot--${status}`"
        aria-hidden="true"
      ></span>
      <span
        v-if="trend"
        class="kpi-trend"
        :class="`trend--${trend}`"
        :aria-label="`Trend: ${trendLabel}`"
      >{{ trendIcon }}</span>
    </div>
    <span class="kpi-card__sublabel">{{ sublabel }}</span>
    <div class="kpi-card__accent-bar" aria-hidden="true"></div>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  kpiKey: string
  label: string
  sublabel: string
  value: number
  /** Value display format sourced from kpiMeta in metrics.json. */
  format: 'number' | 'percent' | 'days' | 'count'
  status: 'success' | 'warning' | 'danger' | 'neutral'
  trend?: 'up' | 'down' | 'flat'
  delay: number
  refreshing: boolean
  tooltipText: string
}>()

defineEmits<{
  'show-tooltip': [el: HTMLElement, text: string]
  'hide-tooltip': []
}>()

/**
 * Formats a raw KPI value using the format type declared in metrics.json.
 * Adding a new KPI only requires updating metrics.json — no code change needed.
 */
const formattedValue = computed(() => {
  switch (props.format) {
    case 'number':  return props.value.toLocaleString()
    case 'percent': return `${props.value}%`
    case 'days':    return `${props.value} days`
    default:        return String(props.value)
  }
})

const trendIcon = computed(() => {
  const icons: Record<string, string> = { up: '↑', down: '↓', flat: '→' }
  return props.trend ? (icons[props.trend] ?? '') : ''
})

const trendLabel = computed(() => {
  const labels: Record<string, string> = { up: 'improving', down: 'declining', flat: 'stable' }
  return props.trend ? (labels[props.trend] ?? props.trend) : ''
})
</script>

<template>
  <v-app-bar
    :elevation="0"
    color="transparent"
    class="navbar-appbar"
    role="banner"
    aria-label="FastForward Logistics dashboard navigation"
  >
    <div class="navbar__inner">
      <div class="navbar__brand">
        <span class="navbar__logo" :aria-label="appConfig.brand">{{ appConfig.brand }}</span>
        <span class="navbar__divider" aria-hidden="true"></span>
        <span class="navbar__title">{{ appConfig.title }}</span>
      </div>

      <div class="navbar__meta">
        <v-chip
          color="primary"
          variant="tonal"
          size="small"
          aria-label="Data source: Mock Data"
          class="status-pill"
        >
          {{ appConfig.dataMode === 'mock' ? 'Mock Data' : 'Live Data' }}
        </v-chip>

        <time
          class="navbar__timestamp"
          :datetime="isoTime"
          aria-live="polite"
          aria-label="Current date and time"
        >{{ displayTime }}</time>

        <v-btn
          :icon="themeIcon"
          :aria-label="themeLabel"
          variant="outlined"
          density="comfortable"
          size="small"
          @click="toggleTheme"
        />
      </div>
    </div>
  </v-app-bar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useTheme } from 'vuetify'
import { appConfig } from '@/data/index'

const vuetifyTheme = useTheme()

/** Formats the current date and time for display in the navbar. */
function formatTimestamp(): string {
  const now = new Date()
  const datePart = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
  const timePart = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
  return `${datePart} · ${timePart}`
}

const displayTime = ref(formatTimestamp())
const isoTime = ref(new Date().toISOString())

const isDark = computed(() => vuetifyTheme.global.name.value === 'fastforwardDark')
const themeLabel = computed(() => isDark.value ? 'Switch to light mode' : 'Switch to dark mode')
const themeIcon = computed(() => isDark.value ? 'mdi-weather-sunny' : 'mdi-weather-night')

/**
 * Toggles between the dark and light Vuetify themes and persists the
 * preference. Also syncs the data-theme attribute so CSS variables update.
 */
function toggleTheme() {
  const next = isDark.value ? 'fastforwardLight' : 'fastforwardDark'
  vuetifyTheme.global.name.value = next
  document.documentElement.setAttribute('data-theme', next === 'fastforwardLight' ? 'light' : 'dark')
  localStorage.setItem('ff-theme', next)
}

let timestampInterval: ReturnType<typeof setInterval>

onMounted(() => {
  // Restore persisted theme preference or fall back to OS preference
  const stored = localStorage.getItem('ff-theme')
  let themeName: 'fastforwardDark' | 'fastforwardLight'

  if (stored === 'fastforwardDark' || stored === 'fastforwardLight') {
    themeName = stored
  } else {
    themeName = window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'fastforwardDark'
      : 'fastforwardLight'
  }

  vuetifyTheme.global.name.value = themeName
  document.documentElement.setAttribute('data-theme', themeName === 'fastforwardLight' ? 'light' : 'dark')

  timestampInterval = setInterval(() => {
    displayTime.value = formatTimestamp()
    isoTime.value = new Date().toISOString()
  }, 60_000)
})

onUnmounted(() => {
  clearInterval(timestampInterval)
})
</script>

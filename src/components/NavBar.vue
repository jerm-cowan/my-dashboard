<template>
  <header class="navbar" role="banner" aria-label="FastForward Logistics dashboard navigation">
    <div class="navbar__inner">
      <div class="navbar__brand">
        <span class="navbar__logo" aria-label="FastForward Logistics">⚡ FastForward</span>
        <span class="navbar__divider" aria-hidden="true"></span>
        <span class="navbar__title">Operations Dashboard</span>
      </div>

      <div class="navbar__meta">
        <span class="status-pill" aria-label="Data source: Mock Data">Mock Data</span>
        <time
          class="navbar__timestamp"
          :datetime="isoTime"
          aria-live="polite"
          aria-label="Current date and time"
        >{{ displayTime }}</time>
        <button
          class="theme-toggle"
          :aria-label="themeLabel"
          title="Toggle theme"
          @click="toggleTheme"
        >
          <span class="theme-toggle__icon" aria-hidden="true">{{ themeIcon }}</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

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
const theme = ref<'dark' | 'light'>('dark')

const themeLabel = computed(() =>
  theme.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
)
const themeIcon = computed(() => (theme.value === 'dark' ? '☀️' : '🌙'))

/** Reads the stored theme preference or falls back to the OS setting. */
function resolveInitialTheme(): 'dark' | 'light' {
  const stored = localStorage.getItem('ff-theme')
  if (stored === 'dark' || stored === 'light') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Applies a theme by setting the data-theme attribute on <html>
 * and persisting the preference in localStorage.
 */
function applyTheme(t: 'dark' | 'light') {
  theme.value = t
  document.documentElement.setAttribute('data-theme', t)
  localStorage.setItem('ff-theme', t)
}

/** Toggles between dark and light themes. */
function toggleTheme() {
  applyTheme(theme.value === 'dark' ? 'light' : 'dark')
}

let timestampInterval: ReturnType<typeof setInterval>

onMounted(() => {
  applyTheme(resolveInitialTheme())

  timestampInterval = setInterval(() => {
    displayTime.value = formatTimestamp()
    isoTime.value = new Date().toISOString()
  }, 60_000)
})

onUnmounted(() => {
  clearInterval(timestampInterval)
})
</script>

import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'

/** FastForward dark theme — mission-control palette mapped to Vuetify semantic tokens. */
const fastforwardDark = {
  dark: true,
  colors: {
    background: '#0f1117',
    surface: '#1a1d27',
    'surface-bright': '#21263a',
    primary: '#3b82f6',
    secondary: '#94a3b8',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    'on-background': '#f1f5f9',
    'on-surface': '#f1f5f9',
  },
}

/** FastForward light theme — same brand palette on a light canvas. */
const fastforwardLight = {
  dark: false,
  colors: {
    background: '#f1f5f9',
    surface: '#ffffff',
    'surface-bright': '#f8fafc',
    primary: '#3b82f6',
    secondary: '#475569',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    'on-background': '#0f172a',
    'on-surface': '#0f172a',
  },
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  },
  theme: {
    defaultTheme: 'fastforwardDark',
    themes: {
      fastforwardDark,
      fastforwardLight,
    },
  },
})

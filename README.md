# FastForward Logistics — Operations Dashboard

A prototype internal operations dashboard built for the fictional FastForward Logistics organization as part of the Slalom Protogen 200 Capstone.

---

## Overview

FastForward Logistics is a mid-size LTL freight and supply chain company. This dashboard is designed for the VP of Operations to monitor business performance at a glance during daily operations and leadership reviews.

**What it shows:**
- KPI summary cards (shipments, on-time delivery, open exceptions, avg transit time)
- Regional performance table with status indicators (On Track / At Risk / Critical)
- Scrollable exceptions feed with real-time search, filter, and sort
- 7-day shipment volume bar chart
- Carrier performance snapshot

All data is mocked. The architecture is structured so a real `fetch()` call to an API can replace the mock dataset without touching any component.

---

## Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 20.x (developed on v26) |
| npm | ≥ 10.x (bundled with Node) |

No other global tools are required.

---

## Getting Started

```bash
# 1. Clone the repository
git clone <repo-url>
cd my-dashboard

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite development server with HMR |
| `npm run build` | Type-check then compile for production (`dist/`) |
| `npm run preview` | Serve the production build locally for verification |

---

## Technology Stack

| Technology | Version | Role |
|---|---|---|
| Vue 3 | 3.5.x | UI framework (Composition API + `<script setup>`) |
| Vite | 6.3.x | Build tool and dev server |
| TypeScript | 5.8.x | Static typing |
| Vuetify | 4.1.x | Component library (cards, tables, selects, chips) |
| Vue Router | 4.5.x | Client-side routing |
| MDI Icons | 7.4.x | Icon set via `@mdi/font` |
| GitHub Copilot | — | AI-assisted development throughout |

---

## Project Structure

```text
src/
├── assets/
│   └── main.css            # All custom styles and CSS custom properties
├── components/
│   ├── CarrierGrid.vue     # Carrier performance snapshot cards
│   ├── ExceptionsFeed.vue  # Scrollable exceptions feed with search/filter/sort
│   ├── KpiCard.vue         # Individual KPI stat card
│   ├── KpiGrid.vue         # KPI section wrapper (4-card grid)
│   ├── NavBar.vue          # Fixed top nav bar with theme toggle
│   ├── RegionalTable.vue   # Regional performance table
│   └── VolumeChart.vue     # 7-day shipment volume bar chart
├── data/
│   ├── metrics.json        # ⭐ Single source of truth for all mock data
│   └── index.ts            # Imports metrics.json, applies types, re-exports
├── plugins/
│   └── vuetify.ts          # Vuetify theme configuration
├── router/
│   └── index.ts            # Vue Router configuration
├── types/
│   └── index.ts            # Shared TypeScript interfaces
├── views/
│   └── DashboardView.vue   # Main dashboard layout and section orchestration
├── App.vue
└── main.ts
```

---

## Data Architecture

All mock data lives in **`src/data/metrics.json`**. This is the only file to edit when updating displayed values.

```
metrics.json          ← edit this to change any displayed value
     ↓
src/data/index.ts     ← imports JSON, applies TypeScript types, re-exports named constants
     ↓
components            ← import from index.ts only, never from metrics.json directly
```

**`metrics.json` top-level keys:**

| Key | Contents |
|---|---|
| `app` | Brand name, page title, data mode label |
| `kpi` | KPI metric values (shipments, on-time rate, exceptions, transit time) |
| `kpiMeta` | Display metadata per KPI: label, sublabel, value format |
| `kpiTooltips` | Tooltip copy shown on KPI card hover/focus |
| `thresholds` | Business rule cutoffs (e.g. on-time ≥ 90% = green) |
| `regional` | Regional performance rows |
| `exceptions` | Exception feed records |
| `volumeTrend` | 7-day daily shipment volumes |
| `carriers` | Carrier snapshot rows |

**To update a metric value** — edit `metrics.json`. No component changes required.

**To connect a real API** — replace the `import metrics from './metrics.json'` in `src/data/index.ts` with a `fetch()` call returning the same JSON shape. Types and components are unchanged.

---

## Supported Viewports

| Width | Layout |
|---|---|
| ≥ 1280px | Two-column layout (Regional + Exceptions side by side) |
| 1024px – 1279px | Stacked single-column layout |
| < 1024px | Not supported |

Mobile layouts are intentionally out of scope for this prototype.

---

## Features

- **Dark / Light theme toggle** — persisted to `localStorage`; respects OS `prefers-color-scheme` on first visit
- **Collapsible sections** — all sections collapse; the two-column row uses a side-drawer mode at ≥ 1280px
- **Exception feed** — real-time search across all fields, filter by region or priority, sort by multiple criteria; all three controls compose together
- **Auto-refresh simulation** — KPI cards pulse every 60 seconds to simulate a live data tick
- **KPI tooltips** — hover or focus a KPI card to see a definition and calculation note
- **Entrance animations** — staggered fade-in on load
- **Print / Export** — Export button triggers `window.print()` with a dedicated light-mode print stylesheet

---

## Planning Artifacts

- **`BRIEF.md`** — Product requirements, design direction, data architecture spec, and implementation guidance. Data tables in the brief are *illustrative examples* of shape and intent, not a live data source. The actual dataset is in `src/data/metrics.json`.

---

## Version History

| Tag | Description |
|---|---|
| `v201` | Project brief and planning (`BRIEF.md`) |
| `v202` | Vue 3 + Vite scaffold and routing shell |
| `v203` | Vuetify integration, component architecture, mock data |
| `v204` | Responsive layout, data centralization (`metrics.json`), UI polish |

v204 — Final dashboard implementation
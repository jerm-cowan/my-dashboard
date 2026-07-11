```md
# FastForward Logistics — Internal Operations Dashboard

---

## � Project Context

**Client:** FastForward Logistics (fictional)
**Stakeholder:** VP of Operations
**Use Case:** Internal leadership dashboard — displayed during executive meetings and used for daily ops monitoring
**Engagement Type:** Prototype / Proof of Concept
**Developer Stack:** Vue 3, Vite, TypeScript, Vue Router, and Vuetify 3.
Use Vuetify components and default patterns wherever appropriate.

### Framework Upgrade

This project originally began as a vanilla HTML/CSS/JavaScript prototype during Step 2.1 to validate the dashboard concept and establish the initial BRIEF.md structure.

During Step 2.2, the project transitions to Vue 3 using Vite, TypeScript, and Vue Router. The goal is to retain all existing dashboard requirements while moving to a component-based architecture that can support future enhancements.

All active development now lives in `src/`.

> **📌 Data in this document is illustrative.**
> Tables and sample values in this brief exist to communicate *intent and shape* — what fields exist, what realistic values look like, and what status logic applies. They are **not a data source**. No code reads this file. The live mock dataset lives exclusively in `src/data/metrics.json`, which is imported by `src/data/index.ts` and consumed by components. To change a displayed value, update `metrics.json` — not this document.

### Vue Project Setup Requirements

Create a new Vue project using the create-vue scaffolding tool with Vite.

Enable:
- TypeScript
- Vue Router

Disable:
- Pinia
- Testing
- JSX
- ESLint
- Prettier

Run all setup commands in the terminal and scaffold the project structure automatically.

> **AI Guidance:** Treat this as a real client engagement. Code should be clean, professional, and production-minded. Prioritize readability, maintainability, and realistic mock data. Every decision should feel like it was made for an actual logistics company, not a tutorial project.

---

## 📋 Summary

Build a **single-page internal operations dashboard** for FastForward Logistics. The dashboard should give the VP of Operations an at-a-glance view of the business in real time — suitable for pulling up on a large screen during a leadership meeting.

The dashboard must feel **credible and complete** — not a demo skeleton. Use realistic mock data with plausible logistics metrics. All data is static/mocked at this stage but should be structured so that a real API could replace it later.

**Primary Goals:**
- Display key operational KPIs clearly and confidently
- Surface problems (exceptions, delays) without requiring the user to dig
- Communicate regional performance across FastForward's operating zones
- Be readable at a glance on a 1080p or 1440p screen

---

## ⚙️ Tech Specification

### Stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Vuetify 3
- GitHub Copilot
- Chart.js
- vue-chartjs

### Expected Project Structure

/src
├── components/
├── views/
├── router/
├── data/
├── assets/
├── App.vue
└── main.ts

### File Structure
```
/fastforward-dashboard

├── src
│   ├── components
│   ├── views
│   ├── router
│   ├── data
│   ├── assets
│   ├── App.vue
│   └── main.ts
│
├── public
├── index.html
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Vue and TypeScript Guidelines
- Use **ES6+** syntax throughout (`const`, `let`, arrow functions, destructuring, template literals)
- Mock data lives in `src/data/`
- All mock values must be defined in **`src/data/metrics.json`** — a single JSON file that acts as the fake API response. This file is the sole source of truth for all dashboard data and must be structured so that a real `fetch()` call to an API endpoint could replace it without changing any component code.
- `src/data/index.ts` imports from `metrics.json`, applies TypeScript types, derives computed config (thresholds, KPI card metadata, app config), and re-exports everything components need. Components must never import from `metrics.json` directly.
- Prefer Composition API and <script setup>
- Create reusable Vue components where appropriate
- Use Vue Router for application routing even if the initial dashboard is primarily a single view
- Keep mock data separate from presentation logic
- Use Vuetify 3 as the primary UI framework.
- Prefer built-in Vuetify components before creating custom UI elements.
- Only create custom components when reusable business-specific functionality is required.
- Add **JSDoc comments** on all functions for clarity and Copilot context
- Structure data so it could realistically be replaced with a `fetch()` call

### Data Architecture

All mock data follows a two-layer pattern:

**Layer 1 — `src/data/metrics.json` (raw data)**
A single JSON file containing every mock value the dashboard displays. Organized into top-level keys that mirror the dashboard sections:

```json
{
  "app": { "brand": "⚡ FastForward", "title": "Operations Dashboard", "dataMode": "mock" },
  "kpi": { "totalShipmentsMTD": 4821, "onTimeDeliveryRate": 91.4, "openExceptions": 38, "avgTransitTime": 2.3, "avgTransitTimeTrend": "down" },
  "kpiMeta": {
    "totalShipmentsMTD":  { "label": "Total Shipments",  "sublabel": "Month to Date",     "format": "number"  },
    "onTimeDeliveryRate": { "label": "On-Time Delivery", "sublabel": "Target ≥ 90%",      "format": "percent" },
    "openExceptions":     { "label": "Open Exceptions",  "sublabel": "Requires Attention", "format": "count"   },
    "avgTransitTime":     { "label": "Avg Transit Time", "sublabel": "Trailing 7 Days",    "format": "days"    }
  },
  "kpiTooltips": { ... },
  "thresholds": {
    "onTimeRate":     { "success": 90, "warning": 80 },
    "openExceptions": { "danger": 30,  "warning": 15 }
  },
  "regional": [ ... ],
  "exceptions": [ ... ],
  "volumeTrend": [ ... ],
  "volumeMonthly": [ ... ],
  "kpiSnapshots": [ ... ],
  "regionalSnapshots": [ ... ],
  "carrierSnapshots": [ ... ],
  "carriers": [ ... ]
}
```

**Layer 2 — `src/data/index.ts` (typed exports)**
Imports `metrics.json`, applies TypeScript interfaces from `src/types/index.ts`, and re-exports named constants (`kpiData`, `regionalData`, `exceptionsData`, `volumeTrendData`, `carrierData`, `carrierData`, `thresholds`, `kpiMeta`, `appConfig`). Components import exclusively from this file, never from `metrics.json` directly.

Business rules that live in data (not components):
- On-time rate thresholds (90% success, 80% warning) — shared by KPI cards, Regional table, and Carrier cards
- Open exceptions thresholds (>30 danger, ≥15 warning)
- KPI card labels, sublabels, and value format type
- Application brand name, page title, and data mode indicator
- Exception filter region list (derived from `regional` array — never hardcoded separately)
- Period snapshots for KPI, regional, and carrier sections (keyed by `periodKey`)
- Exception `dateISO` field used for per-day filtering in the 7-day view

**The mock dataset must support both daily and monthly dashboard views.**

`src/data/metrics.json` should include:
- 7-day shipment volume data
- 12-month shipment volume data
- period-specific KPI values
- period-specific regional performance
- period-specific exceptions
- period-specific carrier performance

The selected chart period should act as a dashboard-level filter.

### HTML Guidelines
- Use semantic HTML5 elements (`<main>`, `<section>`, `<header>`, `<nav>`, `<article>`)
- Include ARIA labels on all interactive and data-display regions
- Dashboard should be a **single scrollable page** with a fixed top navigation bar

### CSS Guidelines
- Use **CSS custom properties** (variables) for all colors, spacing, and typography
- Prefer Vuetify layout components (v-container, v-row, v-col) for page structure. Use custom CSS only when Vuetify layout capabilities are insufficient.
- Use **Flexbox** for component-level alignment
- Mobile layout is not required but the layout should not break below 1024px
- Include a **dark professional color scheme** appropriate for an ops/logistics brand

---

## 🎨 Design Direction

### Visual Tone
Dark, data-dense, and authoritative. Think mission control meets enterprise SaaS. This is not a consumer product — it should feel like a tool built for professionals who trust data.

### Color Palette (Vuetify Theme Tokens)
- Use these colors as the application's Vuetify theme configuration.
- Prefer Vuetify theme tokens and component styling over custom CSS wherever practical.

| Variable | Purpose | Suggested Value |
|---|---|---|
| `--color-bg` | Page background | `#0f1117` |
| `--color-surface` | Card/panel background | `#1a1d27` |
| `--color-border` | Subtle borders | `#2e3244` |
| `--color-accent` | Brand accent / highlights | `#3b82f6` |
| `--color-success` | On-time / positive | `#22c55e` |
| `--color-warning` | At-risk / delayed | `#f59e0b` |
| `--color-danger` | Exception / critical | `#ef4444` |
| `--color-text-primary` | Main text | `#f1f5f9` |
| `--color-text-muted` | Labels / secondary text | `#94a3b8` |

### Padding and alignment
- Use a consistent **8px base spacing unit** (e.g., 8px, 16px, 24px, 32px)
- Like components should align to a **12-column grid** with gutters
- Use consistent **border-radius** for cards and buttons (e.g., 4px or 6px)
- Maintain consistent **padding** inside cards and buttons (e.g., 8px, 16px, 24px) and ensure nested elements align.
- Heading padding and nested content padding should match so items visually align across sections. Especially left and right padding.
- Atomic elements like carets and icons should match and have similar padding inside their containers so they align with other icons. (ex. the sort caret in the exceptions feed should align with the search magnifying glass icon and the filter dropdown icon and with the section heading caret icon.)

### Typography
- Font: **Inter** via Google Fonts
- KPI numbers: large, bold, high contrast
- Labels: uppercase, tracked, muted
- Body/table text: regular weight, readable at small sizes

### Layout Sections

#### 1. 🔷 Top Navigation Bar (fixed)
- FastForward Logistics logo (text-based wordmark is fine)
- Dashboard title: *"Operations Dashboard"*
- Live timestamp (updates every minute via JS)
- Status pill: *"Live Data"* or *"Mock Data"* indicator
- Left align the logo and title to the dashboard content area, and right align the timestamp and status pill (not browser width)

#### 2. 📊 KPI Summary Row
Four stat cards displayed in a horizontal row. Values below are representative examples — actual mock data is in `src/data/metrics.json`.

| KPI | Mock Value | Status Logic |
|---|---|---|
| Total Shipments (MTD) | 4,821 | Neutral |
| On-Time Delivery Rate | 88.2% | Green if ≥90%, Yellow if 80–89%, Red if <80% |
| Open Exceptions | 41 | Red if >30, Yellow if 15–30, Green if <15 |
| Avg Transit Time | 2.3 days | Neutral with trend indicator |

When a Shipment Volume bar is selected the KPI cards update to reflect the snapshot for that period. A period context chip appears inline in the section heading. The **Open Exceptions** card label changes to **Exceptions** when a historical month (outside the current calendar month) is selected.

#### 3. 📈 Shipment Volume

This section sits immediately below the KPI row and acts as the **global period filter** for the entire dashboard. Selecting a bar updates every section below it.

**Chart:** Chart.js bar chart (via vue-chartjs). Only the modules required for a bar chart are registered.

**Section heading:** `SHIPMENT VOLUME`. The section title shows a closable period chip when a bar is selected (e.g. `Mon, Jul 8 ×`). Clicking × clears the selection and restores the full dashboard view.

**Time range dropdown:** A Vuetify `v-select` below the section header (styled consistently with the Exceptions feed controls) lets the user switch between:
- `7-Day Trend` — daily bars for the trailing 7 days
- `12-Month Trend` — monthly bars for the trailing 12 months

Switching view modes clears any active selection.

**Bar interaction:**
- Click a bar — selects that period; bar fills full blue, others dim.
- Click the selected bar again — deselects (toggle).
- Click empty canvas space — clears selection.
- Hover shows a tooltip with the exact shipment count.

**Period propagation:** The selected period is passed as a prop from `DashboardView` to every section component. Each section shows an inline period chip in its section heading and updates its data accordingly.

| Section | 7-Day bar | 12-Month bar |
|---|---|---|
| KPI cards | Snapshot values for that day | Snapshot values for that month |
| Regional table | 5-region snapshot for that day | 5-region snapshot for that month |
| Exceptions feed | Filters to individual records for that day | Shows aggregate count; scrollable records available for current month only |
| Carrier cards | 4-carrier snapshot for that day | 4-carrier snapshot for that month |

#### 4. 🗺️ Regional Performance Table
A styled HTML table showing performance by region. Values below are representative examples — actual mock data is in `src/data/metrics.json`.

| Region | Shipments | On-Time % | Exceptions | Status |
|---|---|---|---|---|
| Northeast | 1,204 | 94.2% | 6 | 🟢 On Track |
| Southeast | 987 | 74.1% | 14 | 🔴 Critical |
| Midwest | 1,103 | 92.1% | 7 | 🟢 On Track |
| Southwest | 743 | 85.3% | 9 | 🟡 At Risk |
| West Coast | 784 | 93.8% | 5 | 🟢 On Track |

**Regional status logic** (mirrors the on-time rate thresholds used by KPI cards):
- 🟢 **On Track** — on-time rate ≥ 90%
- 🟡 **At Risk** — on-time rate 80–89%; elevated exceptions; needs monitoring
- 🔴 **Critical** — on-time rate < 80%; high exception volume; requires immediate ops intervention

The exception count and on-time rate for each region must be internally consistent: a Critical region should have the highest exception counts, directly explaining the depressed on-time rate.

When a Shipment Volume bar is selected the table updates to show the regional snapshot for that period. A period chip appears inline in the section heading.


#### 5. ⚠️ Open / Historical Exceptions Feed
A scrollable list/feed of active exceptions. Each item should show:
- Exception ID (e.g. `EXC-00412`)
- Shipment ID
- Issue type (e.g. *Carrier Delay*, *Address Error*, *Customs Hold*, *Damaged Goods*)
- Affected region
- Time open (e.g. *"14 hrs"*)
- Priority badge: `HIGH` / `MEDIUM` / `LOW`
- `dateISO` — ISO date string indicating when the exception was first logged (e.g. `"2026-07-07"`); used to filter the feed when a 7-day bar is selected

**Section heading behavior:**
- No period selected → **Open Exceptions** + live count badge (e.g. `41`)
- Current month or 7-day bar selected → **Open Exceptions** + updated count + period chip
- Historical month selected → **Exceptions** + period chip

**Historical 12-month view:** Individual scrollable records are available only for the current calendar month and the 7-day window. For all other months the feed shows an aggregate summary sourced from `kpiSnapshots`:
> *"XX exceptions were logged in MM YYYY. Individual records are available for the current month and 7-day window."*

Open Exceptions Feed - Add a sort functionality
- Match the All Exceptions dropdown format and give label "Sort by: Priority & Time Open" as the default sort option
    - This will sort by Priority (High → Low) and Time Open (Longest → Shortest) 
- Additional Sort by options: exception ID (EXC-#####), Shipment ID (SHP-#####), region, or time open (descending).
- Any instance of a label "Longest → Shortest" should be labeled as "Descending" instead, and "Shortest → Longest" should be labeled as "Ascending".

Open Exceptions Feed - Add a search bar
- Filter the exceptions feed by any data point or text string. The search should be case-insensitive and update the feed in real time as the user types.
- search bar should have a placeholder text: "Search by" and a magnifying glass icon on the left side of the input field. The search bar should be styled to match the overall dashboard theme and should be positioned above the exceptions feed.

Open Exceptions Feed - Filter, sort, and search behavior and location:
- Search bar, filter drop down, and sort dropddown should have consistent styling, container height.
- These should all work together seamlessly. For example, if a user has filtered by region and then searches for a specific exception ID, the feed should only show results that match both the filter and the search query.
- All components should be accessible via keyboard navigation and screen readers. Use appropriate ARIA attributes and roles to ensure that the feed is fully accessible.
- All interface components should be below the heading of the section and above the feed itself in this order: search bar, filter dropdown, sort dropdown.
- Adjust width of the dropdowns to accommodate the longest option text without truncation or wrapping. Ensure that the dropdowns are aligned with each other and with the search bar.

#### 6. 🚚 Carrier Performance Snapshot
A small summary panel showing top 4 carriers. Values below are representative examples — actual mock data is in `src/data/metrics.json`.

| Carrier | Shipments | On-Time % | Trend |
|---|---|---|---|
| FedEx Freight | 1,240 | 93.5% | ↑ |
| XPO Logistics | 1,018 | 89.2% | → |
| Old Dominion | 876 | 95.1% | ↑ |
| Estes Express | 654 | 84.7% | ↓ |

When a Shipment Volume bar is selected the carrier cards update to show the per-carrier snapshot for that period. A period chip appears inline in the section heading.

---

## ✨ Nice-to-Haves

These are stretch goals — implement only after core sections are complete and stable.

- **Auto-refresh simulation** — mock a data refresh every 60 seconds with a subtle flash/pulse animation on KPI cards
- **Exception filter** — a `<select>` dropdown to filter the exceptions feed by region or priority
- **Collapsible sections** — allow each dashboard section to be collapsed/expanded via a toggle button. Icons should rotate 90 degrees with state changes. (down is expanded, up is collapsed for full width sections.)
- **Expandable/collapsible behavior on sections with 2 column layout in a row**:
    - The expand/collapse caret should point to the left on the left column section and point right on right column section.
    - Expanding collapse the section but to the left for the left column and to the right for the right column section, filling the height to match the other column section. The expanded section should have a subtle shadow to indicate it is above the other section.
    - collapsed sections should have the caret pointing back to the inside and the label should rotate 90 degrees to be vertical and read from bottom to top. The label should be positioned centered like before and the padding remain the same. It is simply rotating 90 degrees.
    - The caret should be a be a positioned in centerthe label to appear as a side drawer style toggle and appear above the label. Ensure the posisition relative to the corner of the section and the label is consistent for both left and right column sections, and with same padding and spacing. For example, if the left column is expanded and the right column collapsed, the carets should align and have consistent spacing in their sections.
    - The remaining column should expand to fill the remaining width of the row and maintain the same height as the expanded section. The expanded section should have a subtle shadow to indicate it is above the other section.
- **Keyboard navigation** — full tab-through support for the exceptions feed and table rows
- **Print / Export view** — a `window.print()` triggered button that applies a light-mode print stylesheet
- **Tooltip on hover** — hovering a KPI card shows a small tooltip with a definition or calculation note
- **Subtle entrance animations** — cards and rows animate in on load using CSS `@keyframes` with staggered delays
- **Dark/light mode toggle** — a pill-style toggle button in the top navigation bar that switches between dark and light themes; preference should be persisted in `localStorage` and should respect the user's `prefers-color-scheme` system setting as the initial default; all color transitions should animate smoothly via CSS custom properties

---

## 🤖 Copilot Prompting Notes

> These notes are instructions for how Claude Sonnet 4.6 should approach code generation in this project.

- **Always write complete, working code** — no placeholder comments like `// add logic here`
- Use Vue-first solutions before suggesting external libraries
- Use Vuetify 3 components by default whenever they satisfy a requirement.
- Prefer Vuetify layouts, navigation components, cards, tables, dialogs, buttons, forms, and icons before building custom alternatives.
- Preserve the product requirements defined in this brief while leveraging Vuetify conventions.


- Respect the Vue project structure — data in src/data, components in src/components, views in src/views, assets in src/assets.
- **Be opinionated about quality** — if there's a more semantic or accessible way to write something, use it
- **Mock data should feel real** — use realistic IDs, plausible numbers, and logistics-appropriate terminology
- **Comment intentionally** — JSDoc on functions, inline comments only where logic is non-obvious

---


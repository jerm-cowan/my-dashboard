```md
# FastForward Logistics — Internal Operations Dashboard
## Copilot Brief for Claude Sonnet 4.6

---

## 🧭 Project Context

**Client:** FastForward Logistics (fictional)
**Stakeholder:** VP of Operations
**Use Case:** Internal leadership dashboard — displayed during executive meetings and used for daily ops monitoring
**Engagement Type:** Prototype / Proof of Concept
**Developer Stack:** Vue 3, Vite, TypeScript, and Vue Router. No component libraries at this stage (Vuetify and other libraries will be evaluated during future iterations).

### Framework Upgrade

This project originally began as a vanilla HTML/CSS/JavaScript prototype during Step 2.1 to validate the dashboard concept and establish the initial BRIEF.md structure.

During Step 2.2, the project transitions to Vue 3 using Vite, TypeScript, and Vue Router. The goal is to retain all existing dashboard requirements while moving to a component-based architecture that can support future enhancements.

**Step 2.2 is complete.** The legacy vanilla files (`app.js`, `data.js`, `styles.css`) remain in the repository root as a historical reference for the v201 tag. All active development now lives in `src/`.

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
- All mock data lives in `data.js` and is imported via ES module `type="module"`
- Use TypeScript throughout the application
- Prefer Composition API and <script setup>
- Create reusable Vue components where appropriate
- Use Vue Router for application routing even if the initial dashboard is primarily a single view
- Keep mock data separate from presentation logic
- Structure components so future Vuetify migration is possible
- Add **JSDoc comments** on all functions for clarity and Copilot context
- Structure data so it could realistically be replaced with a `fetch()` call

### HTML Guidelines
- Use semantic HTML5 elements (`<main>`, `<section>`, `<header>`, `<nav>`, `<article>`)
- Include ARIA labels on all interactive and data-display regions
- Dashboard should be a **single scrollable page** with a fixed top navigation bar

### CSS Guidelines
- Use **CSS custom properties** (variables) for all colors, spacing, and typography
- Use **CSS Grid** for the overall dashboard layout
- Use **Flexbox** for component-level alignment
- Mobile layout is not required but the layout should not break below 1024px
- Include a **dark professional color scheme** appropriate for an ops/logistics brand

---

## 🎨 Design Direction

### Visual Tone
Dark, data-dense, and authoritative. Think mission control meets enterprise SaaS. This is not a consumer product — it should feel like a tool built for professionals who trust data.

### Color Palette (CSS Variables to Define)
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
Four stat cards displayed in a horizontal row:

| KPI | Mock Value | Status Logic |
|---|---|---|
| Total Shipments (MTD) | 4,821 | Neutral |
| On-Time Delivery Rate | 91.4% | Green if ≥90%, Yellow if 80–89%, Red if <80% |
| Open Exceptions | 38 | Red if >30, Yellow if 15–30, Green if <15 |
| Avg Transit Time | 2.3 days | Neutral with trend indicator |

#### 3. 🗺️ Regional Performance Table
A styled HTML table showing performance by region:

| Region | Shipments | On-Time % | Exceptions | Status |
|---|---|---|---|---|
| Northeast | 1,204 | 94.2% | 6 | 🟢 On Track |
| Southeast | 987 | 88.7% | 11 | 🟡 At Risk |
| Midwest | 1,103 | 92.1% | 7 | 🟢 On Track |
| Southwest | 743 | 85.3% | 9 | 🟡 At Risk |
| West Coast | 784 | 93.8% | 5 | 🟢 On Track |

Expandable/collapsible behavior on sections with 2 columnn layout in a row:
- The expand/collapse caret should point to the left on the left column section and point right on right column section.
- Expanding collapse the section but to the left for the left column and to the right for the right column section, filling the height to match the other column section. The expanded section should have a subtle shadow to indicate it is above the other section.
- collapsed sections shoul dhave the caret pointing back to the inside and the label should rotate 90 degrees to be vertical and read from bottom to top. The label should be positioned centered like before and the padding remain the same. It is simply rotating 90 degrees.
- The caret should be a be a positioned in centered wiht the label to appear as a side drawer style toggle.
- The remaining column should expand to fill the remaining width of the row and maintain the same height as the expanded section. The expanded section should have a subtle shadow to indicate it is above the other section.

#### 4. ⚠️ Open Exceptions Feed
A scrollable list/feed of active exceptions. Each item should show:
- Exception ID (e.g. `EXC-00412`)
- Shipment ID
- Issue type (e.g. *Carrier Delay*, *Address Error*, *Customs Hold*, *Damaged Goods*)
- Affected region
- Time open (e.g. *"14 hrs"*)
- Priority badge: `HIGH` / `MEDIUM` / `LOW`

Add a sort functionality
- Match the All Exceptions dropdown format and give label "Sort by: Priority & Time Open" as the default sort option
    - This will sort by Priority (High → Low) and Time Open (Longest → Shortest) 
- Additional Sort by options: exception ID (EXC-#####), Shipment ID (SHP-#####), region, or time open (descending).
- Any instance of a lable "Longest → Shortest" should be labeled as "Descending" instead, and "Shortest → Longest" should be labeled as "Ascending".

Add a search bar to filter the exceptions feed by any data point or text string. The search should be case-insensitive and update the feed in real time as the user types.
- search bar should have a placeholder text: "Search by" and a magnifying glass icon on the left side of the input field. The search bar should be styled to match the overall dashboard theme and should be positioned above the exceptions feed.

Filter, sort, and search behavior and location:
- Search bar, filter drop down, and sort dropddown should have consistent styling, container height.
- These should all work together seamlessly. For example, if a user has filtered by region and then searches for a specific exception ID, the feed should only show results that match both the filter and the search query.
- All components should be accessible via keyboard navigation and screen readers. Use appropriate ARIA attributes and roles to ensure that the feed is fully accessible.
- All interface components should be below the heading of the section and above the feed itself in this order: search bar, filter dropdown, sort dropdown.
- Adjust width of the dropdowns to accommodate the longest option text without truncation or wrapping. Ensure that the dropdowns are aligned with each other and with the search bar.



#### 5. 📈 Shipment Volume Trend (7-Day)
A **pure CSS + JS bar chart** (no chart library) showing daily shipment volume for the past 7 days. Bars should be rendered dynamically from data. Include day labels and volume numbers above each bar.


#### 6. 🚚 Carrier Performance Snapshot
A small summary panel showing top 4 carriers:

| Carrier | Shipments | On-Time % | Trend |
|---|---|---|---|
| FedEx Freight | 1,240 | 93.5% | ↑ |
| XPO Logistics | 1,018 | 89.2% | → |
| Old Dominion | 876 | 95.1% | ↑ |
| Estes Express | 654 | 84.7% | ↓ |

---

## ✨ Nice-to-Haves

These are stretch goals — implement only after core sections are complete and stable.

- **Auto-refresh simulation** — mock a data refresh every 60 seconds with a subtle flash/pulse animation on KPI cards
- **Exception filter** — a `<select>` dropdown to filter the exceptions feed by region or priority
- **Collapsible sections** — allow each dashboard section to be collapsed/expanded via a toggle button
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
- Avoid component libraries during Step 2.2
- Maintain compatibility with a future Vuetify migration during Step 2.3
- **Respect the file separation** — data stays in `data.js`, styles in `styles.css`, logic in `app.js`
- **Be opinionated about quality** — if there's a more semantic or accessible way to write something, use it
- **Mock data should feel real** — use realistic IDs, plausible numbers, and logistics-appropriate terminology
- **Comment intentionally** — JSDoc on functions, inline comments only where logic is non-obvious

---

*Brief version 1.1 — FastForward Logistics Prototype Engagement*
*Stack: HTML / CSS / JS — No frameworks — Claude Sonnet 4.6 / GitHub Copilot*
```

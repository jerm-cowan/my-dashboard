/**
 * @fileoverview FastForward Logistics Operations Dashboard — application logic.
 * Imports mock data from data.js, renders all dashboard sections, and wires up
 * all interactive features. Structured so each render function can be replaced
 * with a fetch()-based data loader without changing the rendering logic.
 *
 * Features implemented:
 *  - KPI cards with status thresholds and hover tooltips
 *  - Regional performance table
 *  - Open exceptions feed with region/priority filter
 *  - Pure CSS + JS 7-day bar chart
 *  - Carrier performance cards
 *  - Live timestamp (updates every minute)
 *  - Dark/light theme toggle with localStorage + prefers-color-scheme
 *  - Collapsible sections
 *  - Auto-refresh simulation (60-second KPI pulse)
 *  - Entrance animations
 *  - Print/export via window.print()
 */

import {
  kpiData,
  kpiTooltips,
  regionalData,
  exceptionsData,
  volumeTrendData,
  carrierData,
} from './data.js';

/* ============================================================
   Timestamp
   ============================================================ */

/**
 * Formats the current date and time for display in the navbar.
 * @returns {string} Human-readable date/time string.
 */
function formatTimestamp() {
  const now = new Date();
  const datePart = now.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const timePart = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return `${datePart} · ${timePart}`;
}

/**
 * Updates the live timestamp element in the navbar.
 * Called on init and then every 60 seconds.
 */
function updateTimestamp() {
  const el = document.getElementById('live-timestamp');
  if (!el) return;
  el.textContent = formatTimestamp();
  el.dateTime = new Date().toISOString();
}

/* ============================================================
   Theme Toggle
   ============================================================ */

/**
 * Reads the stored theme preference or falls back to the OS setting.
 * @returns {'dark' | 'light'}
 */
function resolveInitialTheme() {
  const stored = localStorage.getItem('ff-theme');
  if (stored === 'dark' || stored === 'light') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Syncs the theme toggle button icon to the currently active theme.
 * @param {'dark' | 'light'} theme
 */
function syncThemeButton(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  const icon = btn.querySelector('.theme-toggle__icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  btn.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
  );
}

/**
 * Applies a theme by setting the data-theme attribute on <html>.
 * Persists the preference in localStorage.
 * @param {'dark' | 'light'} theme
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ff-theme', theme);
  syncThemeButton(theme);
}

/**
 * Toggles between dark and light themes.
 */
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme');
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Initializes the theme on page load.
 */
function initTheme() {
  applyTheme(resolveInitialTheme());
  const btn = document.getElementById('theme-toggle');
  if (btn) btn.addEventListener('click', toggleTheme);
}

/* ============================================================
   KPI Status Helpers
   ============================================================ */

/**
 * Determines the status class for a KPI based on business threshold rules.
 * @param {string} key - KPI key ('onTimeDeliveryRate' | 'openExceptions' | other)
 * @param {number} value - Current KPI value
 * @returns {'success' | 'warning' | 'danger' | 'neutral'}
 */
function getKpiStatus(key, value) {
  if (key === 'onTimeDeliveryRate') {
    if (value >= 90) return 'success';
    if (value >= 80) return 'warning';
    return 'danger';
  }
  if (key === 'openExceptions') {
    if (value > 30) return 'danger';
    if (value >= 15) return 'warning';
    return 'success';
  }
  return 'neutral';
}

/**
 * Formats a raw KPI value into its display string.
 * @param {string} key
 * @param {number} value
 * @returns {string}
 */
function formatKpiValue(key, value) {
  if (key === 'totalShipmentsMTD') return value.toLocaleString();
  if (key === 'onTimeDeliveryRate') return `${value}%`;
  if (key === 'avgTransitTime') return `${value} days`;
  return String(value);
}

/**
 * Builds the trend arrow HTML for a KPI card.
 * @param {'up' | 'down' | 'flat'} trend
 * @returns {string} HTML string
 */
function trendArrowHtml(trend) {
  const icons  = { up: '↑', down: '↓', flat: '→' };
  const labels = { up: 'improving', down: 'declining', flat: 'stable' };
  const cls    = { up: 'trend--up', down: 'trend--down', flat: 'trend--flat' };
  return `<span class="kpi-trend ${cls[trend] ?? 'trend--flat'}" aria-label="Trend: ${labels[trend] ?? trend}">${icons[trend] ?? '→'}</span>`;
}

/* ============================================================
   KPI Cards — Render
   ============================================================ */

/**
 * Renders the four KPI summary cards into #kpi-grid.
 * Each card displays a metric, its status, and an accessible ARIA label.
 */
function renderKpiCards() {
  const grid = document.getElementById('kpi-grid');
  if (!grid) return;

  /** @type {Array<{key: string, label: string, sublabel: string, extra: string}>} */
  const cardDefs = [
    {
      key: 'totalShipmentsMTD',
      label: 'Total Shipments',
      sublabel: 'Month to Date',
      extra: '',
    },
    {
      key: 'onTimeDeliveryRate',
      label: 'On-Time Delivery',
      sublabel: 'Target ≥ 90%',
      extra: '',
    },
    {
      key: 'openExceptions',
      label: 'Open Exceptions',
      sublabel: 'Requires Attention',
      extra: '',
    },
    {
      key: 'avgTransitTime',
      label: 'Avg Transit Time',
      sublabel: 'Trailing 7 Days',
      extra: trendArrowHtml(kpiData.avgTransitTimeTrend),
    },
  ];

  grid.innerHTML = cardDefs.map((def, i) => {
    const value     = kpiData[def.key];
    const status    = getKpiStatus(def.key, value);
    const displayed = formatKpiValue(def.key, value);
    const dotHtml   = status !== 'neutral'
      ? `<span class="kpi-card__dot status-dot--${status}" aria-hidden="true"></span>`
      : '';

    return `
      <article
        class="kpi-card kpi-card--${status} animate-in"
        style="--delay: ${i * 0.07}s"
        role="listitem"
        tabindex="0"
        data-kpi="${def.key}"
        aria-label="${def.label}: ${displayed}"
      >
        <span class="kpi-card__label">${def.label}</span>
        <div class="kpi-card__value-row">
          <span class="kpi-card__value">${displayed}</span>
          ${dotHtml}
          ${def.extra}
        </div>
        <span class="kpi-card__sublabel">${def.sublabel}</span>
        <div class="kpi-card__accent-bar" aria-hidden="true"></div>
      </article>
    `.trim();
  }).join('');

  // Attach tooltip listeners after DOM insertion
  grid.querySelectorAll('.kpi-card').forEach(card => {
    card.addEventListener('mouseenter', () => showKpiTooltip(card));
    card.addEventListener('mouseleave', hideKpiTooltip);
    card.addEventListener('focus',      () => showKpiTooltip(card));
    card.addEventListener('blur',       hideKpiTooltip);
  });
}

/* ============================================================
   Tooltip
   ============================================================ */

/**
 * Positions and shows the shared KPI tooltip near a card element.
 * @param {HTMLElement} cardEl - The hovered/focused KPI card
 */
function showKpiTooltip(cardEl) {
  const tooltip = document.getElementById('kpi-tooltip');
  const key     = cardEl.dataset.kpi;
  const text    = kpiTooltips[key];
  if (!tooltip || !text) return;

  tooltip.textContent = text;
  tooltip.removeAttribute('aria-hidden');
  tooltip.classList.add('tooltip--visible');

  // Position below the card, horizontally centered
  const cardRect = cardEl.getBoundingClientRect();
  tooltip.style.top  = `${cardRect.bottom + window.scrollY + 10}px`;
  tooltip.style.left = '0px'; // reset before measuring

  // Re-measure after text update
  requestAnimationFrame(() => {
    const ttWidth = tooltip.offsetWidth;
    const centered = cardRect.left + window.scrollX + cardRect.width / 2 - ttWidth / 2;
    const clamped  = Math.max(8, Math.min(centered, window.innerWidth - ttWidth - 8));
    tooltip.style.left = `${clamped}px`;
  });
}

/**
 * Hides the shared KPI tooltip.
 */
function hideKpiTooltip() {
  const tooltip = document.getElementById('kpi-tooltip');
  if (!tooltip) return;
  tooltip.classList.remove('tooltip--visible');
  tooltip.setAttribute('aria-hidden', 'true');
}

/* ============================================================
   Regional Performance Table — Render
   ============================================================ */

/**
 * Returns a status badge HTML string for a regional row.
 * @param {'on-track' | 'at-risk' | 'critical'} status
 * @returns {string}
 */
function regionalStatusBadgeHtml(status) {
  const config = {
    'on-track': { cls: 'badge--success', label: 'On Track', icon: '●' },
    'at-risk':  { cls: 'badge--warning', label: 'At Risk',  icon: '●' },
    'critical': { cls: 'badge--danger',  label: 'Critical', icon: '●' },
  };
  const { cls, label, icon } = config[status] ?? config['on-track'];
  return `<span class="status-badge ${cls}"><span aria-hidden="true">${icon}</span> ${label}</span>`;
}

/**
 * Renders the regional performance table body into #regional-tbody.
 */
function renderRegionalTable() {
  const tbody = document.getElementById('regional-tbody');
  if (!tbody) return;

  tbody.innerHTML = regionalData.map((row, i) => {
    const rateStatus = getKpiStatus('onTimeDeliveryRate', row.onTimeRate);
    const excClass   = row.exceptions > 10 ? 'exception-count--warning' : 'exception-count--normal';
    return `
      <tr
        class="animate-in"
        style="--delay: ${0.08 + i * 0.05}s"
        tabindex="0"
        aria-label="${row.region}: ${row.shipments.toLocaleString()} shipments, ${row.onTimeRate}% on-time, ${row.exceptions} exceptions"
      >
        <td class="table-cell--region">${row.region}</td>
        <td class="table-cell--number">${row.shipments.toLocaleString()}</td>
        <td class="table-cell--number">
          <span class="rate-value rate--${rateStatus}">${row.onTimeRate}%</span>
        </td>
        <td class="table-cell--number">
          <span class="exception-count ${excClass}">${row.exceptions}</span>
        </td>
        <td>${regionalStatusBadgeHtml(row.status)}</td>
      </tr>
    `.trim();
  }).join('');
}

/* ============================================================
   Exceptions Feed — State & Render
   ============================================================ */

/**
 * Shared state for the exceptions feed controls.
 * Mutated by filter, sort, and search event handlers; renderExceptionsFeed()
 * always reads from this object so all three controls compose correctly.
 * @type {{ filter: string, sort: string, search: string }}
 */
const exceptionsState = {
  filter: 'all',
  sort:   'priority-time',
  search: '',
};

/** Priority sort order map for the 'priority-time' sort. */
const PRIORITY_ORDER = { HIGH: 0, MEDIUM: 1, LOW: 2 };

/**
 * Applies current filter, search query, and sort order from `exceptionsState`
 * to the exceptions dataset, then renders the result into #exceptions-feed.
 * Also updates the live exception count badge in the section title.
 */
function renderExceptionsFeed() {
  const feed = document.getElementById('exceptions-feed');
  if (!feed) return;

  const { filter, sort, search } = exceptionsState;
  let data = [...exceptionsData];

  // 1. Apply dropdown filter (region or priority)
  if (filter !== 'all') {
    if (filter.startsWith('priority-')) {
      const priority = filter.slice('priority-'.length);
      data = data.filter(e => e.priority === priority);
    } else if (filter.startsWith('region-')) {
      const region = filter.slice('region-'.length);
      data = data.filter(e => e.region === region);
    }
  }

  // 2. Apply search query against ID, shipment ID, and issue type
  const query = search.trim().toLowerCase();
  if (query) {
    data = data.filter(e =>
      e.id.toLowerCase().includes(query) ||
      e.shipmentId.toLowerCase().includes(query) ||
      e.type.toLowerCase().includes(query)
    );
  }

  // 3. Apply sort
  switch (sort) {
    case 'priority-time':
      // Primary: priority HIGH→MEDIUM→LOW. Secondary: time open longest first.
      data.sort((a, b) => {
        const pd = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
        return pd !== 0 ? pd : b.hoursOpen - a.hoursOpen;
      });
      break;
    case 'id':
      data.sort((a, b) => a.id.localeCompare(b.id));
      break;
    case 'shipment-id':
      data.sort((a, b) => a.shipmentId.localeCompare(b.shipmentId));
      break;
    case 'region':
      data.sort((a, b) => a.region.localeCompare(b.region));
      break;
    case 'time':
      // Descending: longest open first
      data.sort((a, b) => b.hoursOpen - a.hoursOpen);
      break;
  }

  // Update count badge
  const countEl = document.getElementById('exceptions-count');
  if (countEl) {
    countEl.textContent = data.length;
    countEl.setAttribute('aria-label', `${data.length} exceptions`);
  }

  if (data.length === 0) {
    feed.innerHTML = '<p class="exceptions-empty">No exceptions match the current filter or search.</p>';
    return;
  }

  feed.innerHTML = data.map((exc, i) => {
    const priorityCls = { HIGH: 'priority--high', MEDIUM: 'priority--medium', LOW: 'priority--low' }[exc.priority] ?? 'priority--low';
    const itemCls     = exc.priority.toLowerCase();
    return `
      <article
        class="exception-item exception-item--${itemCls} animate-in"
        style="--delay: ${i * 0.03}s"
        tabindex="0"
        aria-label="${exc.id}, ${exc.type}, ${exc.priority} priority, ${exc.region}, open ${exc.hoursOpen} hours"
      >
        <div class="exception-item__header">
          <div class="exception-item__ids">
            <span class="exception-item__id">${exc.id}</span>
            <span class="exception-item__shipment">${exc.shipmentId}</span>
          </div>
          <span class="priority-badge ${priorityCls}">${exc.priority}</span>
        </div>
        <div class="exception-item__body">
          <span class="exception-item__type">${exc.type}</span>
          <span class="exception-item__region">${exc.region}</span>
          <span class="exception-item__time">${exc.hoursOpen} hrs open</span>
        </div>
      </article>
    `.trim();
  }).join('');
}

/* ============================================================
   Volume Trend Bar Chart — Render
   ============================================================ */

/** Maximum bar height in pixels — scales relative to the peak volume day. */
const MAX_BAR_PX = 160;

/**
 * Renders the 7-day shipment volume bar chart into #volume-chart.
 * Bars are pure CSS/JS — no chart library used.
 * Heights are computed proportionally from the maximum value in the dataset.
 */
function renderVolumeChart() {
  const chart = document.getElementById('volume-chart');
  if (!chart) return;

  const maxVolume  = Math.max(...volumeTrendData.map(d => d.volume));
  const lastEntry  = volumeTrendData[volumeTrendData.length - 1];

  chart.innerHTML = volumeTrendData.map((d, i) => {
    const barHeight = Math.max(4, Math.round((d.volume / maxVolume) * MAX_BAR_PX));
    const isToday   = d === lastEntry;

    return `
      <div
        class="bar-chart__group${isToday ? ' bar-chart__group--today' : ''} animate-in"
        style="--delay: ${0.12 + i * 0.06}s"
      >
        <span class="bar-chart__value" aria-hidden="true">${d.volume.toLocaleString()}</span>
        <div
          class="bar-chart__bar"
          style="height: ${barHeight}px; --bar-delay: ${0.2 + i * 0.06}s"
          aria-label="${d.day} ${d.date}: ${d.volume.toLocaleString()} shipments"
        ></div>
        <div class="bar-chart__day-label" aria-hidden="true">
          <span class="bar-chart__day">${d.day}</span>
          <span class="bar-chart__date">${d.date}</span>
        </div>
      </div>
    `.trim();
  }).join('');
}

/* ============================================================
   Carrier Performance Cards — Render
   ============================================================ */

/**
 * Returns trend HTML for a carrier card.
 * @param {'up' | 'flat' | 'down'} trend
 * @returns {string}
 */
function carrierTrendHtml(trend) {
  const icons  = { up: '↑', flat: '→', down: '↓' };
  const labels = { up: 'improving', flat: 'stable', down: 'declining' };
  const cls    = { up: 'trend--up', flat: 'trend--flat', down: 'trend--down' };
  return `<span class="carrier-trend ${cls[trend] ?? 'trend--flat'}" aria-label="Trend: ${labels[trend] ?? trend}">${icons[trend] ?? '→'}</span>`;
}

/**
 * Renders carrier performance cards into #carrier-grid.
 */
function renderCarrierCards() {
  const grid = document.getElementById('carrier-grid');
  if (!grid) return;

  grid.innerHTML = carrierData.map((c, i) => {
    const rateStatus = getKpiStatus('onTimeDeliveryRate', c.onTimeRate);
    return `
      <article
        class="carrier-card animate-in"
        style="--delay: ${0.08 + i * 0.07}s"
        role="listitem"
        aria-label="${c.carrier}: ${c.shipments.toLocaleString()} shipments, ${c.onTimeRate}% on-time, trend ${c.trend}"
      >
        <div class="carrier-card__name">${c.carrier}</div>
        <div class="carrier-card__stats">
          <div class="carrier-card__stat">
            <span class="carrier-stat-label">Shipments</span>
            <span class="carrier-stat-value">${c.shipments.toLocaleString()}</span>
          </div>
          <div class="carrier-card__stat">
            <span class="carrier-stat-label">On-Time</span>
            <span class="carrier-stat-value carrier-stat-value--${rateStatus}">${c.onTimeRate}%</span>
          </div>
          ${carrierTrendHtml(c.trend)}
        </div>
      </article>
    `.trim();
  }).join('');
}

/* ============================================================
   Section Collapse / Expand
   ============================================================ */

/**
 * Wires up all .section-toggle buttons to collapse/expand their target sections.
 * Uses the data-section attribute to find the controlled content element.
 */
function initSectionToggles() {
  document.querySelectorAll('.section-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.section;
      const content  = document.getElementById(targetId);
      if (!content) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      btn.title = isExpanded ? 'Expand section' : 'Collapse section';
      content.classList.toggle('section-content--collapsed', isExpanded);
    });
  });
}

/* ============================================================
   Exceptions Controls — Filter, Sort, Search
   ============================================================ */

/**
 * Wires up the filter dropdown, sort dropdown, and search input for the
 * exceptions feed. All three update `exceptionsState` and re-render.
 */
function initExceptionsControls() {
  const filterSelect = document.getElementById('exception-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', e => {
      exceptionsState.filter = e.target.value;
      renderExceptionsFeed();
    });
  }

  const sortSelect = document.getElementById('exception-sort');
  if (sortSelect) {
    sortSelect.addEventListener('change', e => {
      exceptionsState.sort = e.target.value;
      renderExceptionsFeed();
    });
  }

  const searchInput = document.getElementById('exceptions-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      exceptionsState.search = e.target.value;
      renderExceptionsFeed();
    });

    // Clear search state when the browser clears the search input via the × button
    searchInput.addEventListener('search', e => {
      exceptionsState.search = e.target.value;
      renderExceptionsFeed();
    });
  }
}

/* ============================================================
   Auto-Refresh Simulation
   ============================================================ */

/**
 * Simulates a live data refresh every 60 seconds.
 * Triggers a CSS pulse animation on all KPI cards to signal the update.
 */
function initAutoRefresh() {
  setInterval(() => {
    document.querySelectorAll('.kpi-card').forEach(card => {
      // Remove and re-add class to re-trigger the animation
      card.classList.remove('kpi-card--refreshing');
      // Force reflow so the animation restarts cleanly
      void card.offsetWidth;
      card.classList.add('kpi-card--refreshing');
    });
  }, 60_000);
}

/* ============================================================
   Print / Export
   ============================================================ */

/**
 * Binds the print button to window.print().
 * The print stylesheet in styles.css handles visual adjustments.
 */
function initPrintButton() {
  const btn = document.getElementById('print-btn');
  if (btn) btn.addEventListener('click', () => window.print());
}

/* ============================================================
   Initialisation
   ============================================================ */

/**
 * Main entry point. Renders all dashboard sections and wires up all interactivity.
 * Called once the DOM is ready.
 */
function init() {
  // Theme must be applied before anything renders to avoid flash
  initTheme();

  // Timestamp
  updateTimestamp();
  setInterval(updateTimestamp, 60_000);

  // Render all dashboard sections
  renderKpiCards();
  renderRegionalTable();
  renderExceptionsFeed();
  renderVolumeChart();
  renderCarrierCards();

  // Interactive features
  initSectionToggles();
  initExceptionsControls();
  initAutoRefresh();
  initPrintButton();
}

document.addEventListener('DOMContentLoaded', init);

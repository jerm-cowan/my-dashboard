/**
 * @fileoverview Data layer for the FastForward Logistics Operations Dashboard.
 *
 * Architecture (two layers):
 *   Layer 1 — src/data/metrics.json   Raw mock dataset. Mirrors the shape a
 *             real API endpoint would return so fetch() can replace this import
 *             without touching any component.
 *   Layer 2 — this file               Imports metrics.json, applies TypeScript
 *             types, and re-exports named constants. Components import from
 *             here only — never directly from metrics.json.
 */

import metrics from './metrics.json'
export type { AppConfig, KpiMetaEntry, Thresholds, KpiData, RegionalRow, Exception, VolumeTrendDay, VolumeMonthRow, KpiSnapshot, SelectedPeriod, CarrierRow, RegionalSnapshot, CarrierSnapshot } from '@/types/index'
import type { AppConfig, KpiMetaEntry, Thresholds, KpiData, RegionalRow, Exception, VolumeTrendDay, VolumeMonthRow, KpiSnapshot, SelectedPeriod, CarrierRow, RegionalSnapshot, CarrierSnapshot } from '@/types/index'

// ─── Application Config ───────────────────────────────────────────────────────

/** Brand name, page title, and data-source mode from metrics.json. */
export const appConfig: AppConfig = metrics.app as AppConfig

// ─── Business Thresholds ──────────────────────────────────────────────────────

/**
 * Shared performance thresholds used by KPI cards, the Regional table, and
 * Carrier cards. Single source of truth — change here, updates everywhere.
 */
export const thresholds: Thresholds = metrics.thresholds

// ─── KPI Data ─────────────────────────────────────────────────────────────────

/** KPI summary metrics for the current month-to-date period. */
export const kpiData: KpiData = metrics.kpi as KpiData

/**
 * Display metadata for each KPI card: label, sublabel, and value format type.
 * Consumed by KpiGrid to build card definitions without hardcoding strings.
 */
export const kpiMeta: Record<string, KpiMetaEntry> = metrics.kpiMeta as Record<string, KpiMetaEntry>

/** Tooltip definitions shown on KPI card hover/focus. */
export const kpiTooltips: Record<string, string> = metrics.kpiTooltips

// ─── Regional Data ────────────────────────────────────────────────────────────

/** Regional performance breakdown across FastForward operating zones. */
export const regionalData: RegionalRow[] = metrics.regional as RegionalRow[]

// ─── Exceptions Data ──────────────────────────────────────────────────────────

/**
 * Active exception records requiring operations team attention.
 * Sorted by priority (HIGH first) then by hours open descending.
 */
export const exceptionsData: Exception[] = metrics.exceptions as Exception[]

// ─── Volume Trend Data ────────────────────────────────────────────────────────

/** Daily shipment volume for the past 7 days, ordered oldest to most recent. */
export const volumeTrendData: VolumeTrendDay[] = metrics.volumeTrend as VolumeTrendDay[]

/** Monthly shipment volume for the trailing 12 months, oldest to most recent. */
export const volumeMonthlyData: VolumeMonthRow[] = metrics.volumeMonthly as VolumeMonthRow[]

/**
 * KPI snapshots keyed by periodKey (daily ISO date or monthly "YYYY-MM").
 * Used by KpiGrid to display period-contextual values when a chart bar is selected.
 */
export const kpiSnapshots: KpiSnapshot[] = metrics.kpiSnapshots as KpiSnapshot[]

// ─── Carrier Data ─────────────────────────────────────────────────────────────

/** Carrier performance snapshot for top 4 carriers by shipment volume. */
export const carrierData: CarrierRow[] = metrics.carriers as CarrierRow[]

/**
 * Per-period regional snapshots (7 daily + 12 monthly × 5 regions = 95 entries).
 * RegionalTable uses these when a Shipment Volume bar is selected.
 */
export const regionalSnapshots: RegionalSnapshot[] = metrics.regionalSnapshots as RegionalSnapshot[]

/**
 * Per-period carrier snapshots (7 daily + 12 monthly × 4 carriers = 76 entries).
 * CarrierGrid uses these when a Shipment Volume bar is selected.
 */
export const carrierSnapshots: CarrierSnapshot[] = metrics.carrierSnapshots as CarrierSnapshot[]

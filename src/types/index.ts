/**
 * @fileoverview Shared TypeScript types for the FastForward Logistics Operations Dashboard.
 */

export interface AppConfig {
  brand: string
  title: string
  dataMode: 'mock' | 'live'
}

export interface KpiMetaEntry {
  label: string
  sublabel: string
  format: 'number' | 'percent' | 'days' | 'count'
  /**
   * When true, the trend arrow color is inverted: 'down' maps to success (green)
   * and 'up' maps to warning (orange). Use for metrics where a declining value
   * is operationally positive — e.g. Avg Transit Time going down = faster deliveries.
   */
  trendInverted?: boolean
}

export interface Thresholds {
  onTimeRate: { success: number; warning: number }
  openExceptions: { danger: number; warning: number }
}

export interface KpiData {
  totalShipmentsMTD: number
  onTimeDeliveryRate: number
  openExceptions: number
  avgTransitTime: number
  avgTransitTimeTrend: 'up' | 'down' | 'flat'
}

export interface RegionalRow {
  region: string
  shipments: number
  onTimeRate: number
  exceptions: number
  status: 'on-track' | 'at-risk' | 'critical'
}

export interface Exception {
  id: string
  shipmentId: string
  type: string
  region: string
  hoursOpen: number
  /** ISO date string when the exception was first logged (e.g. "2026-07-07"). */
  dateISO: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
}

export interface VolumeTrendDay {
  day: string
  date: string
  dateISO: string
  volume: number
}

export interface VolumeMonthRow {
  month: string
  year: number
  periodKey: string
  volume: number
}

export interface KpiSnapshot {
  periodKey: string
  totalShipments: number
  onTimeDeliveryRate: number
  openExceptions: number
  avgTransitTime: number
}

/**
 * A period selected by clicking a bar in the Shipment Volume chart.
 * Passed from DashboardView down to all section components so they
 * can display context-aware data for the selected day or month.
 */
export interface SelectedPeriod {
  type: 'day' | 'month'
  /** ISO date string: "2026-07-08" for daily, "2026-07" for monthly. */
  periodKey: string
  /** Human-readable label shown in context pills, e.g. "Jul 8" or "Jul 2026". */
  label: string
}

export interface CarrierRow {
  carrier: string
  shipments: number
  onTimeRate: number
  trend: 'up' | 'flat' | 'down'
}

/**
 * @fileoverview Mock data for FastForward Logistics Operations Dashboard.
 * All exports are typed and structured to be API-replaceable via fetch() in future iterations.
 * Data reflects realistic month-to-date metrics for a mid-size LTL freight operation.
 */

export type { KpiData, RegionalRow, Exception, VolumeTrendDay, CarrierRow } from '@/types/index'
import type { KpiData, RegionalRow, Exception, VolumeTrendDay, CarrierRow } from '@/types/index'

// ─── KPI Data ─────────────────────────────────────────────────────────────────

/** KPI summary metrics for the current month-to-date period. */
export const kpiData: KpiData = {
  totalShipmentsMTD: 4821,
  onTimeDeliveryRate: 91.4,
  openExceptions: 38,
  avgTransitTime: 2.3,
  avgTransitTimeTrend: 'down',
}

/** Tooltip definitions shown on KPI card hover/focus. */
export const kpiTooltips: Record<string, string> = {
  totalShipmentsMTD:
    'Total shipments dispatched or in transit since the first of the current month. Includes all freight modes across all regions.',
  onTimeDeliveryRate:
    'Percentage of deliveries completed within the committed delivery window. Internal target is ≥ 90%. Calculated from confirmed POD timestamps.',
  openExceptions:
    'Active shipment exceptions requiring resolution — including carrier delays, address errors, customs holds, and damaged goods. Target < 15.',
  avgTransitTime:
    'Average transit time in business days from carrier pickup to confirmed delivery, measured over the trailing 7 days.',
}

// ─── Regional Data ────────────────────────────────────────────────────────────

/** Regional performance breakdown across FastForward operating zones. */
export const regionalData: RegionalRow[] = [
  { region: 'Northeast',  shipments: 1204, onTimeRate: 94.2, exceptions: 6,  status: 'on-track' },
  { region: 'Southeast',  shipments: 987,  onTimeRate: 88.7, exceptions: 11, status: 'at-risk'  },
  { region: 'Midwest',    shipments: 1103, onTimeRate: 92.1, exceptions: 7,  status: 'on-track' },
  { region: 'Southwest',  shipments: 743,  onTimeRate: 85.3, exceptions: 9,  status: 'at-risk'  },
  { region: 'West Coast', shipments: 784,  onTimeRate: 93.8, exceptions: 5,  status: 'on-track' },
]

// ─── Exceptions Data ──────────────────────────────────────────────────────────

/**
 * Active exception records requiring operations team attention.
 * Sorted by priority (HIGH first) then by hours open descending.
 */
export const exceptionsData: Exception[] = [
  { id: 'EXC-00414', shipmentId: 'SHP-882476', type: 'Customs Hold',   region: 'West Coast', hoursOpen: 31, priority: 'HIGH'   },
  { id: 'EXC-00419', shipmentId: 'SHP-882894', type: 'Customs Hold',   region: 'West Coast', hoursOpen: 47, priority: 'HIGH'   },
  { id: 'EXC-00412', shipmentId: 'SHP-882341', type: 'Carrier Delay',  region: 'Southeast',  hoursOpen: 14, priority: 'HIGH'   },
  { id: 'EXC-00415', shipmentId: 'SHP-882101', type: 'Damaged Goods',  region: 'Midwest',    hoursOpen: 8,  priority: 'HIGH'   },
  { id: 'EXC-00422', shipmentId: 'SHP-883145', type: 'Damaged Goods',  region: 'Southeast',  hoursOpen: 28, priority: 'HIGH'   },
  { id: 'EXC-00427', shipmentId: 'SHP-883634', type: 'Carrier Delay',  region: 'Southeast',  hoursOpen: 36, priority: 'HIGH'   },
  { id: 'EXC-00430', shipmentId: 'SHP-883921', type: 'Customs Hold',   region: 'West Coast', hoursOpen: 55, priority: 'HIGH'   },
  { id: 'EXC-00416', shipmentId: 'SHP-882552', type: 'Carrier Delay',  region: 'Southwest',  hoursOpen: 22, priority: 'MEDIUM' },
  { id: 'EXC-00418', shipmentId: 'SHP-882733', type: 'Address Error',  region: 'Midwest',    hoursOpen: 19, priority: 'MEDIUM' },
  { id: 'EXC-00420', shipmentId: 'SHP-882967', type: 'Carrier Delay',  region: 'Northeast',  hoursOpen: 11, priority: 'MEDIUM' },
  { id: 'EXC-00413', shipmentId: 'SHP-882209', type: 'Address Error',  region: 'Northeast',  hoursOpen: 3,  priority: 'MEDIUM' },
  { id: 'EXC-00424', shipmentId: 'SHP-883388', type: 'Address Error',  region: 'West Coast', hoursOpen: 17, priority: 'MEDIUM' },
  { id: 'EXC-00425', shipmentId: 'SHP-883412', type: 'Customs Hold',   region: 'Northeast',  hoursOpen: 9,  priority: 'MEDIUM' },
  { id: 'EXC-00428', shipmentId: 'SHP-883712', type: 'Damaged Goods',  region: 'Northeast',  hoursOpen: 12, priority: 'MEDIUM' },
  { id: 'EXC-00417', shipmentId: 'SHP-882618', type: 'Missing Label',  region: 'Southeast',  hoursOpen: 5,  priority: 'LOW'    },
  { id: 'EXC-00421', shipmentId: 'SHP-883012', type: 'Weight Dispute', region: 'Southwest',  hoursOpen: 6,  priority: 'LOW'    },
  { id: 'EXC-00423', shipmentId: 'SHP-883221', type: 'Carrier Delay',  region: 'Midwest',    hoursOpen: 4,  priority: 'LOW'    },
  { id: 'EXC-00426', shipmentId: 'SHP-883501', type: 'Missing Label',  region: 'Southwest',  hoursOpen: 2,  priority: 'LOW'    },
  { id: 'EXC-00429', shipmentId: 'SHP-883859', type: 'Weight Dispute', region: 'Midwest',    hoursOpen: 7,  priority: 'LOW'    },
]

// ─── Volume Trend Data ────────────────────────────────────────────────────────

/** Daily shipment volume for the past 7 days, ordered oldest to most recent. */
export const volumeTrendData: VolumeTrendDay[] = [
  { day: 'Tue', date: 'Jul 2', volume: 672 },
  { day: 'Wed', date: 'Jul 3', volume: 715 },
  { day: 'Thu', date: 'Jul 4', volume: 483 },
  { day: 'Fri', date: 'Jul 5', volume: 698 },
  { day: 'Sat', date: 'Jul 6', volume: 312 },
  { day: 'Sun', date: 'Jul 7', volume: 297 },
  { day: 'Mon', date: 'Jul 8', volume: 384 },
]

// ─── Carrier Data ─────────────────────────────────────────────────────────────

/** Carrier performance snapshot for top 4 carriers by shipment volume. */
export const carrierData: CarrierRow[] = [
  { carrier: 'FedEx Freight', shipments: 1240, onTimeRate: 93.5, trend: 'up'   },
  { carrier: 'XPO Logistics', shipments: 1018, onTimeRate: 89.2, trend: 'flat' },
  { carrier: 'Old Dominion',  shipments: 876,  onTimeRate: 95.1, trend: 'up'   },
  { carrier: 'Estes Express', shipments: 654,  onTimeRate: 84.7, trend: 'down' },
]

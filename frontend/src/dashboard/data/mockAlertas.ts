import type { Alerta } from '@/dashboard/types'

function al(id: string, type: string, severity: Alerta['severity'], message: string, timestamp: string): Alerta {
  return { id, type, severity, message, timestamp }
}

export const mockAlertas: Alerta[] = [
  al('al-01', 'overload', 'error', 'Juan Pérez has 8 assigned PDVs — 92% workload, exceeds threshold.', '2026-05-30T10:30:00'),
  al('al-02', 'overload', 'error', 'María García has 7 assigned PDVs — 88% workload, exceeds threshold.', '2026-05-30T10:30:00'),
  al('al-03', 'time', 'warning', 'Replenisher 1 is running 18% above planned time in the first 4 PDVs.', '2026-05-30T10:15:00'),
  al('al-04', 'stock', 'error', 'Product stock break detected at PDV Central — SKU-0452 critically low.', '2026-05-30T09:45:00'),
  al('al-05', 'stock', 'warning', 'Warehouse Sur is below 30% stock on high-turnover SKUs.', '2026-05-30T09:20:00'),
  al('al-06', 'photo', 'warning', 'Missing exhibition photo for PDV Miraflores — last capture 3 days ago.', '2026-05-30T08:50:00'),
  al('al-07', 'route', 'info', 'Route optimization available — redistributing 12 PDVs can reduce travel by 23%.', '2026-05-30T08:00:00'),
]

import type { Alerta } from '@/dashboard/types'

function al(id: string, type: string, severity: Alerta['severity'], message: string, timestamp: string): Alerta {
  return { id, type, severity, message, timestamp }
}

export const mockAlertas: Alerta[] = [
  al('al-01', 'overload', 'error', 'Juan Pérez tiene 8 PDVs asignados — 92% de carga, supera el umbral.', '2026-05-30T10:30:00'),
  al('al-02', 'overload', 'error', 'María García tiene 7 PDVs asignados — 88% de carga, supera el umbral.', '2026-05-30T10:30:00'),
  al('al-03', 'time', 'warning', 'Reponedor 1 está 18% sobre el tiempo planificado en los primeros 4 PDVs.', '2026-05-30T10:15:00'),
  al('al-04', 'stock', 'error', 'Quiebre de stock detectado en PDV Central — SKU-0452 críticamente bajo.', '2026-05-30T09:45:00'),
  al('al-05', 'stock', 'warning', 'Depósito Sur está por debajo del 30% de stock en SKUs de alta rotación.', '2026-05-30T09:20:00'),
  al('al-06', 'photo', 'warning', 'Falta foto de exhibición del PDV Miraflores — última captura hace 3 días.', '2026-05-30T08:50:00'),
  al('al-07', 'route', 'info', 'Optimización de ruta disponible — redistribuir 12 PDVs puede reducir el viaje en un 23%.', '2026-05-30T08:00:00'),
]

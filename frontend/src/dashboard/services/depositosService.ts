import { api, type BackendDeposito } from '@/api/client'
import type { Warehouse } from '@/dashboard/types'

function toWarehouseStatus(riesgo: BackendDeposito['riesgo_quiebre']): Warehouse['status'] {
  if (riesgo === 'alto') return 'critical'
  if (riesgo === 'medio') return 'alert'
  return 'optimal'
}

function toCapacityPct(diasRestantes: number): number {
  return Math.min(100, Math.max(0, Math.round(diasRestantes * 7)))
}

function toFrontendWarehouse(d: BackendDeposito): Warehouse {
  const materials = [
    { id: `${d.id}-mp`, name: 'Marca precios', availability: d.stock.marca_precios },
    { id: `${d.id}-col`, name: 'Colgantes', availability: d.stock.colgantes },
    { id: `${d.id}-cen`, name: 'Cenefas', availability: d.stock.cenefas },
  ].filter(m => m.availability > 0 || d.riesgo_quiebre === 'alto')

  return {
    id: String(d.id),
    name: d.mercado,
    capacity: toCapacityPct(d.dias_restantes),
    daysRemaining: d.dias_restantes,
    status: toWarehouseStatus(d.riesgo_quiebre),
    materials,
  }
}

export async function fetchDepositos(): Promise<Warehouse[]> {
  const data = await api.getDepositos()
  return (data as BackendDeposito[]).map(toFrontendWarehouse)
}

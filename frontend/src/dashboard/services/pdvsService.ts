import { api, type BackendPDV, type BackendVisita } from '@/api/client'
import type { PDV } from '@/dashboard/types'

function deriveStatus(pdvId: number, visitaMap: Map<number, string>): PDV['status'] {
  const estado = visitaMap.get(pdvId)
  if (!estado) return 'pending'
  if (estado === 'completada') return 'completed'
  return 'in_progress'
}

function toFrontendPDV(p: BackendPDV, visitaMap: Map<number, string>): PDV {
  return {
    id: String(p.id),
    name: p.mercado,
    address: p.cliente,
    reponedorId: p.reponedor_id != null ? String(p.reponedor_id) : '',
    status: deriveStatus(p.id, visitaMap),
    lat: p.latitud,
    lng: p.longitud,
    visitOrder: p.nro,
  }
}

export async function fetchPdvs(): Promise<PDV[]> {
  const [pdvsResult, visitasResult] = await Promise.allSettled([
    api.getPdvs({ limit: 500 }),
    api.getVisitasHoy(),
  ])

  if (pdvsResult.status === 'rejected') {
    throw pdvsResult.reason
  }

  const visitaMap = new Map<number, string>()
  if (visitasResult.status === 'fulfilled') {
    for (const v of visitasResult.value as BackendVisita[]) {
      visitaMap.set(v.pdv_id, v.estado)
    }
  }

  return (pdvsResult.value as BackendPDV[]).map(p => toFrontendPDV(p, visitaMap))
}

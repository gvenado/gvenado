import { api, type BackendReponedor } from '@/api/client'
import type { Reponedor, PDV } from '@/dashboard/types'

const REP_COLORS = [
  '#DC2626', '#2563EB', '#16A34A', '#F59E0B', '#7C3AED',
  '#0891B2', '#D946EF', '#059669', '#B91C1C', '#1D4ED8',
  '#15803D', '#D97706', '#6D28D9', '#0E7490', '#C026D3',
  '#047857', '#9F1239', '#1E40AF', '#166534', '#92400E',
  '#5B21B6', '#164E63', '#86198F', '#065F46',
]

function toFrontendReponedor(r: BackendReponedor, index: number, pdvs: PDV[]): Reponedor {
  const assigned = pdvs.filter(p => p.reponedorId === String(r.id))
  const inProgress = assigned.filter(p => p.status === 'in_progress').length

  let status: Reponedor['status'] = 'idle'
  if (inProgress > 0) status = 'at_pdv'
  else if (assigned.length > 0) status = 'in_route'

  const workload = assigned.length > 0
    ? Math.min(100, Math.round((assigned.length / 14) * 100))
    : 0

  return {
    id: String(r.id),
    name: r.nombre,
    photoUrl: '',
    workload,
    assignedPdvs: assigned.length,
    status,
    rating: 4.5,
    color: REP_COLORS[index % REP_COLORS.length],
  }
}

export async function fetchReponedores(pdvs?: PDV[]): Promise<Reponedor[]> {
  const data = await api.getReponedores()
  const resolvedPdvs = pdvs ?? []
  return (data as BackendReponedor[]).map((r, i) => toFrontendReponedor(r, i, resolvedPdvs))
}

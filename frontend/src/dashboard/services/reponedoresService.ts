import type { Reponedor, PDV } from '@/dashboard/types'

const REP_NAMES = ['Rep 1', 'Rep 2', 'Rep 3', 'Rep 4', 'Rep 5', 'Rep 6']
const REP_COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED', '#0891B2']
const STATUSES: Reponedor['status'][] = ['overloaded', 'in_route', 'in_route', 'at_pdv', 'idle', 'in_route']

function generateMockReponedores(pdvs: PDV[]): Reponedor[] {
  return REP_NAMES.map((name, i) => {
    const assignedPdvs = pdvs.filter(p => p.reponedorId === `rep-${i + 1}`)
    return {
      id: `rep-${i + 1}`,
      name,
      photoUrl: '',
      workload: [92, 88, 72, 65, 45, 60][i],
      assignedPdvs: assignedPdvs.length,
      status: STATUSES[i],
      rating: [4.8, 4.9, 4.5, 4.7, 4.2, 4.6][i],
      color: REP_COLORS[i],
    }
  })
}

export async function fetchReponedores(pdvs?: PDV[]): Promise<Reponedor[]> {
  await new Promise(r => setTimeout(r, 300))
  return generateMockReponedores(pdvs ?? [])
}

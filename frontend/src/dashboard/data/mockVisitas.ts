import type { Visita } from '@/dashboard/types'

export const mockVisitas: Visita[] = [
  { id: 'vis-01', pdvId: 'pdv-01', reponedorId: 'rep-1', date: '2026-05-30T08:00:00', status: 'completed', duration: 45, notes: 'Standard visit completed.' },
  { id: 'vis-02', pdvId: 'pdv-02', reponedorId: 'rep-1', date: '2026-05-30T09:00:00', status: 'completed', duration: 30, notes: 'Quick check.' },
  { id: 'vis-03', pdvId: 'pdv-03', reponedorId: 'rep-1', date: '2026-05-30T10:00:00', status: 'in_progress', duration: 0, notes: '' },
  { id: 'vis-04', pdvId: 'pdv-09', reponedorId: 'rep-2', date: '2026-05-30T08:30:00', status: 'completed', duration: 50, notes: 'Full restock.' },
  { id: 'vis-05', pdvId: 'pdv-10', reponedorId: 'rep-2', date: '2026-05-30T09:30:00', status: 'completed', duration: 35, notes: '' },
  { id: 'vis-06', pdvId: 'pdv-11', reponedorId: 'rep-2', date: '2026-05-30T10:30:00', status: 'in_progress', duration: 0, notes: '' },
]

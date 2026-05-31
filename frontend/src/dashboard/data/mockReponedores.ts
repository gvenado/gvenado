import type { Reponedor } from '@/dashboard/types'

export const mockReponedores: Reponedor[] = [
  { id: 'rep-1', name: 'Reponedor 1', photoUrl: '', workload: 112, assignedPdvs: 8, status: 'overloaded', rating: 4.8, color: '#DC2626' },
  { id: 'rep-2', name: 'Reponedor 2', photoUrl: '', workload: 105, assignedPdvs: 8, status: 'overloaded', rating: 4.9, color: '#B91C1C' },
  { id: 'rep-3', name: 'Reponedor 3', photoUrl: '', workload: 92, assignedPdvs: 7, status: 'overloaded', rating: 4.5, color: '#F59E0B' },
  { id: 'rep-4', name: 'Reponedor 4', photoUrl: '', workload: 86, assignedPdvs: 7, status: 'overloaded', rating: 4.7, color: '#2563EB' },
  { id: 'rep-5', name: 'Reponedor 5', photoUrl: '', workload: 74, assignedPdvs: 6, status: 'in_route', rating: 4.2, color: '#16A34A' },
  { id: 'rep-6', name: 'Reponedor 6', photoUrl: '', workload: 68, assignedPdvs: 5, status: 'at_pdv', rating: 4.4, color: '#111827' },
  { id: 'rep-7', name: 'Reponedor 7', photoUrl: '', workload: 62, assignedPdvs: 5, status: 'in_route', rating: 4.3, color: '#6B7280' },
  { id: 'rep-8', name: 'Reponedor 8', photoUrl: '', workload: 58, assignedPdvs: 4, status: 'idle', rating: 4.6, color: '#9CA3AF' },
]

export const mockOptimizedReponedores: Reponedor[] = [
  { id: 'rep-1', name: 'Reponedor 1', photoUrl: '', workload: 88, assignedPdvs: 5, status: 'in_route', rating: 4.8, color: '#DC2626' },
  { id: 'rep-2', name: 'Reponedor 2', photoUrl: '', workload: 89, assignedPdvs: 5, status: 'in_route', rating: 4.9, color: '#B91C1C' },
  { id: 'rep-3', name: 'Reponedor 3', photoUrl: '', workload: 90, assignedPdvs: 6, status: 'in_route', rating: 4.5, color: '#F59E0B' },
  { id: 'rep-4', name: 'Reponedor 4', photoUrl: '', workload: 87, assignedPdvs: 6, status: 'in_route', rating: 4.7, color: '#2563EB' },
  { id: 'rep-5', name: 'Reponedor 5', photoUrl: '', workload: 88, assignedPdvs: 5, status: 'in_route', rating: 4.2, color: '#16A34A' },
  { id: 'rep-6', name: 'Reponedor 6', photoUrl: '', workload: 87, assignedPdvs: 6, status: 'in_route', rating: 4.4, color: '#111827' },
  { id: 'rep-7', name: 'Reponedor 7', photoUrl: '', workload: 85, assignedPdvs: 6, status: 'in_route', rating: 4.3, color: '#6B7280' },
  { id: 'rep-8', name: 'Reponedor 8', photoUrl: '', workload: 86, assignedPdvs: 5, status: 'in_route', rating: 4.6, color: '#9CA3AF' },
]

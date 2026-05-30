import type { Reponedor } from '@/dashboard/types'

export const mockReponedores: Reponedor[] = [
  { id: 'rep-1', name: 'Juan Pérez', photoUrl: '', workload: 92, assignedPdvs: 8, status: 'overloaded', rating: 4.8, color: '#DC2626' },
  { id: 'rep-2', name: 'María García', photoUrl: '', workload: 88, assignedPdvs: 7, status: 'overloaded', rating: 4.9, color: '#EA580C' },
  { id: 'rep-3', name: 'Pedro López', photoUrl: '', workload: 72, assignedPdvs: 6, status: 'in_route', rating: 4.5, color: '#16A34A' },
  { id: 'rep-4', name: 'Ana Martínez', photoUrl: '', workload: 65, assignedPdvs: 5, status: 'in_route', rating: 4.7, color: '#2563EB' },
  { id: 'rep-5', name: 'Luis Rodríguez', photoUrl: '', workload: 45, assignedPdvs: 4, status: 'idle', rating: 4.2, color: '#7C3AED' },
  { id: 'rep-6', name: 'Sofía Morales', photoUrl: '', workload: 38, assignedPdvs: 3, status: 'idle', rating: 4.4, color: '#0891B2' },
  { id: 'rep-7', name: 'Diego Ramírez', photoUrl: '', workload: 52, assignedPdvs: 4, status: 'in_route', rating: 4.3, color: '#D946EF' },
  { id: 'rep-8', name: 'Valentina Castro', photoUrl: '', workload: 60, assignedPdvs: 5, status: 'at_pdv', rating: 4.6, color: '#059669' },
]

export const mockOptimizedReponedores: Reponedor[] = [
  { id: 'rep-1', name: 'Juan Pérez', photoUrl: '', workload: 86, assignedPdvs: 6, status: 'in_route', rating: 4.8, color: '#DC2626' },
  { id: 'rep-2', name: 'María García', photoUrl: '', workload: 82, assignedPdvs: 6, status: 'in_route', rating: 4.9, color: '#EA580C' },
  { id: 'rep-3', name: 'Pedro López', photoUrl: '', workload: 85, assignedPdvs: 7, status: 'in_route', rating: 4.5, color: '#16A34A' },
  { id: 'rep-4', name: 'Ana Martínez', photoUrl: '', workload: 80, assignedPdvs: 6, status: 'in_route', rating: 4.7, color: '#2563EB' },
  { id: 'rep-5', name: 'Luis Rodríguez', photoUrl: '', workload: 88, assignedPdvs: 7, status: 'in_route', rating: 4.2, color: '#7C3AED' },
  { id: 'rep-6', name: 'Sofía Morales', photoUrl: '', workload: 84, assignedPdvs: 7, status: 'in_route', rating: 4.4, color: '#0891B2' },
  { id: 'rep-7', name: 'Diego Ramírez', photoUrl: '', workload: 82, assignedPdvs: 6, status: 'in_route', rating: 4.3, color: '#D946EF' },
  { id: 'rep-8', name: 'Valentina Castro', photoUrl: '', workload: 80, assignedPdvs: 6, status: 'in_route', rating: 4.6, color: '#059669' },
]

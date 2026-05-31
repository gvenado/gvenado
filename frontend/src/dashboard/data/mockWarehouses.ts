import type { Warehouse } from '@/dashboard/types'

export const mockWarehouses: Warehouse[] = [
  {
    id: 'wh-1',
    name: 'Central',
    capacity: 82,
    daysRemaining: 12,
    status: 'optimal',
    materials: [],
  },
  {
    id: 'wh-2',
    name: 'Achumani',
    capacity: 24,
    daysRemaining: 3,
    status: 'alert',
    materials: [
      { id: 'mat-1', name: 'Shelf Strip 600ml', availability: 12 },
      { id: 'mat-2', name: 'Promotional Hanger', availability: 18 },
    ],
  },
  {
    id: 'wh-3',
    name: 'San Pedro',
    capacity: 61,
    daysRemaining: 7,
    status: 'stable',
    materials: [],
  },
  {
    id: 'wh-4',
    name: 'Max Paredes',
    capacity: 18,
    daysRemaining: 2,
    status: 'critical',
    materials: [],
  },
]

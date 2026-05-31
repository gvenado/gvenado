import type { Deposito } from '@/dashboard/types'

export const mockDepositos: Deposito[] = [
  { id: 'dep-01', name: 'Depósito Central', pdvId: 'pdv-01', capacity: 500, filled: 420 },
  { id: 'dep-02', name: 'Depósito Sopocachi', pdvId: 'pdv-02', capacity: 300, filled: 150 },
  { id: 'dep-03', name: 'Depósito Miraflores', pdvId: 'pdv-03', capacity: 400, filled: 380 },
  { id: 'dep-04', name: 'Depósito Sur', pdvId: 'pdv-11', capacity: 600, filled: 210 },
  { id: 'dep-05', name: 'Depósito Norte', pdvId: 'pdv-16', capacity: 350, filled: 340 },
  { id: 'dep-06', name: 'Depósito El Alto', pdvId: 'pdv-18', capacity: 450, filled: 180 },
]

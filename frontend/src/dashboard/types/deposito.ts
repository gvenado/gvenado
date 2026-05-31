export interface Deposito {
  id: string
  name: string
  pdvId: string
  capacity: number
  filled: number
}

export type WarehouseStatus = 'optimal' | 'stable' | 'alert' | 'critical'

export interface WarehouseMaterial {
  id: string
  name: string
  availability: number
}

export interface Warehouse {
  id: string
  name: string
  capacity: number
  daysRemaining: number
  status: WarehouseStatus
  materials: WarehouseMaterial[]
}

export interface TransferSuggestion {
  sourceWarehouse: string
  destinationWarehouse: string
  materials: { name: string; quantity: number; unit: string }[]
  expectedRecovery: string
}

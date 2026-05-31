import { useState, useMemo } from 'react'
import { mockWarehouses } from '@/dashboard/data/mockWarehouses'

export function useWarehouses() {
  const [selectedId, setSelectedId] = useState<string>('wh-2')

  const warehouses = useMemo(() => mockWarehouses, [])

  const selectedWarehouse = useMemo(
    () => warehouses.find(w => w.id === selectedId) ?? null,
    [warehouses, selectedId]
  )

  const selectWarehouse = (id: string) => setSelectedId(id)

  const kpis = useMemo(() => ({
    warehousesInAlert: warehouses.filter(w => w.status === 'alert' || w.status === 'critical').length,
    criticalMaterials: warehouses.reduce((sum, w) => sum + w.materials.length, 0),
    totalStock: 12480,
  }), [warehouses])

  return { warehouses, selectedWarehouse, selectedId, selectWarehouse, kpis }
}

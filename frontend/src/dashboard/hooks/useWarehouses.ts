import { useState, useEffect, useMemo } from 'react'
import type { Warehouse } from '@/dashboard/types'
import { fetchDepositos } from '@/dashboard/services/depositosService'

export function useWarehouses() {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchDepositos()
      .then(data => {
        if (cancelled) return
        setWarehouses(data)
        if (data.length > 0 && !selectedId) {
          const alertWh = data.find(w => w.status === 'alert' || w.status === 'critical')
          setSelectedId(alertWh?.id ?? data[0].id)
        }
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar depósitos')
        setLoading(false)
      })

    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectedWarehouse = useMemo(
    () => warehouses.find(w => w.id === selectedId) ?? null,
    [warehouses, selectedId]
  )

  const selectWarehouse = (id: string) => setSelectedId(id)

  const kpis = useMemo(() => ({
    warehousesInAlert: warehouses.filter(w => w.status === 'alert' || w.status === 'critical').length,
    criticalMaterials: warehouses.filter(w => w.status === 'critical').reduce((sum, w) => sum + w.materials.length, 0),
    totalStock: warehouses.reduce((sum, w) => {
      return sum + w.materials.reduce((s, m) => s + m.availability, 0)
    }, 0),
  }), [warehouses])

  return { warehouses, selectedWarehouse, selectedId, selectWarehouse, kpis, loading, error }
}

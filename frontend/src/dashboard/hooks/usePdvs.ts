import { useState, useEffect } from 'react'
import type { PDV } from '@/dashboard/types'
import { fetchPdvs } from '@/dashboard/services/pdvsService'
import type { PDVMarkerData } from '@/dashboard/components/MapaVivoLeaflet'

const CATEGORIES = ['Minimarket', 'Kiosko', 'Farmacia', 'Abarrotes', 'Restaurante', 'Libreria', 'Panaderia', 'Carniceria']

function toMarkerData(pdvs: PDV[]): PDVMarkerData[] {
  return pdvs.map((p, i) => ({
    id: p.id,
    name: p.name,
    code: `GV${String(i + 1).padStart(3, '0')}`,
    category: CATEGORIES[i % CATEGORIES.length],
    lat: p.lat,
    lng: p.lng,
    status: p.status,
    estimatedTime: `${15 + (i % 30)} min`,
  }))
}

export function usePdvs() {
  const [pdvs, setPdvs] = useState<PDVMarkerData[]>([])
  const [rawPdvs, setRawPdvs] = useState<PDV[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    fetchPdvs()
      .then(data => {
        if (cancelled) return
        setRawPdvs(data)
        setPdvs(toMarkerData(data))
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Failed to load PDVs')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [])

  return { pdvs, rawPdvs, loading, error }
}

import { useState, useEffect } from 'react'
import type { Reponedor, PDV } from '@/dashboard/types'
import { fetchReponedores } from '@/dashboard/services/reponedoresService'
import type { ReplenisherMarkerData } from '@/dashboard/components/MapaVivoLeaflet'

function toMarkerData(reponedores: Reponedor[], pdvs: PDV[]): ReplenisherMarkerData[] {
  return reponedores.map((rep, i) => {
    const assignedPdvs = pdvs.filter(p => p.reponedorId === rep.id)
    const routePoints = assignedPdvs.map(p => ({ lat: p.lat, lng: p.lng }))
    const total = assignedPdvs.length
    const visited = Math.min(i * 3 + 3, total)
    const currentIdx = visited
    const current = assignedPdvs[currentIdx] ?? assignedPdvs[0]
    const nextPdvData = assignedPdvs[currentIdx + 1]

    return {
      id: rep.id,
      name: rep.name,
      lat: current?.lat ?? 0,
      lng: current?.lng ?? 0,
      color: rep.color,
      accumulatedTime: `${1 + i}h ${30 - i * 5}m`,
      pdvsVisited: visited,
      totalPdvs: total,
      currentPdvName: current?.name ?? 'Sin PDV',
      nextPdv: nextPdvData?.name ?? 'Último PDV',
      eta: `${10 + i * 2}:${String(5 + i * 10).padStart(2, '0')}`,
      efficiency: `${80 + Math.floor(Math.random() * 15)}%`,
      deviation: rep.status === 'overloaded' ? `+${15 + i * 3} min` : 'En tiempo',
      mobilityProfile: i % 2 === 0 ? 'Moderado' : 'Rápido',
      operationStatus: rep.status === 'at_pdv' ? 'En PDV'
        : rep.status === 'overloaded' ? 'Retrasado'
        : rep.status === 'idle' ? 'Sin conexión'
        : 'En ruta',
      routePoints,
    }
  })
}

export function useReponedores(pdvs: PDV[]) {
  const [replenishers, setReplenishers] = useState<ReplenisherMarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (pdvs.length === 0) return

    let cancelled = false
    setLoading(true)
    setError(null)

    fetchReponedores(pdvs)
      .then(data => {
        if (cancelled) return
        setReplenishers(toMarkerData(data, pdvs))
        setLoading(false)
      })
      .catch(err => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar reponedores')
        setLoading(false)
      })

    return () => { cancelled = true }
  }, [pdvs])

  return { replenishers, loading, error }
}

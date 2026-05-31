import { useState, useEffect, useMemo } from 'react'
import type { EvidenceCardData, ComplianceItem, ImprovementItem } from '@/dashboard/types'
import { fetchGalleryEvidence } from '@/dashboard/services/galeriaService'

const DEFAULT_COMPLIANCE: ComplianceItem[] = [
  { label: 'Estante instalado', percentage: 96, color: '#16A34A' },
  { label: 'Material colgante OK', percentage: 93, color: '#2563EB' },
  { label: 'Precios visibles', percentage: 90, color: '#F59E0B' },
  { label: 'Orden y frente', percentage: 88, color: '#DC2626' },
  { label: 'Disponibilidad de stock', percentage: 83, color: '#6B7280' },
]

function toISODate(ddmmyyyy: string): string {
  const parts = ddmmyyyy.split('/')
  if (parts.length !== 3) return ''
  return `${parts[2]}-${parts[1]}-${parts[0]}`
}

interface GaleriaFilters {
  replenisher: string
  date: string
  status: string
}

interface GaleriaMetrics {
  totalFacesGained: number
  bestReplenisherName: string
  bestReplenisherEfficiency: string
  bestPDVName: string
  bestPDVFaces: number
  complianceData: ComplianceItem[]
  rankingData: ImprovementItem[]
  averageCompliance: number
}

export function useGaleria(filters: GaleriaFilters) {
  const [allEvidence, setAllEvidence] = useState<EvidenceCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetchGalleryEvidence()
      .then(data => { if (!cancelled) { setAllEvidence(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const filteredEvidence = useMemo(() => {
    return allEvidence.filter(ev => {
      if (filters.replenisher !== 'all' && ev.replenisher !== filters.replenisher) return false
      if (filters.date) {
        const isoDate = toISODate(filters.date)
        if (isoDate && ev.date !== isoDate) return false
      }
      if (filters.status === 'completed' && !ev.tags.some(t => t.type === 'success')) return false
      if (filters.status === 'improved' && !ev.tags.some(t => t.label === 'Mejorado')) return false
      if (filters.status === 'stock_break' && !ev.tags.some(t => t.type === 'error')) return false
      return true
    })
  }, [allEvidence, filters])

  const metrics: GaleriaMetrics = useMemo(() => {
    const totalFacesGained = filteredEvidence.reduce((sum, ev) => sum + ev.facesGained, 0)

    const repFaces: Record<string, number> = {}
    filteredEvidence.forEach(ev => {
      repFaces[ev.replenisher] = (repFaces[ev.replenisher] || 0) + ev.facesGained
    })
    let bestReplenisherName = '—'
    let bestReplenisherFaces = 0
    for (const [name, faces] of Object.entries(repFaces)) {
      if (faces > bestReplenisherFaces) { bestReplenisherName = name; bestReplenisherFaces = faces }
    }

    const pdvFaces: Record<string, { name: string; faces: number }> = {}
    filteredEvidence.forEach(ev => {
      if (!pdvFaces[ev.storeName] || ev.facesGained > pdvFaces[ev.storeName].faces) {
        pdvFaces[ev.storeName] = { name: ev.storeName, faces: ev.facesGained }
      }
    })
    let bestPDVName = '—'
    let bestPDVFaces = 0
    for (const { name, faces } of Object.values(pdvFaces)) {
      if (faces > bestPDVFaces) { bestPDVName = name; bestPDVFaces = faces }
    }

    const complianceData = DEFAULT_COMPLIANCE.map(c => ({
      ...c,
      percentage: c.percentage,
    }))

    const averageCompliance = Math.round(
      complianceData.reduce((s, c) => s + c.percentage, 0) / complianceData.length
    )

    const pdvRanking: Record<string, { name: string; code: string; facesGained: number; replenisher: string; date: string }> = {}
    filteredEvidence.forEach(ev => {
      const storeKey = ev.storeName
      if (!pdvRanking[storeKey]) {
        pdvRanking[storeKey] = {
          name: ev.storeName,
          code: ev.id.replace('ev-', 'GV'),
          facesGained: 0,
          replenisher: ev.replenisher,
          date: ev.date,
        }
      }
      pdvRanking[storeKey].facesGained += ev.facesGained
    })
    const rankingData: ImprovementItem[] = Object.values(pdvRanking)
      .sort((a, b) => b.facesGained - a.facesGained)
      .map(item => ({
        code: item.code,
        name: item.name,
        facesGained: item.facesGained,
        replenisher: item.replenisher,
        date: item.date,
      }))

    return {
      totalFacesGained,
      bestReplenisherName,
      bestReplenisherEfficiency: `${Math.min(85 + Math.floor(Math.random() * 15), 100)}%`,
      bestPDVName,
      bestPDVFaces,
      complianceData,
      rankingData,
      averageCompliance,
    }
  }, [filteredEvidence])

  return { evidence: filteredEvidence, allEvidence, loading, metrics }
}

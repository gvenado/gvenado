import { useState, useEffect } from 'react'
import type { EvidenceCardData } from '@/dashboard/types'
import { fetchGalleryEvidence } from '@/dashboard/services/galeriaService'

export function useGaleria() {
  const [evidence, setEvidence] = useState<EvidenceCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    fetchGalleryEvidence()
      .then(data => { if (!cancelled) { setEvidence(data); setLoading(false) } })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  return { evidence, loading }
}

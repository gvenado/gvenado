import { createContext, useContext, useState, useMemo, useEffect, useCallback, type ReactNode } from 'react'
import type { Supervisor, Reponedor, PDV, Alerta } from '@/dashboard/types'
import { mockSupervisor } from '@/dashboard/data/mockSupervisor'
import { mockAlertas } from '@/dashboard/data/mockAlertas'
import { fetchPdvs } from '@/dashboard/services/pdvsService'
import { fetchReponedores } from '@/dashboard/services/reponedoresService'

interface SupervisorContextValue {
  supervisor: Supervisor
  reponedores: Reponedor[]
  pdvs: PDV[]
  alertas: Alerta[]
  loading: boolean
  error: string | null
  optimized: boolean
  toggleOptimized: () => void
  optimizedReponedores: Reponedor[]
  optimizedPDVs: PDV[]
  applied: boolean
  applyOptimized: () => void
  resetApplied: () => void
}

const SupervisorContext = createContext<SupervisorContextValue | null>(null)

export function SupervisorProvider({ children }: { children: ReactNode }) {
  const [pdvs, setPdvs] = useState<PDV[]>([])
  const [reponedores, setReponedores] = useState<Reponedor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [optimized, setOptimized] = useState(false)
  const [applied, setApplied] = useState(false)
  const [optimizedPDVs, setOptimizedPDVs] = useState<PDV[]>([])
  const [optimizedReponedores, setOptimizedReponedores] = useState<Reponedor[]>([])

  useEffect(() => {
    let cancelled = false

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const loadedPdvs = await fetchPdvs()
        if (cancelled) return
        setPdvs(loadedPdvs)
        setOptimizedPDVs(loadedPdvs)

        const loadedReps = await fetchReponedores(loadedPdvs)
        if (cancelled) return
        setReponedores(loadedReps)
        setOptimizedReponedores(loadedReps)
      } catch (err) {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar datos')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const toggleOptimized = useCallback(() => setOptimized(prev => !prev), [])

  const applyOptimized = useCallback(() => {
    setApplied(true)
  }, [])

  const resetApplied = useCallback(() => {
    setApplied(false)
    setOptimized(false)
  }, [])

  const value = useMemo<SupervisorContextValue>(() => ({
    supervisor: mockSupervisor,
    reponedores,
    pdvs,
    alertas: mockAlertas,
    loading,
    error,
    optimized,
    toggleOptimized,
    optimizedReponedores,
    optimizedPDVs,
    applied,
    applyOptimized,
    resetApplied,
  }), [optimized, reponedores, pdvs, loading, error, optimizedReponedores, optimizedPDVs, applied, toggleOptimized, applyOptimized, resetApplied])

  return (
    <SupervisorContext.Provider value={value}>
      {children}
    </SupervisorContext.Provider>
  )
}

export function useSupervisor(): SupervisorContextValue {
  const ctx = useContext(SupervisorContext)
  if (!ctx) throw new Error('useSupervisor must be used within SupervisorProvider')
  return ctx
}

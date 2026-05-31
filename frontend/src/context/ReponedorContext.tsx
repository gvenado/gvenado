import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Reponedor, RutaHoy } from '@/data/mockData'

interface ReponedorContextType {
  reponedor: Reponedor | null
  setReponedor: (r: Reponedor) => void
  clearReponedor: () => void
  isAuthenticated: boolean
  rutaHoy: RutaHoy | null
  setRutaHoy: (r: RutaHoy | null) => void
}

const ReponedorContext = createContext<ReponedorContextType | undefined>(undefined)

function loadSavedReponedor(): Reponedor | null {
  try {
    const saved = localStorage.getItem('asta_reponedor')
    if (!saved) return null
    const parsed = JSON.parse(saved) as Reponedor & { id: unknown }
    // migrate: old mock ids were strings like "rep-001" — clear them
    if (typeof parsed.id === 'string' && isNaN(Number(parsed.id))) {
      localStorage.removeItem('asta_reponedor')
      return null
    }
    if (typeof parsed.id === 'string') parsed.id = Number(parsed.id)
    return parsed as Reponedor
  } catch {
    return null
  }
}

export function ReponedorProvider({ children }: { children: ReactNode }) {
  const [reponedor, setReponedorState] = useState<Reponedor | null>(loadSavedReponedor)
  const [rutaHoy, setRutaHoyState] = useState<RutaHoy | null>(null)

  const setReponedor = useCallback((r: Reponedor) => {
    setReponedorState(r)
    setRutaHoyState(null) // clear stale route when switching reponedor
    localStorage.setItem('asta_reponedor', JSON.stringify(r))
  }, [])

  const clearReponedor = useCallback(() => {
    setReponedorState(null)
    setRutaHoyState(null)
    localStorage.removeItem('asta_reponedor')
  }, [])

  const setRutaHoy = useCallback((r: RutaHoy | null) => {
    setRutaHoyState(r)
  }, [])

  return (
    <ReponedorContext.Provider
      value={{
        reponedor,
        setReponedor,
        clearReponedor,
        isAuthenticated: reponedor !== null,
        rutaHoy,
        setRutaHoy,
      }}
    >
      {children}
    </ReponedorContext.Provider>
  )
}

export function useReponedor() {
  const context = useContext(ReponedorContext)
  if (!context) {
    throw new Error('useReponedor must be used within a ReponedorProvider')
  }
  return context
}

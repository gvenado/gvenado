import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Reponedor } from '@/data/mockData'

interface ReponedorContextType {
  reponedor: Reponedor | null
  setReponedor: (r: Reponedor) => void
  clearReponedor: () => void
  isAuthenticated: boolean
}

const ReponedorContext = createContext<ReponedorContextType | undefined>(undefined)

export function ReponedorProvider({ children }: { children: ReactNode }) {
  const [reponedor, setReponedorState] = useState<Reponedor | null>(() => {
    try {
      const saved = localStorage.getItem('asta_reponedor')
      return saved ? JSON.parse(saved) : null
    } catch {
      return null
    }
  })

  const setReponedor = useCallback((r: Reponedor) => {
    setReponedorState(r)
    localStorage.setItem('asta_reponedor', JSON.stringify(r))
  }, [])

  const clearReponedor = useCallback(() => {
    setReponedorState(null)
    localStorage.removeItem('asta_reponedor')
  }, [])

  return (
    <ReponedorContext.Provider
      value={{
        reponedor,
        setReponedor,
        clearReponedor,
        isAuthenticated: reponedor !== null,
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

import { createContext, useContext, useState, useMemo, type ReactNode } from 'react'
import type { Supervisor, Reponedor, PDV, Alerta } from '@/dashboard/types'
import { mockSupervisor } from '@/dashboard/data/mockSupervisor'
import { mockReponedores, mockOptimizedReponedores } from '@/dashboard/data/mockReponedores'
import { mockPDVs, mockOptimizedPDVs } from '@/dashboard/data/mockPDVs'
import { mockAlertas } from '@/dashboard/data/mockAlertas'

interface SupervisorContextValue {
  supervisor: Supervisor
  reponedores: Reponedor[]
  pdvs: PDV[]
  alertas: Alerta[]
  optimized: boolean
  toggleOptimized: () => void
  optimizedReponedores: Reponedor[]
  optimizedPDVs: PDV[]
}

const SupervisorContext = createContext<SupervisorContextValue | null>(null)

export function SupervisorProvider({ children }: { children: ReactNode }) {
  const [optimized, setOptimized] = useState(false)

  const toggleOptimized = () => setOptimized(prev => !prev)

  const value = useMemo<SupervisorContextValue>(() => ({
    supervisor: mockSupervisor,
    reponedores: mockReponedores,
    pdvs: mockPDVs,
    alertas: mockAlertas,
    optimized,
    toggleOptimized,
    optimizedReponedores: mockOptimizedReponedores,
    optimizedPDVs: mockOptimizedPDVs,
  }), [optimized])

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

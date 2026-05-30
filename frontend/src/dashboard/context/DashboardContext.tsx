import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { formatDate } from '@/dashboard/utils/formatters'

interface DashboardContextValue {
  currentDate: string
  location: string
  pageTitle: string
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useMemo<DashboardContextValue>(() => ({
    currentDate: formatDate(new Date()),
    location: 'La Paz',
    pageTitle: 'Dashboard Supervisor',
  }), [])

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}

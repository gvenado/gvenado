import { createContext, useContext, useMemo, useState, useEffect, useCallback, type ReactNode } from 'react'
import { formatDate } from '@/dashboard/utils/formatters'

const STORAGE_KEY = 'asta_sidebar_collapsed'

interface DashboardContextValue {
  currentDate: string
  location: string
  pageTitle: string
  sidebarCollapsed: boolean
  toggleSidebar: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(sidebarCollapsed))
    } catch { /* noop */ }
  }, [sidebarCollapsed])

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev)
  }, [])

  const value = useMemo<DashboardContextValue>(() => ({
    currentDate: formatDate(new Date()),
    location: 'La Paz',
    pageTitle: 'Dashboard Supervisor',
    sidebarCollapsed,
    toggleSidebar,
  }), [sidebarCollapsed, toggleSidebar])

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

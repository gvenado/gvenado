import { Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { dashboardRoutes } from '@/dashboard'
import { ROUTES } from '@/dashboard/utils/constants'
import { SimuladorPage } from '@/dashboard/pages/SimuladorPage'

function DashboardFallback() {
  return (
    <div className="flex h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-[#DC2626] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm text-[#6B7280]">Loading Dashboard...</p>
      </div>
    </div>
  )
}

function App() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <Routes>
        <Route path={ROUTES.SIMULADOR} element={<SimuladorPage />} />
        {dashboardRoutes
          .filter(r => r.path !== ROUTES.SIMULADOR)
          .map(route => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
        <Route path="*" element={<SimuladorPage />} />
      </Routes>
    </Suspense>
  )
}

export default App

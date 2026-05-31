import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { dashboardRoutes } from '@/dashboard'
import { ROUTES } from '@/dashboard/utils/constants'
import DemoControllerPage from './demo/DemoControllerPage'

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
        <Route path="/demo-control" element={<DemoControllerPage />} />
        {dashboardRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}
        <Route path="*" element={<Navigate to={ROUTES.SIMULADOR} replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

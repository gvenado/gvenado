import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { dashboardRoutes } from '@/dashboard'
import { ROUTES } from '@/dashboard/utils/constants'
import { SimuladorPage } from '@/dashboard/pages/SimuladorPage'
import { LoginPage } from '@/pages/LoginPage'
import { RutaHoyPage } from '@/pages/RutaHoyPage'
import { PDVActualPage } from '@/pages/PDVActualPage'
import { ChecklistPage } from '@/pages/ChecklistPage'
import { CierreDiaPage } from '@/pages/CierreDiaPage'
import { PerfilPage } from '@/pages/PerfilPage'
import { HistorialPage } from '@/pages/HistorialPage'
import { ConfigPage } from '@/pages/ConfigPage'
import { useReponedor } from '@/context/ReponedorContext'
import { MOCK_RUTA_HOY } from '@/data/mockData'

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

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useReponedor()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}

function PdvActualRedirect() {
  const firstId = MOCK_RUTA_HOY.pdvs[0]?.id
  return <Navigate to={`/app/pdv/${firstId}`} replace />
}

function AppRoutes() {
  const { isAuthenticated } = useReponedor()

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/app/ruta-hoy" replace /> : <LoginPage />} />
      <Route
        path={ROUTES.SIMULADOR}
        element={
          <ProtectedRoute>
            <SimuladorPage />
          </ProtectedRoute>
        }
      />
      {dashboardRoutes
        .filter(r => r.path !== ROUTES.SIMULADOR)
        .map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<ProtectedRoute>{route.element}</ProtectedRoute>}
          />
        ))}
      <Route
        path="/app/pdv-actual"
        element={
          <ProtectedRoute>
            <PdvActualRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/ruta-hoy"
        element={
          <ProtectedRoute>
            <RutaHoyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/pdv/:id"
        element={
          <ProtectedRoute>
            <PDVActualPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/pdv/:id/checklist"
        element={
          <ProtectedRoute>
            <ChecklistPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/cierre-dia"
        element={
          <ProtectedRoute>
            <CierreDiaPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/perfil"
        element={
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/historial"
        element={
          <ProtectedRoute>
            <HistorialPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/app/configuracion"
        element={
          <ProtectedRoute>
            <ConfigPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={isAuthenticated ? '/app/ruta-hoy' : '/login'} replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <AppRoutes />
    </Suspense>
  )
}

export default App

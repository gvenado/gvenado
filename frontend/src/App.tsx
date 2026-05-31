import { Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { dashboardRoutes } from '@/dashboard'
import { ROUTES } from '@/dashboard/utils/constants'
import DemoControllerPage from './demo/DemoControllerPage'
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

function ProtectedReponedorRoute({ children }: { children: React.ReactNode }) {
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

function App() {
  const { isAuthenticated } = useReponedor()

  return (
    <Suspense fallback={<DashboardFallback />}>
      <Routes>
        {/* Demo control – no auth required */}
        <Route path="/demo-control" element={<DemoControllerPage />} />

        {/* Mobile replenisher login */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/app/ruta-hoy" replace /> : <LoginPage />}
        />

        {/* Mobile replenisher routes – protected by reponedor auth */}
        <Route path="/app/pdv-actual" element={<ProtectedReponedorRoute><PdvActualRedirect /></ProtectedReponedorRoute>} />
        <Route path="/app/ruta-hoy" element={<ProtectedReponedorRoute><RutaHoyPage /></ProtectedReponedorRoute>} />
        <Route path="/app/pdv/:id" element={<ProtectedReponedorRoute><PDVActualPage /></ProtectedReponedorRoute>} />
        <Route path="/app/pdv/:id/checklist" element={<ProtectedReponedorRoute><ChecklistPage /></ProtectedReponedorRoute>} />
        <Route path="/app/cierre-dia" element={<ProtectedReponedorRoute><CierreDiaPage /></ProtectedReponedorRoute>} />
        <Route path="/app/perfil" element={<ProtectedReponedorRoute><PerfilPage /></ProtectedReponedorRoute>} />
        <Route path="/app/historial" element={<ProtectedReponedorRoute><HistorialPage /></ProtectedReponedorRoute>} />
        <Route path="/app/configuracion" element={<ProtectedReponedorRoute><ConfigPage /></ProtectedReponedorRoute>} />

        {/* Supervisor dashboard routes – open (no reponedor login required) */}
        {dashboardRoutes.map(route => (
          <Route key={route.path} path={route.path} element={route.element} />
        ))}

        {/* Catch-all → supervisor dashboard */}
        <Route path="*" element={<Navigate to={ROUTES.SIMULADOR} replace />} />
      </Routes>
    </Suspense>
  )
}

export default App

import { lazy } from 'react'
import { ROUTES } from '@/dashboard/utils/constants'

const OverviewPage = lazy(() => import('@/dashboard/pages/OverviewPage').then(m => ({ default: m.OverviewPage })))
const MapaVivoPage = lazy(() => import('@/dashboard/pages/MapaVivoPage').then(m => ({ default: m.MapaVivoPage })))
const ReponedoresPage = lazy(() => import('@/dashboard/pages/ReponedoresPage').then(m => ({ default: m.ReponedoresPage })))
const GaleriaPage = lazy(() => import('@/dashboard/pages/GaleriaPage').then(m => ({ default: m.GaleriaPage })))
const DepositosPage = lazy(() => import('@/dashboard/pages/DepositosPage').then(m => ({ default: m.DepositosPage })))
const SimuladorPage = lazy(() => import('@/dashboard/pages/SimuladorPage').then(m => ({ default: m.SimuladorPage })))

export const dashboardRoutes = [
  { path: ROUTES.OVERVIEW, element: <OverviewPage /> },
  { path: ROUTES.MAPA_VIVO, element: <MapaVivoPage /> },
  { path: ROUTES.REPONEDORES, element: <ReponedoresPage /> },
  { path: ROUTES.GALERIA, element: <GaleriaPage /> },
  { path: ROUTES.DEPOSITOS, element: <DepositosPage /> },
  { path: ROUTES.SIMULADOR, element: <SimuladorPage /> },
]

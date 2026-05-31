import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DashboardProvider } from '@/dashboard/context/DashboardContext'
import { SupervisorProvider } from '@/dashboard/context/SupervisorContext'
import { AuthProvider } from '@/context/AuthContext'
import { ReponedorProvider } from '@/context/ReponedorContext'
import './index.css'
import App from './App.tsx'
import { startOfflineMonitor } from './api/offlineQueue'

// Iniciar monitor offline — cuando vuelve la señal procesa la cola automáticamente
startOfflineMonitor(({ procesados, fallidos }) => {
    if (procesados > 0) {
        console.log(`✅ ${procesados} acciones sincronizadas al recuperar señal`)
    }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ReponedorProvider>
          <DashboardProvider>
            <SupervisorProvider>
              <App />
            </SupervisorProvider>
          </DashboardProvider>
        </ReponedorProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)

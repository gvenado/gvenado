import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { DashboardProvider } from '@/dashboard/context/DashboardContext'
import { SupervisorProvider } from '@/dashboard/context/SupervisorContext'
import { AuthProvider } from '@/context/AuthContext'
import { ReponedorProvider } from '@/context/ReponedorContext'
import './index.css'
import App from './App.tsx'

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

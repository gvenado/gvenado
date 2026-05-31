import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Clock, RefreshCw, Settings, HelpCircle, LogOut, ChevronRight, X, MapPin, BadgeCheck, Smartphone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { BottomNav } from '@/components/BottomNav'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { SuccessDialog } from '@/components/SuccessDialog'

function DialogOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl border border-[#E2E8F0] w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

function PerfilDialog({ reponedor, onClose }: { reponedor: { nombre: string; supervisor: string; id: string }; onClose: () => void }) {
  return (
    <DialogOverlay onClose={onClose}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0F172A]">Mi Perfil</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-md border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-50">
            <X className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
        <div className="flex flex-col items-center py-2">
          <div className="w-16 h-16 rounded-full bg-[#DC2626] flex items-center justify-center text-white text-xl font-bold mb-3">
            {reponedor.nombre.charAt(0)}
          </div>
          <h4 className="text-base font-bold text-[#0F172A]">{reponedor.nombre}</h4>
          <p className="text-xs text-[#64748B] mt-0.5">Zona: Centro</p>
        </div>
        <div className="space-y-2.5 mt-3 pt-3 border-t border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            <BadgeCheck className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="text-xs text-[#64748B]">ID:</span>
            <span className="text-xs font-semibold text-[#0F172A]">{reponedor.id}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="text-xs text-[#64748B]">Supervisor:</span>
            <span className="text-xs font-semibold text-[#0F172A]">{reponedor.supervisor}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <MapPin className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="text-xs text-[#64748B]">Zona:</span>
            <span className="text-xs font-semibold text-[#0F172A]">Centro</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Smartphone className="w-4 h-4 text-[#DC2626] shrink-0" />
            <span className="text-xs text-[#64748B]">App:</span>
            <span className="text-xs font-semibold text-[#0F172A]">ASTA Reponedor v1.0.0</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[#DC2626] text-white text-sm font-bold mt-4 active:bg-[#B91C1C] transition-colors"
        >
          Cerrar
        </button>
      </div>
    </DialogOverlay>
  )
}

function AyudaDialog({ onClose }: { onClose: () => void }) {
  return (
    <DialogOverlay onClose={onClose}>
      <div className="px-5 pt-5 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-[#0F172A]">Ayuda y soporte</h3>
          <button onClick={onClose} className="w-7 h-7 rounded-md border border-[#E2E8F0] flex items-center justify-center hover:bg-gray-50">
            <X className="w-3.5 h-3.5 text-[#64748B]" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-[#64748B] leading-relaxed">
          <p>App: <span className="font-semibold text-[#0F172A]">ASTA Reponedor</span></p>
          <p>Versión: <span className="font-semibold text-[#0F172A]">1.0.0</span></p>
          <p>Este asistente te ayuda a gestionar tus rutas de reposición, realizar checklist en PDVs y registrar evidencia fotográfica con análisis de IA.</p>
          <div className="pt-2 border-t border-[#E2E8F0]">
            <p className="font-semibold text-[#0F172A] mb-1">Contacto</p>
            <p>Soporte: soporte@asta.com.bo</p>
            <p>Tel: +591 2 1234567</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full h-11 rounded-xl bg-[#DC2626] text-white text-sm font-bold mt-4 active:bg-[#B91C1C] transition-colors"
        >
          Entendido
        </button>
      </div>
    </DialogOverlay>
  )
}

export function PerfilPage() {
  const navigate = useNavigate()
  const { reponedor, clearReponedor } = useReponedor()
  const [showLogout, setShowLogout] = useState(false)
  const [showPerfil, setShowPerfil] = useState(false)
  const [showAyuda, setShowAyuda] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showSyncSuccess, setShowSyncSuccess] = useState(false)

  if (!reponedor) return null

  const handleSync = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
      setShowSyncSuccess(true)
    }, 2000)
  }

  const confirmLogout = () => {
    setShowLogout(false)
    localStorage.removeItem('asta_settings')
    clearReponedor()
    navigate('/login', { replace: true })
  }

  const menuItems = [
    { icon: User, label: 'Mi perfil', onClick: () => setShowPerfil(true) },
    { icon: Clock, label: 'Historial de visitas', onClick: () => navigate('/app/historial') },
    { icon: RefreshCw, label: 'Sincronizar datos', onClick: handleSync },
    { icon: Settings, label: 'Configuración', onClick: () => navigate('/app/configuracion') },
    { icon: HelpCircle, label: 'Ayuda y soporte', onClick: () => setShowAyuda(true) },
  ]

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <h1 className="text-white text-base font-bold">Perfil</h1>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          <section className="flex flex-col items-center py-6">
            <div className="w-20 h-20 rounded-full bg-[#DC2626] flex items-center justify-center text-white text-2xl font-bold mb-3">
              {reponedor.nombre.charAt(0)}
            </div>
            <h2 className="text-lg font-bold text-[#0F172A]">{reponedor.nombre}</h2>
            <p className="text-sm text-[#64748B] mt-0.5">Zona: Centro · Sup: {reponedor.supervisor}</p>
          </section>

          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm overflow-hidden">
            {menuItems.map((item, idx) => (
              <button
                key={item.label}
                type="button"
                onClick={item.onClick}
                disabled={isSyncing && item.label === 'Sincronizar datos'}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-gray-50',
                  idx !== menuItems.length - 1 && 'border-b border-[#E2E8F0]',
                  isSyncing && item.label === 'Sincronizar datos' && 'opacity-60',
                )}
              >
                <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                  {isSyncing && item.label === 'Sincronizar datos' ? (
                    <div className="w-4 h-4 rounded-full border-2 border-[#DC2626] border-t-transparent animate-spin" />
                  ) : (
                    <item.icon className="w-4 h-4 text-[#DC2626]" />
                  )}
                </div>
                <span className="flex-1 text-sm font-medium text-[#0F172A]">{item.label}</span>
                <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
              </button>
            ))}
          </section>

          <section className="rounded-xl bg-white border border-[#E2E8F0] shadow-sm mt-3 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowLogout(true)}
              className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors active:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center shrink-0">
                <LogOut className="w-4 h-4 text-[#DC2626]" />
              </div>
              <span className="flex-1 text-sm font-medium text-[#DC2626]">Cerrar sesión</span>
              <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
            </button>
          </section>
        </main>

        <BottomNav />

        {showPerfil && <PerfilDialog reponedor={reponedor} onClose={() => setShowPerfil(false)} />}

        {showAyuda && <AyudaDialog onClose={() => setShowAyuda(false)} />}

        <ConfirmationDialog
          open={showLogout}
          title="Cerrar sesión"
          message="¿Estás seguro de cerrar sesión?"
          confirmLabel="Cerrar sesión"
          cancelLabel="Cancelar"
          variant="danger"
          onConfirm={confirmLogout}
          onCancel={() => setShowLogout(false)}
        />

        <SuccessDialog
          open={showSyncSuccess}
          title="Datos sincronizados"
          message="Toda tu información se ha sincronizado correctamente con el servidor."
          buttonLabel="Continuar"
          onClose={() => setShowSyncSuccess(false)}
        />
      </div>
    </div>
  )
}

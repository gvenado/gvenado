import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { MOCK_REPONEDORES, type Reponedor } from '@/data/mockData'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'

function AstaLogoWhite() {
  return (
    <svg width="48" height="48" viewBox="0 0 60 60" fill="none">
      <rect x="2" y="2" width="56" height="56" rx="12" stroke="white" strokeWidth="5" />
      <path d="M30 14L42 44H18Z" stroke="white" strokeWidth="3.5" strokeLinejoin="round" />
      <path d="M23 38H37" stroke="white" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

export function LoginPage() {
  const navigate = useNavigate()
  const { setReponedor, isAuthenticated } = useReponedor()

  const [selected, setSelected] = useState<Reponedor | null>(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showError, setShowError] = useState(false)

  if (isAuthenticated) {
    navigate('/app/ruta-hoy', { replace: true })
    return <LoadingScreen message="Redirigiendo..." />
  }

  const handleSelect = (r: Reponedor) => {
    setSelected(r)
    setDropdownOpen(false)
  }

  const handleStart = () => {
    if (!selected) {
      setShowError(true)
      return
    }
    setIsNavigating(true)
    setReponedor(selected)
    setTimeout(() => {
      navigate('/app/ruta-hoy', { replace: true })
    }, 400)
  }

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <div className="bg-[#DC2626] flex flex-col items-center justify-center px-6 pb-10 pt-14">
          <AstaLogoWhite />
          <h1 className="text-white text-2xl font-bold mt-5 tracking-[-0.02em]">
            ¡Bienvenido!
          </h1>
          <p className="text-white/70 text-sm mt-1.5">
            Seleccioná tu perfil para empezar
          </p>
        </div>

        <div className="flex-1 px-4 -mt-6">
          <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-[#E2E8F0] p-5">
            <div className="relative">
              <label className="block text-[#0F172A] text-xs font-semibold mb-1.5">
                Reponedor
              </label>
              <button
                type="button"
                onClick={() => setDropdownOpen(o => !o)}
                className={cn(
                  'w-full h-14 px-4 rounded-xl border bg-white flex items-center gap-3 transition-all',
                  dropdownOpen ? 'border-[#DC2626] ring-1 ring-[#DC2626]/20' : 'border-[#E2E8F0]',
                )}
              >
                <User className="w-[18px] h-[18px] text-[#94A3B8] shrink-0" />
                <span className={cn(
                  'flex-1 text-left text-[15px]',
                  selected ? 'text-[#0F172A]' : 'text-[#94A3B8]',
                )}>
                  {selected ? selected.nombre : 'Seleccioná un reponedor'}
                </span>
                <ChevronDown className={cn(
                  'w-[18px] h-[18px] text-[#94A3B8] transition-transform',
                  dropdownOpen && 'rotate-180',
                )} />
              </button>

              {dropdownOpen && (
                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#E2E8F0] rounded-xl shadow-lg z-50 overflow-hidden">
                  {MOCK_REPONEDORES.map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => handleSelect(r)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors',
                        selected?.id === r.id
                          ? 'bg-red-50 text-[#DC2626]'
                          : 'text-[#0F172A] hover:bg-gray-50',
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                        selected?.id === r.id ? 'bg-[#DC2626] text-white' : 'bg-gray-100 text-[#64748B]',
                      )}>
                        {r.nombre.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{r.nombre}</p>
                        <p className="text-[11px] text-[#94A3B8]">Sup: {r.supervisor}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleStart}
              disabled={isNavigating || !selected}
              className={cn(
                'w-full h-[52px] rounded-2xl flex items-center justify-center gap-2.5 text-white text-base font-bold transition-all mt-5',
                !selected
                  ? 'bg-[#DC2626]/40 cursor-not-allowed'
                  : isNavigating
                    ? 'bg-[#DC2626]/70 cursor-not-allowed'
                    : 'bg-[#DC2626] active:bg-[#B91C1C] active:scale-[0.98] shadow-sm shadow-red-200',
              )}
            >
              {isNavigating ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                  Iniciando...
                </>
              ) : (
                'Empezar mi día'
              )}
            </button>
          </div>
        </div>

        <ConfirmationDialog
          open={showError}
          title="Seleccioná un reponedor"
          message="Debés seleccionar un reponedor antes de empezar tu ruta."
          confirmLabel="Entendido"
          cancelLabel=""
          variant="info"
          onConfirm={() => setShowError(false)}
          onCancel={() => setShowError(false)}
        />
      </div>
    </div>
  )
}

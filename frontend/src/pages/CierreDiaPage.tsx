import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Clock, Target, TrendingUp, Check, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { fetchDaySummary } from '@/services/api'
import type { DaySummary } from '@/types'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { BottomNav } from '@/components/BottomNav'

export function CierreDiaPage() {
  const navigate = useNavigate()
  const { reponedor, clearReponedor } = useReponedor()
  const [summary, setSummary] = useState<DaySummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    fetchDaySummary(reponedor?.id).then(data => {
      if (!cancelled) {
        setSummary(data)
        setIsLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setError('No se pudo cargar el resumen del día.')
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [])

  if (!reponedor) return <LoadingScreen message="Verificando sesión..." />

  const handleFinalize = () => {
    setShowConfirm(true)
  }

  const handleConfirmFinalize = () => {
    setShowConfirm(false)
    setIsFinalizing(true)
    clearReponedor()
    setTimeout(() => {
      navigate('/login', { replace: true })
    }, 400)
  }

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div>
            <h1 className="text-white text-base font-bold">Tu día</h1>
            <p className="text-white/60 text-[10px] mt-0.5">
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).replace(/^\w/, c => c.toUpperCase())}
            </p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {isLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-100 animate-pulse mb-2" />
                    <div className="h-6 w-12 bg-gray-100 rounded animate-pulse mb-1" />
                    <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                  </div>
                ))}
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                  <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse mb-2" />
                  <div className="h-2 w-full bg-gray-100 rounded animate-pulse mb-1" />
                  <div className="h-2 w-3/4 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-[#64748B]">{error}</p>
            </div>
          ) : summary ? (
            <>
              <section className="grid grid-cols-2 gap-2">
                {[
                  { icon: Store, value: `${summary.pdvsCompletados}/${summary.totalPdvs}`, label: 'PDVs visitados' },
                  { icon: Clock, value: summary.tiempoTrabajado, label: 'Tiempo trabajado' },
                  { icon: Target, value: `${summary.microTareasCompletadas}/${summary.totalMicroTareas}`, label: 'Micro-tareas completadas' },
                  { icon: TrendingUp, value: `${summary.eficienciaPOP}%`, label: 'Eficiencia' },
                ].map(stat => (
                  <div key={stat.label} className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                    <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                      <stat.icon className="w-4 h-4 text-[#DC2626]" />
                    </div>
                    <p className="text-xl font-bold text-[#0F172A] leading-none">{stat.value}</p>
                    <p className="text-[9px] text-[#64748B] mt-1">{stat.label}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold text-[#0F172A]">
                    POP ejecutado
                    <span className="text-[9px] text-[#64748B] font-medium ml-1">vs planificado</span>
                  </h3>
                  <span className="text-[9px] font-semibold text-[#DC2626]">{summary.eficienciaPOP}%</span>
                </div>
                <div className="space-y-2">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-[#64748B]">Marca precios</span>
                      <span className="text-[9px] font-semibold text-[#0F172A]">{summary.popUsado.marcaPrecios}/{summary.popPlanificado.marcaPrecios}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#DC2626] transition-all duration-700"
                        style={{ width: `${(summary.popUsado.marcaPrecios / summary.popPlanificado.marcaPrecios) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-[#64748B]">Colgantes</span>
                      <span className="text-[9px] font-semibold text-[#0F172A]">{summary.popUsado.colgantes}/{summary.popPlanificado.colgantes}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#DC2626] transition-all duration-700"
                        style={{ width: `${(summary.popUsado.colgantes / summary.popPlanificado.colgantes) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] text-[#64748B]">Cenefas</span>
                      <span className="text-[9px] font-semibold text-[#0F172A]">{summary.popUsado.cenefas}/{summary.popPlanificado.cenefas}</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#DC2626] transition-all duration-700"
                        style={{ width: `${(summary.popUsado.cenefas / summary.popPlanificado.cenefas) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                  <h3 className="text-xs font-bold text-[#0F172A]">Faces ganadas</h3>
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">{summary.facesGanadas}</p>
              </section>

              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-xs font-bold text-[#0F172A]">Ranking semanal</h3>
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">
                  #{summary.posicionSemanal}
                  <span className="text-[11px] text-[#64748B] font-medium ml-1">
                    de {summary.totalReponedores} reponedores
                  </span>
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
                  {[
                    { rank: 1, name: 'María Rojas', faces: 45, isCurrent: false },
                    { rank: 2, name: 'Juan Pérez', faces: 43, isCurrent: false },
                    { rank: 3, name: reponedor.nombre, faces: summary.facesGanadas, isCurrent: true },
                    { rank: 4, name: 'Ana Silva', faces: 38, isCurrent: false },
                    { rank: 5, name: 'Pedro Ruiz', faces: 36, isCurrent: false },
                  ].map(entry => (
                    <div
                      key={entry.rank}
                      className={cn(
                        'flex items-center justify-between py-1.5 px-2 rounded-lg',
                        entry.isCurrent && 'bg-red-50',
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          'w-5 text-center text-xs font-bold',
                          entry.rank === 1 ? 'text-[#F59E0B]' : entry.rank === 2 ? 'text-[#94A3B8]' : entry.rank === 3 ? 'text-[#CD7F32]' : 'text-[#94A3B8]',
                        )}>
                          {entry.rank === 1 ? '1' : entry.rank === 2 ? '2' : entry.rank === 3 ? '3' : `#${entry.rank}`}
                        </span>
                        <span className={cn(
                          'text-[11px]',
                          entry.isCurrent ? 'text-[#DC2626] font-bold' : 'text-[#0F172A]',
                        )}>
                          {entry.name}
                        </span>
                      </div>
                      <span className={cn(
                        'text-[11px]',
                        entry.isCurrent ? 'text-[#DC2626] font-bold' : 'text-[#64748B]',
                      )}>
                        {entry.faces}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          ) : null}
        </main>

        <BottomNav />

        <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 pt-2.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleFinalize}
            disabled={isFinalizing || isLoading}
            className={cn(
              'w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-bold transition-all',
              isLoading
                ? 'bg-[#DC2626]/40 cursor-not-allowed'
                : isFinalizing
                  ? 'bg-[#DC2626]/70 cursor-not-allowed'
                  : 'bg-[#DC2626] active:bg-[#B91C1C] shadow-sm shadow-red-200',
            )}
          >
            {isFinalizing ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Finalizando...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Finalizar día y devolver mochila
              </>
            )}
          </button>
        </div>

        <ConfirmationDialog
          open={showConfirm}
          title="Finalizar día"
          message="¿Estás seguro de finalizar tu día? Recordá devolver el material restante a tu supervisor."
          confirmLabel="Finalizar"
          cancelLabel="Cancelar"
          variant="info"
          onConfirm={handleConfirmFinalize}
          onCancel={() => setShowConfirm(false)}
        />
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Store, Clock, Target, TrendingUp, Check, Trophy, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { api } from '@/api/client'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ConfirmationDialog } from '@/components/ConfirmationDialog'
import { BottomNav } from '@/components/BottomNav'

interface SummaryData {
  // ── REAL: sourced from backend + route context ─────────────────────────────
  pdvsCompletados: number    // from GET /api/visitas/hoy (estado='completada')
  totalPdvs: number          // from ruta-hoy context (route PDV count)
  pdvsPendientes: number     // derived: totalPdvs - pdvsCompletados

  // ── DEMO / DERIVED: no backend endpoint yet ────────────────────────────────
  tiempoTrabajado: string    // demo: not tracked server-side
  eficienciaPOP: number      // derived from completados/total
  facesGanadas: number       // demo: vision data not aggregated per reponedor
  posicionSemanal: number    // demo: ranking not computed server-side
  totalReponedores: number   // demo
}

function todayISODate(): string {
  return new Date().toISOString().split('T')[0]
}

export function CierreDiaPage() {
  const navigate = useNavigate()
  const { reponedor, rutaHoy, clearReponedor } = useReponedor()
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [isFinalizing, setIsFinalizing] = useState(false)

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    setError(null)

    async function load() {
      // REAL: total PDVs comes from the route loaded at session start
      const totalPdvs = rutaHoy?.pdvs.length ?? 0

      // REAL: completed visits fetched from backend
      let pdvsCompletados = 0
      try {
        if (reponedor?.id) {
          const visitas = await api.getVisitasHoy(todayISODate(), reponedor.id)
          pdvsCompletados = visitas.filter(v => v.estado === 'completada').length
        }
      } catch {
        // backend unavailable — completed count stays 0
      }

      if (!cancelled) {
        setSummary({
          // REAL
          pdvsCompletados,
          totalPdvs,
          pdvsPendientes: Math.max(0, totalPdvs - pdvsCompletados),
          // DERIVED from real data
          eficienciaPOP: totalPdvs > 0 ? Math.round((pdvsCompletados / totalPdvs) * 100) : 0,
          // DEMO — no server-side data for these yet
          tiempoTrabajado: '—',
          facesGanadas: 0,
          posicionSemanal: 3,
          totalReponedores: 8,
        })
        setIsLoading(false)
      }
    }

    load().catch(() => {
      if (!cancelled) {
        setError('No se pudo cargar el resumen del día.')
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [reponedor?.id, rutaHoy])

  if (!reponedor) return <LoadingScreen message="Verificando sesión..." />

  const handleConfirmFinalize = () => {
    setShowConfirm(false)
    setIsFinalizing(true)
    clearReponedor()
    setTimeout(() => navigate('/login', { replace: true }), 400)
  }

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className="w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col">
        <header className="shrink-0 bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div>
            <h1 className="text-white text-base font-bold">Tu día</h1>
            <p className="text-white/60 text-[10px] mt-0.5">
              {new Date().toLocaleDateString('es-ES', {
                weekday: 'long', day: 'numeric', month: 'long',
              }).replace(/^\w/, c => c.toUpperCase())}
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
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-sm text-[#64748B]">{error}</p>
            </div>
          ) : summary ? (
            <>
              {/* Pending PDVs warning */}
              {summary.pdvsPendientes > 0 && (
                <div className="flex items-center gap-2 p-3 mb-3 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <p className="text-[11px] text-amber-700 font-medium">
                    Tenés {summary.pdvsPendientes} PDV{summary.pdvsPendientes > 1 ? 's' : ''} pendiente{summary.pdvsPendientes > 1 ? 's' : ''}
                  </p>
                </div>
              )}

              {/* KPI grid — real + derived values */}
              <section className="grid grid-cols-2 gap-2">
                {/* REAL */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                    <Store className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <p className="text-xl font-bold text-[#0F172A] leading-none">
                    {summary.pdvsCompletados}/{summary.totalPdvs}
                  </p>
                  <p className="text-[9px] text-[#64748B] mt-1">PDVs visitados</p>
                </div>

                {/* REAL (derived) */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                    <Target className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <p className="text-xl font-bold text-[#0F172A] leading-none">
                    {summary.pdvsPendientes}
                  </p>
                  <p className="text-[9px] text-[#64748B] mt-1">PDVs pendientes</p>
                </div>

                {/* DEMO */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                    <Clock className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <p className="text-xl font-bold text-[#0F172A] leading-none">{summary.tiempoTrabajado}</p>
                  <p className="text-[9px] text-[#64748B] mt-1">Tiempo trabajado</p>
                </div>

                {/* REAL (derived) */}
                <div className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-2">
                    <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                  </div>
                  <p className="text-xl font-bold text-[#0F172A] leading-none">{summary.eficienciaPOP}%</p>
                  <p className="text-[9px] text-[#64748B] mt-1">Eficiencia del día</p>
                </div>
              </section>

              {/* Faces ganadas — DEMO */}
              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-[#DC2626]" />
                  <h3 className="text-xs font-bold text-[#0F172A]">Faces ganadas</h3>
                  <span className="text-[8px] text-[#94A3B8] ml-auto">Demo</span>
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">{summary.facesGanadas}</p>
                <p className="text-[9px] text-[#94A3B8] mt-0.5">
                  Dato no disponible aún — pendiente integración de análisis visual.
                </p>
              </section>

              {/* Ranking semanal — DEMO */}
              <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Trophy className="w-4 h-4 text-[#F59E0B]" />
                  <h3 className="text-xs font-bold text-[#0F172A]">Ranking semanal</h3>
                  <span className="text-[8px] text-[#94A3B8] ml-auto">Demo</span>
                </div>
                <p className="text-2xl font-bold text-[#0F172A]">
                  #{summary.posicionSemanal}
                  <span className="text-[11px] text-[#64748B] font-medium ml-1">
                    de {summary.totalReponedores} reponedores
                  </span>
                </p>
                <div className="mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
                  {/* DEMO ranking list — hardcoded until ranking API exists */}
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
                          entry.rank === 1 ? 'text-[#F59E0B]'
                            : entry.rank === 2 ? 'text-[#94A3B8]'
                              : entry.rank === 3 ? 'text-[#CD7F32]'
                                : 'text-[#94A3B8]',
                        )}>
                          {entry.rank <= 3 ? `${entry.rank}` : `#${entry.rank}`}
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
            onClick={() => setShowConfirm(true)}
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

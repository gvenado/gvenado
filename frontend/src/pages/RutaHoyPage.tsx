import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShoppingBag,
  Tags,
  Ticket,
  Layout,
  Store,
  Clock,
  MapPin,
  ArrowRight,
  ChevronRight,
  CalendarX,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { fetchRutaHoy } from '@/services/api'
import type { RutaHoy } from '@/data/mockData'
import { DEMO_DATE } from '@/config/demo'
import { ErrorState } from '@/components/ErrorState'
import { LoadingScreen } from '@/components/LoadingScreen'
import { BottomNav } from '@/components/BottomNav'

const CATEGORY_BADGES: Record<string, string> = {
  'MINORISTA': 'bg-red-50 text-[#DC2626]',
  'MAYORISTA': 'bg-orange-50 text-[#EA580C]',
  'DETALLISTA': 'bg-amber-50 text-[#D97706]',
  'Supermercado': 'bg-red-50 text-[#DC2626]',
  'Hipermercado': 'bg-orange-50 text-[#EA580C]',
  'Centro Comercial': 'bg-amber-50 text-[#D97706]',
}

function formatDate(): string {
  return new Date(`${DEMO_DATE}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).replace(/^\w/, c => c.toUpperCase())
}

function getGreeting(): string {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

function AstaLogoWhite() {
  return (
    <svg width="22" height="22" viewBox="0 0 60 60" fill="none">
      <path d="M30 4L36 22H52L38 32L44 50L30 40L16 50L22 32L8 22H24L30 4Z" fill="white" />
    </svg>
  )
}

export function RutaHoyPage() {
  const navigate = useNavigate()
  const { reponedor, setRutaHoy } = useReponedor()
  const [rutaData, setRutaData] = useState<RutaHoy | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const load = (rep: NonNullable<typeof reponedor>) => {
    setIsLoading(true)
    setError(null)
    fetchRutaHoy(rep.id)
      .then(d => {
        setRutaData(d)
        setRutaHoy(d)
        setIsLoading(false)
      })
      .catch(() => {
        setError('No se pudo cargar la ruta. Verificá tu conexión.')
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (!reponedor) return
    let cancelled = false
    setIsLoading(true)
    setError(null)
    fetchRutaHoy(reponedor.id)
      .then(d => {
        if (!cancelled) {
          setRutaData(d)
          setRutaHoy(d)
          setIsLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError('No se pudo cargar la ruta. Verificá tu conexión.')
          setIsLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [reponedor?.id])

  if (!reponedor) return <LoadingScreen message="Verificando sesión..." />

  const handleRetry = () => load(reponedor)

  const handleStartRoute = () => {
    setConfirmed(true)
    const firstPdvId = rutaData?.pdvs[0]?.id
    setTimeout(() => navigate(firstPdvId != null ? `/app/pdv/${firstPdvId}` : '/app/ruta-hoy'), 400)
  }

  const nextPdv = rutaData?.pdvs[0]
  const remainingPdvs = rutaData?.pdvs.slice(1) ?? []

  const container = 'w-full max-w-[375px] min-h-dvh bg-[#F8FAFC] flex flex-col'

  if (error) {
    return (
      <div className="min-h-dvh bg-[#0F172A] flex justify-center">
        <div className={container}>
          <header className="bg-[#DC2626] px-4 pt-3 pb-3">
            <p className="text-white/70 text-[11px] font-medium">{getGreeting()},</p>
            <h1 className="text-white text-base font-bold mt-0.5">{reponedor.nombre}</h1>
            <p className="text-white/40 text-[10px] mt-1">{formatDate()}</p>
          </header>
          <ErrorState title="Sin conexión" message={error} onRetry={handleRetry} fullScreen={false} className="flex-1" />
        </div>
      </div>
    )
  }

  const emptyRoute = !isLoading && rutaData != null && rutaData.pdvs.length === 0

  return (
    <div className="min-h-dvh bg-[#0F172A] flex justify-center">
      <div className={container}>
        <header className="bg-[#DC2626] px-4 pt-3 pb-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-[11px] font-medium">{getGreeting()},</p>
              <h1 className="text-white text-base font-bold mt-0.5 leading-tight">{reponedor.nombre}</h1>
            </div>
            <AstaLogoWhite />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-white/40 text-[10px]">{formatDate()}</p>
            <span className="text-white/20">·</span>
            <p className="text-white/40 text-[10px]">Sup: {reponedor.supervisor}</p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto px-3 pt-3 pb-2">
          {isLoading ? (
            <div className="space-y-3">
              <div className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="w-3.5 h-3.5 rounded bg-gray-100 animate-pulse" />
                  <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="flex-1 rounded-lg bg-[#F8FAFC] px-3 py-2.5">
                      <div className="h-7 w-8 bg-gray-100 rounded animate-pulse mx-auto" />
                      <div className="h-2 w-10 bg-gray-100 rounded animate-pulse mx-auto mt-1" />
                    </div>
                  ))}
                </div>
              </div>
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-xl bg-white border border-[#E2E8F0] p-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3.5 h-3.5 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 flex-1 bg-gray-100 rounded animate-pulse" />
                    <div className="w-3 h-3 bg-gray-100 rounded animate-pulse" />
                  </div>
                  <div className="h-2.5 w-2/3 bg-gray-100 rounded mt-1.5 animate-pulse" />
                  <div className="flex gap-1.5 mt-1.5">
                    <div className="h-3.5 w-14 bg-gray-100 rounded animate-pulse" />
                    <div className="h-3.5 w-10 bg-gray-100 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : emptyRoute ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <div className="w-14 h-14 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center mb-4">
                <CalendarX className="w-7 h-7 text-[#94A3B8]" />
              </div>
              <p className="text-sm font-semibold text-[#0F172A] text-center">Sin visitas programadas hoy</p>
              <p className="text-xs text-[#64748B] mt-1 text-center">
                No tenés PDVs asignados para este día. Consultá con tu supervisor.
              </p>
            </div>
          ) : rutaData ? (
            <>
              <section className="rounded-xl bg-white border border-[#E2E8F0] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-[#DC2626]" />
                    <h2 className="text-[13px] font-bold text-[#0F172A]">Mi Mochila Inteligente</h2>
                  </div>
                  {rutaData.tiempo_estimado != null && (
                    <span className="text-[10px] font-semibold text-[#64748B] flex items-center gap-0.5">
                      <Clock className="w-3 h-3" />
                      ~{formatMinutes(rutaData.tiempo_estimado)}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {[
                    { icon: Tags, label: 'Marca precios', count: rutaData.mochila.marcaPrecios },
                    { icon: Ticket, label: 'Colgantes', count: rutaData.mochila.colgantes },
                    { icon: Layout, label: 'Cenefas', count: rutaData.mochila.cenefas },
                  ].map(item => (
                    <div key={item.label} className="flex-1 bg-[#F8FAFC] rounded-xl px-3 py-2.5 border border-[#E2E8F0] text-center">
                      <item.icon className="w-4 h-4 text-[#DC2626] mx-auto mb-1" />
                      <p className="text-2xl font-bold text-[#0F172A] leading-none">{item.count}</p>
                      <p className="text-[9px] text-[#64748B] mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
              </section>

              {nextPdv && (
                <section className="mt-3">
                  <p className="text-[10px] font-semibold text-[#64748B] mb-1.5 uppercase tracking-wider">Siguiente visita</p>
                  <button
                    type="button"
                    onClick={() => navigate(`/app/pdv/${nextPdv.id}`)}
                    className="w-full text-left rounded-xl bg-white border border-[#DC2626]/20 p-3.5 shadow-sm active:brightness-95 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                        <Store className="w-5 h-5 text-[#DC2626]" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#0F172A] truncate">{nextPdv.name}</h3>
                          <span className="text-[9px] font-semibold text-[#DC2626] bg-red-50 px-1.5 py-0.5 rounded shrink-0">
                            {nextPdv.category}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#64748B] mt-0.5 flex items-center gap-1">
                          <MapPin className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">{nextPdv.address}</span>
                          <span className="shrink-0">· ~{nextPdv.duration}</span>
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#94A3B8] shrink-0" />
                    </div>
                  </button>
                </section>
              )}

              {remainingPdvs.length > 0 && (
                <section className="mt-3">
                  <p className="text-[10px] font-semibold text-[#64748B] mb-1.5 uppercase tracking-wider">
                    Ruta de hoy · {rutaData.pdvs.length} PDVs
                  </p>
                  <div className="space-y-2">
                    {rutaData.pdvs.map((pdv, idx) => (
                      <button
                        key={pdv.id}
                        type="button"
                        onClick={() => navigate(`/app/pdv/${pdv.id}`)}
                        className="w-full text-left rounded-lg bg-white border border-[#E2E8F0] p-3 active:brightness-95 transition-all"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-[#64748B]">{idx + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-semibold text-[#0F172A] truncate">{pdv.name}</h4>
                              <span className={cn(
                                'text-[8px] font-semibold px-1.5 py-0.5 rounded shrink-0',
                                CATEGORY_BADGES[pdv.category] || 'bg-gray-50 text-[#64748B]',
                              )}>{pdv.category}</span>
                            </div>
                            <p className="text-[9px] text-[#64748B] mt-0.5 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 shrink-0" />
                              <span className="truncate">{pdv.address}</span>
                              <span className="shrink-0">· {pdv.duration}</span>
                            </p>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-[#CBD5E1] shrink-0" />
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}
            </>
          ) : null}
        </main>

        <BottomNav />

        <div className="shrink-0 bg-white border-t border-[#E2E8F0] px-4 pt-2.5 pb-[max(8px,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={handleStartRoute}
            disabled={confirmed || isLoading || !rutaData || emptyRoute}
            className={cn(
              'w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-bold transition-all',
              !rutaData || isLoading || emptyRoute
                ? 'bg-[#DC2626]/40 cursor-not-allowed'
                : confirmed
                  ? 'bg-[#DC2626]/70 cursor-not-allowed'
                  : 'bg-[#DC2626] active:bg-[#B91C1C] shadow-sm shadow-red-200',
            )}
          >
            {confirmed ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
                  <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                </svg>
                Cargando ruta...
              </>
            ) : (
              <>
                Confirmar carga de mochila
                <ArrowRight className="w-4 h-4" />
                Empezar ruta
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

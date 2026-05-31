import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users,
  Target,
  GitCompare,
  Zap,
  ArrowRight,
  CheckCircle2,
  Download,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Split,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { SimuladorMapa } from '@/dashboard/components/SimuladorMapa'
import { Toast } from '@/dashboard/components/Toast'
import { ConfirmDialog } from '@/dashboard/components/ConfirmDialog'
import { useSupervisor } from '@/dashboard/context/SupervisorContext'
import { collectExportData, exportPDF, exportExcel, exportGeoJSON } from '@/dashboard/services/exportService'
import type { PDV, Reponedor } from '@/dashboard/types'

function useCountUp(target: number, duration: number, active: boolean) {
  const [value, setValue] = useState(0)
  const startedRef = useRef(false)

  useEffect(() => {
    if (!active || startedRef.current) return
    startedRef.current = true
    let startTime: number | null = null
    function tick(now: number) {
      if (!startTime) startTime = now
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * progress))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [active, target, duration])

  return value
}

interface SimulatorPageProps {
  page?: string
}

function buildRoutes(pdvs: PDV[], reponedores: Reponedor[]) {
  return reponedores.map(rep => {
    const repPdvs = pdvs
      .filter(p => p.reponedorId === rep.id)
      .sort((a, b) => a.visitOrder - b.visitOrder)
    return {
      reponedorId: rep.id,
      color: rep.color,
      points: repPdvs.map(p => ({ lat: p.lat, lng: p.lng })),
    }
  }).filter(r => r.points.length > 0)
}

export function SimuladorPage(_props: SimulatorPageProps) {
  const [searchParams] = useSearchParams()
  const {
    reponedores,
    pdvs,
    optimized,
    toggleOptimized,
    optimizedReponedores,
    optimizedPDVs,
    applied,
    applyOptimized,
    resetApplied,
  } = useSupervisor()

  const [animating, setAnimating] = useState(false)
  const [showOptimized, setShowOptimized] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [sourceRepId, setSourceRepId] = useState<string | null>(null)

  /* Read ?source= param from URL */
  useEffect(() => {
    const source = searchParams.get('source')
    if (source) {
      setSourceRepId(source)
    }
  }, [searchParams])
  const [toast, setToast] = useState<{ visible: boolean; type: 'success' | 'error' | 'info'; title: string; message?: string }>({
    visible: false, type: 'success', title: '', message: '',
  })

  const currentRoutes = useMemo(() => buildRoutes(pdvs, reponedores), [pdvs, reponedores])
  const optimizedRoutes = useMemo(
    () => buildRoutes(optimizedPDVs, optimizedReponedores),
    [optimizedPDVs, optimizedReponedores]
  )

  const displayPdvs = showOptimized ? optimizedPDVs : pdvs
  const displayRoutes = showOptimized ? optimizedRoutes : currentRoutes

  const overloadedCount = reponedores.filter(r => r.status === 'overloaded').length
  const optimizedOverloaded = optimizedReponedores.filter(r => r.status === 'overloaded').length

  const reassignedCount = useCountUp(12, 2500, showOptimized)

  const showToast = useCallback((type: 'success' | 'error' | 'info', title: string, message?: string) => {
    setToast({ visible: true, type, title, message })
  }, [])

  const closeToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }))
  }, [])

  const handleOptimize = useCallback(() => {
    if (applied) resetApplied()
    setAnimating(true)
    setTimeout(() => {
      setShowOptimized(true)
      toggleOptimized()
      setTimeout(() => setAnimating(false), 600)
    }, 800)
  }, [toggleOptimized, applied, resetApplied])

  const resetSimulation = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setShowOptimized(false)
      if (optimized) toggleOptimized()
      setTimeout(() => setAnimating(false), 600)
    }, 400)
  }, [optimized, toggleOptimized])

  const handleApplyRedistribution = useCallback(() => {
    if (!showOptimized || applied) return
    setConfirmOpen(true)
  }, [showOptimized, applied])

  const handleConfirmApply = useCallback(() => {
    setConfirmOpen(false)
    applyOptimized()
    showToast('success', 'Redistribución aplicada correctamente', 'El plan de redistribución ha sido programado para el próximo ciclo operativo.')
  }, [applyOptimized, showToast])

  const handleCancelApply = useCallback(() => {
    setConfirmOpen(false)
  }, [])

  const handleExport = useCallback((format: string) => {
    const kpiData = [
      { label: 'Km ahorrados', value: '-23%' },
      { label: 'Reponedores sobrecargados', value: '4' },
      { label: 'Cobertura de canal', value: '100%' },
      { label: 'Tiempo recuperado', value: '4h 20m' },
    ]
    const impactData = [
      { label: 'PDVs reasignados', value: '12' },
      { label: 'Menos distancia recorrida', value: '23%' },
      { label: 'Sobrecargas resueltas', value: '4' },
      { label: 'Cobertura de canal', value: '100%' },
    ]
    const reassignments = [
      { from: 'Rep. 1', to: 'Rep. 5', pdvs: 5 },
      { from: 'Rep. 2', to: 'Rep. 6', pdvs: 3 },
      { from: 'Rep. 3', to: 'Rep. 7', pdvs: 2 },
    ]

    const data = collectExportData({
      supervisor: 'Supervisor LPZ',
      location: 'La Paz, Bolivia',
      kpiData,
      reassignments,
      impactData,
      routes: optimizedRoutes,
      pdvs: displayPdvs.filter(p => p.reponedorId !== '').map(p => ({
        id: p.id, lat: p.lat, lng: p.lng, status: p.status, reponedorId: p.reponedorId,
      })),
    })

    try {
      if (format === 'pdf') {
        exportPDF(data)
        showToast('success', 'PDF exportado correctamente')
      } else if (format === 'xlsx') {
        exportExcel(data)
        showToast('success', 'Excel exportado correctamente')
      } else if (format === 'geojson') {
        exportGeoJSON(data)
        showToast('success', 'GeoJSON exportado correctamente')
      }
    } catch {
      showToast('error', 'Error al exportar', 'No se pudo generar el archivo solicitado.')
    }
  }, [optimizedRoutes, displayPdvs, showToast])

  return (
    <DashboardLayout currentPage="Simulador">
      <div className="p-4 space-y-4">
        {/* ===== SIMULATOR CONTROL PANEL ===== */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0">
                <GitCompare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#111827]">Simulador de redistribución</h2>
                <p className="text-xs text-[#6B7280] mt-0.5 max-w-xl">
                  Redistribuir PDVs entre los reponedores para equilibrar cargas de trabajo,
                  reducir la distancia de viaje y mejorar la cobertura de canal.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {showOptimized ? (
                <button
                  onClick={resetSimulation}
                  disabled={animating}
                  className="px-4 py-2 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-xs font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                >
                  <RefreshCw className={cn('w-3.5 h-3.5', animating && 'animate-spin')} />
                  Restablecer
                </button>
              ) : (
                <button
                  onClick={handleOptimize}
                  disabled={animating}
                  className="px-5 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {animating ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Zap className="w-3.5 h-3.5" />
                  )}
                  {animating ? 'Optimizando...' : 'Optimizar redistribución'}
                </button>
              )}

              <div className="bg-[#FEF2F2] rounded-lg px-3 py-2 max-w-[180px] border border-[#FECACA]">
                <div className="flex items-center gap-1 text-[#DC2626]">
                  <Sparkles className="w-3 h-3" />
                  <span className="text-[9px] font-semibold uppercase tracking-wider">Informe IA</span>
                </div>
                <p className="text-[10px] text-[#991B1B] mt-0.5 leading-snug">
                  Redistribuir 12 PDVs entre 3 trabajadores puede reducir el viaje en un 23%.
                </p>
              </div>
            </div>
          </div>

          {animating && (
            <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#DC2626] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          )}
        </div>

        {/* ===== SOURCE REPLENISHER BANNER ===== */}
        {sourceRepId && (
          <div className="bg-[#FEF2F2] rounded-lg border border-[#FECACA] px-4 py-2.5 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
            <p className="text-xs text-[#111827]">
              Reponedor <strong className="font-semibold">{sourceRepId.toUpperCase()}</strong> seleccionado desde la vista de reponedores. Sus datos de carga están resaltados en el panel <strong className="font-semibold">Estado actual</strong>.
            </p>
          </div>
        )}

        {/* ===== MAIN COMPARISON SECTION ===== */}
        <div className="grid grid-cols-12 gap-3">
          {/* LEFT - Current State */}
          <div className="col-span-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all duration-500">
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Estado actual</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                  {overloadedCount} Sobrecargados
                </span>
              </div>
              <BarChart3 className="w-4 h-4 text-[#6B7280]" />
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-7 p-2.5">
                <SimuladorMapa
                  pdvs={pdvs.filter(p => p.reponedorId !== '').map(p => ({
                    id: p.id,
                    lat: p.lat,
                    lng: p.lng,
                    status: p.status,
                    reponedorId: p.reponedorId,
                  }))}
                  routes={currentRoutes}
                  className={cn('transition-all duration-700', animating && 'opacity-50 scale-[0.98]')}
                />
              </div>
              <div className="col-span-5 p-2.5 space-y-1">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Carga por trabajador</p>
                {reponedores.map(rep => {
                  const isSource = sourceRepId !== null && (rep.id === sourceRepId || rep.name.toLowerCase().includes(sourceRepId.toLowerCase()))
                  return (
                    <div key={rep.id} className={cn('flex items-center gap-1.5 rounded px-1 -mx-1', isSource && 'bg-[#FEF2F2] ring-1 ring-[#DC2626] py-0.5')}>
                      <div
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: rep.color }}
                      />
                      <span className={cn('text-[10px] flex-1 truncate', isSource ? 'font-bold text-[#111827]' : 'text-[#6B7280]')}>{rep.name}</span>
                      <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(rep.workload, 100)}%`,
                            backgroundColor: rep.workload > 85 ? '#DC2626' : rep.workload >= 70 ? '#F59E0B' : '#16A34A',
                          }}
                        />
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold w-7 text-right',
                        rep.workload > 85 ? 'text-[#DC2626]' : rep.workload >= 70 ? 'text-[#F59E0B]' : 'text-[#16A34A]'
                      )}>
                        {rep.workload}%
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="px-4 py-2 bg-[#FEF2F2] border-t border-[#FECACA]">
              <div className="flex items-center gap-1.5 text-[#DC2626]">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">
                  {overloadedCount} reponedores sobrecargados • 54% desequilibrio de carga
                </span>
              </div>
            </div>
          </div>

          {/* CENTER - Redistribution Actions */}
          <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-3 flex flex-col items-center justify-center transition-all duration-500">
            <div className="text-center mb-3">
              <div className="w-8 h-8 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-1.5">
                <Split className="w-4 h-4 text-[#DC2626]" />
              </div>
              <h3 className="text-xs font-bold text-[#111827]">Acciones de redistribución</h3>
              <p className="text-[9px] text-[#6B7280] mt-0.5">Transferencias pendientes</p>
            </div>

            <div className="space-y-2.5 w-full">
              <div className={cn(
                'text-center p-2.5 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-xl font-black text-[#DC2626]">5</span>
                  <span className="text-[10px] text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 my-0.5">
                  <span className="text-[10px] font-medium text-[#6B7280]">Rep. 1</span>
                  <ArrowRight className={cn(
                    'w-4 h-4 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-0.5' : 'text-[#DC2626]'
                  )} />
                  <span className="text-[10px] font-bold text-[#16A34A]">Rep. 5</span>
                </div>
              </div>

              <div className={cn(
                'text-center p-2.5 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-xl font-black text-[#DC2626]">3</span>
                  <span className="text-[10px] text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 my-0.5">
                  <span className="text-[10px] font-medium text-[#6B7280]">Rep. 2</span>
                  <ArrowRight className={cn(
                    'w-4 h-4 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-0.5' : 'text-[#DC2626]'
                  )} />
                  <span className="text-[10px] font-bold text-[#16A34A]">Rep. 6</span>
                </div>
              </div>

              <div className={cn(
                'text-center p-2.5 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-0.5">
                  <span className="text-xl font-black text-[#DC2626]">2</span>
                  <span className="text-[10px] text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-1.5 my-0.5">
                  <span className="text-[10px] font-medium text-[#6B7280]">Rep. 3</span>
                  <ArrowRight className={cn(
                    'w-4 h-4 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-0.5' : 'text-[#DC2626]'
                  )} />
                  <span className="text-[10px] font-bold text-[#16A34A]">Rep. 7</span>
                </div>
              </div>
            </div>

            {showOptimized && (
              <div className="mt-2.5 text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-0.5 text-[#16A34A] text-[10px] font-semibold bg-[#F0FDF4] px-2.5 py-1 rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  Todas las transferencias aplicadas
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Optimized Proposal */}
          <div className="col-span-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all duration-500">
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Propuesta optimizada</h3>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  showOptimized ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-gray-100 text-[#9CA3AF]'
                )}>
                  {showOptimized ? '0 Sobrecargados' : 'Pendiente'}
                </span>
              </div>
              <Target className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-7 p-2.5">
                <SimuladorMapa
                  pdvs={displayPdvs.filter(p => p.reponedorId !== '').map(p => ({
                    id: p.id,
                    lat: p.lat,
                    lng: p.lng,
                    status: showOptimized ? p.status : 'pending',
                    reponedorId: p.reponedorId,
                  }))}
                  routes={displayRoutes}
                  className={cn(
                    'transition-all duration-700',
                    !showOptimized && 'opacity-30 grayscale',
                    animating && 'scale-[1.02]'
                  )}
                />
              </div>
              <div className="col-span-5 p-2.5 space-y-1">
                <p className="text-[10px] font-semibold text-[#6B7280] uppercase tracking-wider mb-1.5">Carga equilibrada</p>
                {optimizedReponedores.map(rep => (
                  <div key={rep.id} className="flex items-center gap-1.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: rep.color }}
                    />
                    <span className="text-[10px] text-[#6B7280] flex-1 truncate">{rep.name}</span>
                    <div className="w-16 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rep.workload}%`,
                          backgroundColor: showOptimized ? '#16A34A' : '#9CA3AF',
                        }}
                      />
                    </div>
                    <span className={cn(
                      'text-[10px] font-bold w-7 text-right',
                      showOptimized ? 'text-[#16A34A]' : 'text-[#9CA3AF]'
                    )}>
                      {showOptimized ? `${rep.workload}%` : '—'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className={cn(
              'px-4 py-2 border-t transition-all duration-500',
              showOptimized ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-gray-50 border-[#E5E7EB]'
            )}>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className={cn('w-3.5 h-3.5', showOptimized ? 'text-[#16A34A]' : 'text-[#9CA3AF]')} />
                <span className={cn('text-[11px] font-medium', showOptimized ? 'text-[#16A34A]' : 'text-[#9CA3AF]')}>
                  {showOptimized
                    ? 'Carga equilibrada • Rutas más eficientes • Sin sobrecargas'
                    : 'Ejecuta la optimización para ver la propuesta'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== IMPACT SECTION ===== */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-sm font-bold text-[#111827]">Impacto de la redistribución</h2>
              <p className="text-[10px] text-[#6B7280] mt-0.5">
                {showOptimized ? 'Optimización aplicada correctamente' : 'Ejecuta el simulador para ver el impacto proyectado'}
              </p>
            </div>
            {showOptimized && (
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-2.5 h-2.5" />
                Optimizado
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <ImpactCard
              icon={<GitCompare className="w-4 h-4" />}
              value={showOptimized ? String(reassignedCount) : '—'}
              label="PDVs reasignados"
              active={showOptimized}
            />
            <ImpactCard
              icon={<TrendingDown className="w-4 h-4" />}
              value={showOptimized ? '23%' : '—'}
              label="Menos distancia recorrida"
              active={showOptimized}
            />
            <ImpactCard
              icon={<Users className="w-4 h-4" />}
              value={showOptimized ? '4' : String(overloadedCount)}
              label="Sobrecargas resueltas"
              active={showOptimized}
              negative={!showOptimized}
            />
            <ImpactCard
              icon={<Target className="w-4 h-4" />}
              value={showOptimized ? '100%' : '68%'}
              label="Cobertura de canal"
              active={showOptimized}
            />
          </div>
        </div>

        {/* ===== FINAL ACTIONS ===== */}
        <div className="flex justify-center gap-3 pb-2">
          <button
            onClick={handleApplyRedistribution}
            disabled={!showOptimized || applied || animating}
            className={cn(
              'px-6 py-2.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-2 shadow-sm',
              applied
                ? 'bg-[#16A34A] text-white cursor-default shadow-md'
                : showOptimized
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C] text-white hover:shadow-md active:scale-[0.98]'
                  : 'bg-gray-200 text-[#9CA3AF] cursor-default',
              animating && 'opacity-50 cursor-wait'
            )}
          >
            {applied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Redistribución aplicada
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Aplicar redistribución
              </>
            )}
          </button>

          <div className="relative group">
            <button
              onClick={() => handleExport('pdf')}
              className="px-6 py-2.5 rounded-lg text-xs font-semibold border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar propuesta
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block animate-in fade-in duration-200">
              <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-1.5 flex gap-1">
                <button onClick={() => handleExport('pdf')} className="px-2.5 py-1.5 text-[10px] text-[#6B7280] hover:bg-gray-50 rounded font-medium">PDF</button>
                <button onClick={() => handleExport('xlsx')} className="px-2.5 py-1.5 text-[10px] text-[#6B7280] hover:bg-gray-50 rounded font-medium">Excel</button>
                <button onClick={() => handleExport('geojson')} className="px-2.5 py-1.5 text-[10px] text-[#6B7280] hover:bg-gray-50 rounded font-medium">GeoJSON</button>
              </div>
              <div className="w-2 h-2 bg-white border-r border-b border-[#E5E7EB] rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        </div>
      </div>

      <Toast visible={toast.visible} type={toast.type} title={toast.title} message={toast.message} onClose={closeToast} />
      <ConfirmDialog
        open={confirmOpen}
        title="Aplicar plan de redistribución"
        message="¿Estás seguro de aplicar la redistribución propuesta? Esta operación actualizará las asignaciones de los reponedores para el próximo ciclo operativo."
        confirmLabel="Confirmar"
        cancelLabel="Cancelar"
        onConfirm={handleConfirmApply}
        onCancel={handleCancelApply}
      />
    </DashboardLayout>
  )
}

function ImpactCard({
  icon,
  value,
  label,
  active,
  negative,
}: {
  icon: ReactNode
  value: string
  label: string
  active: boolean
  negative?: boolean
}) {
  return (
    <div className={cn(
      'rounded-lg border p-3 text-center transition-all duration-500',
      active
        ? negative
          ? 'border-[#FECACA] bg-[#FEF2F2]'
          : 'border-[#BBF7D0] bg-[#F0FDF4] shadow-sm'
        : 'border-[#E5E7EB] bg-gray-50'
    )}>
      <div className={cn(
        'w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5 transition-colors duration-500',
        active && !negative ? 'bg-[#16A34A] text-white' : active && negative ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-[#9CA3AF]'
      )}>
        {icon}
      </div>
      <p className={cn(
        'text-lg font-black transition-colors duration-500',
        active && !negative ? 'text-[#16A34A]' : active && negative ? 'text-[#DC2626]' : 'text-[#9CA3AF]'
      )}>
        {value}
      </p>
      <p className={cn(
        'text-[10px] font-medium mt-0.5 transition-colors duration-500',
        active ? 'text-[#111827]' : 'text-[#9CA3AF]'
      )}>
        {label}
      </p>
    </div>
  )
}

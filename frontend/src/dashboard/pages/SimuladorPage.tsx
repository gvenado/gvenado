import { useState, useMemo, useCallback, useEffect, useRef, type ReactNode } from 'react'
import {
  Users,
  Target,
  Clock,
  GitCompare,
  Zap,
  ArrowRight,
  CheckCircle2,
  Download,
  RefreshCw,
  BarChart3,
  TrendingDown,
  Split,
  Activity,
  Sparkles,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { KPICard } from '@/dashboard/components/KPICard'
import { MapaPDVs } from '@/dashboard/components/MapaPDVs'
import { useSupervisor } from '@/dashboard/context/SupervisorContext'
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
  const {
    reponedores,
    pdvs,
    optimized,
    toggleOptimized,
    optimizedReponedores,
    optimizedPDVs,
  } = useSupervisor()

  const [animating, setAnimating] = useState(false)
  const [showOptimized, setShowOptimized] = useState(false)

  const currentRoutes = useMemo(() => buildRoutes(pdvs, reponedores), [pdvs, reponedores])
  const optimizedRoutes = useMemo(
    () => buildRoutes(optimizedPDVs, optimizedReponedores),
    [optimizedPDVs, optimizedReponedores]
  )

  const displayPdvs = showOptimized ? optimizedPDVs : pdvs
  const displayRoutes = showOptimized ? optimizedRoutes : currentRoutes

  const overloadedCount = reponedores.filter(r => r.status === 'overloaded').length
  const optimizedOverloaded = optimizedReponedores.filter(r => r.status === 'overloaded').length

  const kmSavedCount = useCountUp(23, 2000, true)
  const overloadedCountUp = useCountUp(overloadedCount, 1500, true)
  const channelCountUp = useCountUp(100, 2000, true)
  const reassignedCount = useCountUp(12, 2500, showOptimized)

  const handleOptimize = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setShowOptimized(true)
      toggleOptimized()
      setTimeout(() => setAnimating(false), 600)
    }, 800)
  }, [toggleOptimized])

  const resetSimulation = useCallback(() => {
    setAnimating(true)
    setTimeout(() => {
      setShowOptimized(false)
      if (optimized) toggleOptimized()
      setTimeout(() => setAnimating(false), 600)
    }, 400)
  }, [optimized, toggleOptimized])

  const handleExport = useCallback((_format: string) => {
  }, [])

  return (
    <DashboardLayout currentPage="Simulator">
      <div className="p-6 space-y-6">
        {/* ===== TOP KPI ROW ===== */}
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="Kilometers Saved"
            value={showOptimized ? `-${kmSavedCount}%` : '-0%'}
            icon={<TrendingDown className="w-5 h-5" />}
            trend={showOptimized ? `${kmSavedCount}% improvement` : 'Not optimized'}
            trendDirection={showOptimized ? 'up' : 'down'}
            iconBgClass="bg-[#DC2626]"
          />
          <KPICard
            label="Overloaded Replenishers"
            value={showOptimized ? String(optimizedOverloaded) : String(overloadedCountUp)}
            icon={<Users className="w-5 h-5" />}
            trend={showOptimized ? 'All balanced' : `${overloadedCount} detected`}
            trendDirection={showOptimized ? 'up' : 'down'}
            iconBgClass="bg-[#DC2626]"
          />
          <KPICard
            label="Channel Coverage"
            value={showOptimized ? `${channelCountUp}%` : '68%'}
            icon={<Target className="w-5 h-5" />}
            trend={showOptimized ? 'Full coverage' : 'Partial coverage'}
            trendDirection={showOptimized ? 'up' : 'down'}
            iconBgClass="bg-[#16A34A]"
          />
          <KPICard
            label="Time Recovered"
            value={showOptimized ? '4h 20m' : '0h 0m'}
            icon={<Clock className="w-5 h-5" />}
            trend={showOptimized ? '260 min saved' : 'Not saved'}
            trendDirection={showOptimized ? 'up' : 'down'}
            iconBgClass="bg-[#F59E0B]"
          />
        </div>

        {/* ===== SIMULATOR CONTROL PANEL ===== */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0">
                <GitCompare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#111827]">Redistribution Simulator</h2>
                <p className="text-sm text-[#6B7280] mt-1 max-w-xl">
                  Redistribute PDVs among replenishment workers to balance workloads,
                  reduce travel distance, and improve channel coverage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {showOptimized ? (
                <button
                  onClick={resetSimulation}
                  disabled={animating}
                  className="px-5 py-2.5 bg-white border border-[#E5E7EB] text-[#111827] rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={cn('w-4 h-4', animating && 'animate-spin')} />
                  Reset
                </button>
              ) : (
                <button
                  onClick={handleOptimize}
                  disabled={animating}
                  className="px-6 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2 shadow-sm hover:shadow-md disabled:opacity-50"
                >
                  {animating ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Zap className="w-4 h-4" />
                  )}
                  {animating ? 'Optimizing...' : 'Optimize Redistribution'}
                </button>
              )}

              <div className="bg-[#FEF2F2] rounded-lg px-4 py-3 max-w-[200px] border border-[#FECACA]">
                <div className="flex items-center gap-1.5 text-[#DC2626]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider">AI Insight</span>
                </div>
                <p className="text-[11px] text-[#991B1B] mt-0.5 leading-snug">
                  Redistributing 12 PDVs across 3 workers can reduce travel by 23%.
                </p>
              </div>
            </div>
          </div>

          {animating && (
            <div className="mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#DC2626] rounded-full animate-pulse" style={{ width: '60%' }} />
            </div>
          )}
        </div>

        {/* ===== MAIN COMPARISON SECTION ===== */}
        <div className="grid grid-cols-12 gap-4">
          {/* LEFT - Current State */}
          <div className="col-span-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all duration-500">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Current State</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FEF2F2] text-[#DC2626]">
                  {overloadedCount} Overloaded
                </span>
              </div>
              <BarChart3 className="w-4 h-4 text-[#6B7280]" />
            </div>
            <div className="p-4">
              <MapaPDVs
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
            <div className="px-5 py-3 bg-[#FEF2F2] border-t border-[#FECACA]">
              <div className="flex items-center gap-2 text-[#DC2626]">
                <AlertTriangle className="w-4 h-4" />
                <span className="text-xs font-medium">
                  {overloadedCount} overloaded replenishment workers • 54% workload imbalance
                </span>
              </div>
            </div>

            {!showOptimized && (
              <div className="px-5 py-3 space-y-1.5">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Workload by worker</p>
                {reponedores.map(rep => (
                  <div key={rep.id} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: rep.color }}
                    />
                    <span className="text-xs text-[#6B7280] flex-1 truncate">{rep.name}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rep.workload}%`,
                          backgroundColor: rep.workload > 85 ? '#DC2626' : '#16A34A',
                        }}
                      />
                    </div>
                    <span className={cn(
                      'text-[11px] font-bold w-8 text-right',
                      rep.workload > 85 ? 'text-[#DC2626]' : 'text-[#16A34A]'
                    )}>
                      {rep.workload}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CENTER - Redistribution Actions */}
          <div className="col-span-2 bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4 flex flex-col items-center justify-center min-h-[400px] transition-all duration-500">
            <div className="text-center mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FEF2F2] flex items-center justify-center mx-auto mb-2">
                <Split className="w-5 h-5 text-[#DC2626]" />
              </div>
              <h3 className="text-sm font-bold text-[#111827]">Redistribution Actions</h3>
              <p className="text-[10px] text-[#6B7280] mt-1">Pending transfers</p>
            </div>

            <div className="space-y-5 w-full">
              <div className={cn(
                'text-center p-3 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-[#DC2626]">6</span>
                  <span className="text-xs text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-2 my-1">
                  <span className="text-xs font-medium text-[#6B7280]">Rep. 1</span>
                  <ArrowRight className={cn(
                    'w-5 h-5 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-1' : 'text-[#DC2626]'
                  )} />
                  <span className="text-xs font-bold text-[#16A34A]">Rep. 5</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xs font-medium text-[#6B7280]">Rep. 1</span>
                  <ArrowRight className={cn(
                    'w-5 h-5 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-1' : 'text-[#DC2626]'
                  )} />
                  <span className="text-xs font-bold text-[#16A34A]">Rep. 7</span>
                </div>
              </div>

              <div className={cn(
                'text-center p-3 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-[#DC2626]">4</span>
                  <span className="text-xs text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-2 my-1">
                  <span className="text-xs font-medium text-[#6B7280]">Rep. 2</span>
                  <ArrowRight className={cn(
                    'w-5 h-5 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-1' : 'text-[#DC2626]'
                  )} />
                  <span className="text-xs font-bold text-[#16A34A]">Rep. 6</span>
                </div>
              </div>

              <div className={cn(
                'text-center p-3 rounded-lg border transition-all duration-500',
                showOptimized ? 'border-[#16A34A] bg-[#F0FDF4]' : 'border-[#E5E7EB] bg-gray-50'
              )}>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-2xl font-black text-[#DC2626]">2</span>
                  <span className="text-xs text-[#6B7280]">PDVs</span>
                </div>
                <div className="flex items-center justify-center gap-2 my-1">
                  <span className="text-xs font-medium text-[#6B7280]">Rep. 1</span>
                  <ArrowRight className={cn(
                    'w-5 h-5 transition-all duration-500',
                    showOptimized ? 'text-[#16A34A] translate-x-1' : 'text-[#DC2626]'
                  )} />
                  <span className="text-xs font-bold text-[#16A34A]">Rep. 5</span>
                </div>
              </div>
            </div>

            {showOptimized && (
              <div className="mt-4 text-center animate-in fade-in duration-500">
                <div className="inline-flex items-center gap-1 text-[#16A34A] text-xs font-semibold bg-[#F0FDF4] px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  All transfers applied
                </div>
              </div>
            )}
          </div>

          {/* RIGHT - Optimized Proposal */}
          <div className="col-span-5 bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden transition-all duration-500">
            <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-[#111827]">Optimized Proposal</h3>
                <span className={cn(
                  'text-[10px] font-bold px-2 py-0.5 rounded-full',
                  showOptimized ? 'bg-[#F0FDF4] text-[#16A34A]' : 'bg-gray-100 text-[#9CA3AF]'
                )}>
                  {showOptimized ? '0 Overloaded' : 'Pending'}
                </span>
              </div>
              <Target className="w-4 h-4 text-[#16A34A]" />
            </div>
            <div className="p-4">
              <MapaPDVs
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
            <div className={cn(
              'px-5 py-3 border-t transition-all duration-500',
              showOptimized ? 'bg-[#F0FDF4] border-[#BBF7D0]' : 'bg-gray-50 border-[#E5E7EB]'
            )}>
              <div className="flex items-center gap-2">
                <CheckCircle2 className={cn('w-4 h-4', showOptimized ? 'text-[#16A34A]' : 'text-[#9CA3AF]')} />
                <span className={cn('text-xs font-medium', showOptimized ? 'text-[#16A34A]' : 'text-[#9CA3AF]')}>
                  {showOptimized
                    ? 'Balanced workload • More efficient routes • No overloads'
                    : 'Run optimization to see the proposal'}
                </span>
              </div>
            </div>

            {showOptimized && (
              <div className="px-5 py-3 space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-500">
                <p className="text-xs font-semibold text-[#6B7280] uppercase tracking-wider mb-2">Balanced workload</p>
                {optimizedReponedores.map(rep => (
                  <div key={rep.id} className="flex items-center gap-2">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: rep.color }}
                    />
                    <span className="text-xs text-[#6B7280] flex-1 truncate">{rep.name}</span>
                    <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${rep.workload}%`,
                          backgroundColor: '#16A34A',
                        }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-[#16A34A] w-8 text-right">
                      {rep.workload}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== IMPACT SECTION ===== */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-bold text-[#111827]">Redistribution Impact</h2>
              <p className="text-xs text-[#6B7280] mt-0.5">
                {showOptimized ? 'Optimization applied successfully' : 'Run the simulator to see projected impact'}
              </p>
            </div>
            {showOptimized && (
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Optimized
              </span>
            )}
          </div>

          <div className="grid grid-cols-5 gap-4">
            <ImpactCard
              icon={<GitCompare className="w-5 h-5" />}
              value={showOptimized ? String(reassignedCount) : '—'}
              label="PDVs Reassigned"
              active={showOptimized}
            />
            <ImpactCard
              icon={<TrendingDown className="w-5 h-5" />}
              value={showOptimized ? '23%' : '—'}
              label="Less Distance"
              active={showOptimized}
            />
            <ImpactCard
              icon={<Users className="w-5 h-5" />}
              value={showOptimized ? '0' : String(overloadedCount)}
              label="Overloaded Workers"
              active={showOptimized}
              negative={!showOptimized}
            />
            <ImpactCard
              icon={<Target className="w-5 h-5" />}
              value={showOptimized ? '100%' : '68%'}
              label="Channel Coverage"
              active={showOptimized}
            />
            <ImpactCard
              icon={<Activity className="w-5 h-5" />}
              value={showOptimized ? '98%' : '46%'}
              label="Workload Balance"
              active={showOptimized}
            />
          </div>
        </div>

        {/* ===== FINAL ACTIONS ===== */}
        <div className="flex justify-center gap-4 pb-4">
          <button
            onClick={handleOptimize}
            disabled={showOptimized || animating}
            className={cn(
              'px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-2.5 shadow-sm',
              showOptimized
                ? 'bg-[#16A34A] text-white cursor-default shadow-md'
                : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white hover:shadow-md active:scale-[0.98]',
              animating && 'opacity-50 cursor-wait'
            )}
          >
            {showOptimized ? (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Redistribution Applied
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Apply Redistribution
              </>
            )}
          </button>

          <div className="relative group">
            <button
              onClick={() => handleExport('pdf')}
              className="px-8 py-3.5 rounded-xl text-sm font-semibold border border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#D1D5DB] hover:text-[#111827] transition-all duration-200 flex items-center gap-2.5 shadow-sm hover:shadow-md"
            >
              <Download className="w-5 h-5" />
              Export Proposal
            </button>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block animate-in fade-in duration-200">
              <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg p-1.5 flex gap-1">
                <button onClick={() => handleExport('pdf')} className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-gray-50 rounded font-medium">PDF</button>
                <button onClick={() => handleExport('xlsx')} className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-gray-50 rounded font-medium">Excel</button>
                <button onClick={() => handleExport('geojson')} className="px-3 py-1.5 text-xs text-[#6B7280] hover:bg-gray-50 rounded font-medium">GeoJSON</button>
              </div>
              <div className="w-2 h-2 bg-white border-r border-b border-[#E5E7EB] rotate-45 mx-auto -mt-1" />
            </div>
          </div>
        </div>
      </div>
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
      'rounded-xl border p-4 text-center transition-all duration-500',
      active
        ? negative
          ? 'border-[#FECACA] bg-[#FEF2F2]'
          : 'border-[#BBF7D0] bg-[#F0FDF4] shadow-sm'
        : 'border-[#E5E7EB] bg-gray-50'
    )}>
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 transition-colors duration-500',
        active && !negative ? 'bg-[#16A34A] text-white' : active && negative ? 'bg-[#DC2626] text-white' : 'bg-gray-200 text-[#9CA3AF]'
      )}>
        {icon}
      </div>
      <p className={cn(
        'text-2xl font-black transition-colors duration-500',
        active && !negative ? 'text-[#16A34A]' : active && negative ? 'text-[#DC2626]' : 'text-[#9CA3AF]'
      )}>
        {value}
      </p>
      <p className={cn(
        'text-xs font-medium mt-0.5 transition-colors duration-500',
        active ? 'text-[#111827]' : 'text-[#9CA3AF]'
      )}>
        {label}
      </p>
    </div>
  )
}

import { useMemo, useState, type ReactNode } from 'react'
import {
  Map,
  Store,
  Clock,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  Filter,
  RotateCcw,
  Loader2,
  AlertOctagon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { MapaVivoLeaflet, type PDVMarkerData, type ReplenisherMarkerData } from '@/dashboard/components/MapaVivoLeaflet'
import { usePdvs } from '@/dashboard/hooks/usePdvs'
import { useReponedores } from '@/dashboard/hooks/useReponedores'
import { useVisitas } from '@/dashboard/hooks/useVisitas'
import type { LiveEvent } from '@/dashboard/services/visitasService'

/* ------------------------------------------------------------------ */
/*  KPI Card                                                           */
/* ------------------------------------------------------------------ */

interface KPICardProps {
  label: string
  value: string
  subtitle: string
  icon: ReactNode
  iconBgClass: string
  loading?: boolean
}

function KPICard({ label, value, subtitle, icon, iconBgClass, loading }: KPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 flex items-center gap-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className={cn('w-11 h-11 rounded-lg flex items-center justify-center shrink-0', iconBgClass)}>
        <div className="text-white [&_svg]:w-5 [&_svg]:h-5">{icon}</div>
      </div>
      <div>
        <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
        {loading ? (
          <div className="h-7 w-16 bg-gray-200 rounded animate-pulse mt-1" />
        ) : (
          <p className="text-2xl font-bold text-[#111827] leading-tight mt-0.5">{value}</p>
        )}
        <p className="text-xs text-[#6B7280] mt-0.5">{loading ? '' : subtitle}</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Loading skeleton                                                   */
/* ------------------------------------------------------------------ */

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('bg-gray-200 rounded animate-pulse', className)} />
}

/* ------------------------------------------------------------------ */
/*  Error banner                                                       */
/* ------------------------------------------------------------------ */

function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#FEF2F2] border border-[#FECACA] rounded-lg">
      <AlertOctagon className="w-5 h-5 text-[#DC2626] shrink-0" />
      <p className="text-sm text-[#DC2626] flex-1">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] underline">
          Retry
        </button>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Empty state                                                        */
/* ------------------------------------------------------------------ */

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Map className="w-12 h-12 text-[#E5E7EB] mb-3" />
      <p className="text-sm text-[#6B7280]">{message}</p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Filters panel                                                      */
/* ------------------------------------------------------------------ */

interface FilterState {
  supervisor: string
  category: string
  status: string
  replenisherId: string
  showDeviationsOnly: boolean
}

interface FiltersPanelProps {
  filters: FilterState
  onChange: (filters: FilterState) => void
  categories: string[]
  replenisherOptions: { id: string; name: string }[]
  loading?: boolean
}

function FiltersPanel({ filters, onChange, categories, replenisherOptions, loading }: FiltersPanelProps) {
  function set<K extends keyof FilterState>(key: K, value: FilterState[K]) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#6B7280]" />
          <h3 className="text-sm font-bold text-[#111827]">Filters</h3>
        </div>
        <button
          onClick={() => onChange({ supervisor: 'all', category: 'all', status: 'all', replenisherId: 'all', showDeviationsOnly: false })}
          className="text-[10px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <Skeleton className="h-3 w-20 mb-1.5" />
              <Skeleton className="h-8 w-full rounded-md" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3.5">
          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Supervisor</label>
            <select
              value={filters.supervisor}
              onChange={e => set('supervisor', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">All Supervisors</option>
              {replenisherOptions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">PDV Category</label>
            <select
              value={filters.category}
              onChange={e => set('category', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Status</label>
            <select
              value={filters.status}
              onChange={e => set('status', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="stock_break">Stock Break</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Replenisher</label>
            <select
              value={filters.replenisherId}
              onChange={e => set('replenisherId', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">All Replenishers</option>
              {replenisherOptions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-[#E5E7EB]">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={filters.showDeviationsOnly}
                  onChange={e => set('showDeviationsOnly', e.target.checked)}
                />
                <div className={cn('w-8 h-4 rounded-full transition-colors', filters.showDeviationsOnly ? 'bg-[#DC2626]' : 'bg-gray-200')} />
                <div className={cn(
                  'absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full shadow transition-transform',
                  filters.showDeviationsOnly && 'translate-x-4'
                )} />
              </div>
              <span className="text-xs font-medium text-[#111827]">Show Deviations Only</span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Event icon helper                                                  */
/* ------------------------------------------------------------------ */

function EventIcon({ type, color }: { type: LiveEvent['type']; color: string }) {
  switch (type) {
    case 'critical': return <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    case 'stock_break': return <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    case 'completed': return <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    case 'closed': return <XCircle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    case 'deviation': return <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    case 'delayed': return <Clock className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
    default: return <Info className="w-4 h-4 mt-0.5 shrink-0" style={{ color }} />
  }
}

/* ------------------------------------------------------------------ */
/*  Status helpers                                                     */
/* ------------------------------------------------------------------ */

function statusLabel(status: PDVMarkerData['status']): string {
  switch (status) {
    case 'completed': return 'Completed'
    case 'in_progress': return 'In Progress'
    case 'pending': return 'Not Visited'
    case 'stock_break': return 'Stock Break / Closed'
  }
}

function statusBg(status: PDVMarkerData['status']): string {
  switch (status) {
    case 'completed': return '#F0FDF4'
    case 'in_progress': return '#FFFBEB'
    case 'pending': return '#F9FAFB'
    case 'stock_break': return '#FEF2F2'
  }
}

function statusColor(status: PDVMarkerData['status']): string {
  switch (status) {
    case 'completed': return '#16A34A'
    case 'in_progress': return '#F59E0B'
    case 'pending': return '#9CA3AF'
    case 'stock_break': return '#DC2626'
  }
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function MapaVivoPage() {
  const { pdvs, rawPdvs, loading: pdvsLoading, error: pdvsError } = usePdvs()
  const { replenishers, loading: repLoading, error: repError } = useReponedores(rawPdvs)
  const { events, loading: eventsLoading, error: eventsError } = useVisitas(3000)

  const [selectedPdv, setSelectedPdv] = useState<PDVMarkerData | null>(null)
  const [selectedRep, setSelectedRep] = useState<ReplenisherMarkerData | null>(null)

  const [filters, setFilters] = useState<FilterState>({
    supervisor: 'all',
    category: 'all',
    status: 'all',
    replenisherId: 'all',
    showDeviationsOnly: false,
  })

  const categories = useMemo(() => {
    const set = new Set(pdvs.map(p => p.category))
    return Array.from(set).sort()
  }, [pdvs])

  const replenisherOptions = useMemo(() => {
    return replenishers.map(r => ({ id: r.id, name: r.name }))
  }, [replenishers])

  const filteredPdvs = useMemo(() => {
    return pdvs.filter(p => {
      if (filters.category !== 'all' && p.category !== filters.category) return false
      if (filters.status !== 'all' && p.status !== filters.status) return false
      return true
    })
  }, [pdvs, filters])

  const filteredReplenishers = useMemo(() => {
    return replenishers.filter(r => {
      if (filters.showDeviationsOnly && r.deviation === 'On track') return false
      if (filters.supervisor !== 'all' && r.id !== filters.supervisor) return false
      if (filters.replenisherId !== 'all' && r.id !== filters.replenisherId) return false
      return true
    })
  }, [replenishers, filters])

  const kpiLoading = pdvsLoading || repLoading
  const mapLoading = pdvsLoading && repLoading

  const pdvsInProgress = useMemo(() => filteredPdvs.filter(p => p.status === 'in_progress').length, [filteredPdvs])
  const pendingPdvs = useMemo(() => filteredPdvs.filter(p => p.status === 'pending').length, [filteredPdvs])
  const deviationCount = useMemo(() => filteredReplenishers.filter(r => r.deviation !== 'On track').length, [filteredReplenishers])
  const totalPdvs = filteredPdvs.length
  const projectedCoverage = totalPdvs > 0 ? Math.round(((totalPdvs - pendingPdvs) / totalPdvs) * 100) : 0

  const dataError = pdvsError || repError || eventsError

  return (
    <DashboardLayout currentPage="Live Map">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-4 gap-4">
          <KPICard
            label="PDVs In Progress"
            value={String(pdvsInProgress)}
            subtitle="Operating Now"
            icon={<Clock />}
            iconBgClass="bg-[#2563EB]"
            loading={kpiLoading}
          />
          <KPICard
            label="Pending PDVs"
            value={String(pendingPdvs)}
            subtitle="To Visit Today"
            icon={<Store />}
            iconBgClass="bg-[#F59E0B]"
            loading={kpiLoading}
          />
          <KPICard
            label="Replenishers with Deviation"
            value={String(deviationCount)}
            subtitle="Require Attention"
            icon={<AlertTriangle />}
            iconBgClass="bg-[#DC2626]"
            loading={kpiLoading}
          />
          <KPICard
            label="Projected Coverage"
            value={`${projectedCoverage}%`}
            subtitle="At End of Day"
            icon={<TrendingUp />}
            iconBgClass="bg-[#16A34A]"
            loading={kpiLoading}
          />
        </div>

        {dataError && (
          <ErrorBanner message={dataError} />
        )}

        <div className="grid grid-cols-12 gap-5">
          <div className="col-span-3">
            <FiltersPanel
              filters={filters}
              onChange={setFilters}
              categories={categories}
              replenisherOptions={replenisherOptions}
              loading={pdvsLoading}
            />
          </div>

          <div className="col-span-6">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                    <Map className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">Live Map • La Paz Operations</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#6B7280]">Updated every 3s</span>
                  <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              {mapLoading ? (
                <div className="flex items-center justify-center h-[500px] bg-gray-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#DC2626] animate-spin" />
                    <p className="text-sm text-[#6B7280]">Loading map data...</p>
                  </div>
                </div>
              ) : filteredPdvs.length === 0 && filteredReplenishers.length === 0 ? (
                <EmptyState message="No PDVs or replenishers match the current filters." />
              ) : (
                <MapaVivoLeaflet
                  pdvs={filteredPdvs}
                  replenishers={filteredReplenishers}
                  onPdvClick={pdv => setSelectedPdv(pdv)}
                  onReplenisherClick={rep => setSelectedRep(rep)}
                  selectedPdvId={selectedPdv?.id}
                  selectedRepId={selectedRep?.id}
                />
              )}
            </div>
          </div>

          <div className="col-span-3 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-3.5">Selected PDV Details</h3>
              {pdvsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : selectedPdv ? (
                <>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Code:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.code}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Customer:</span>
                      <span className="font-semibold text-[#111827] text-right max-w-[140px]">{selectedPdv.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Category:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.category}</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-[#6B7280]">Status:</span>
                      <span
                        className="font-semibold text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusBg(selectedPdv.status), color: statusColor(selectedPdv.status) }}
                      >
                        {statusLabel(selectedPdv.status)}
                      </span>
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-2.5 mt-2.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6B7280]">Estimated Arrival:</span>
                        <span className="font-semibold text-[#111827]">10:42</span>
                      </div>
                      <p className="text-[10px] text-[#DC2626] mt-0.5 text-right">In 12 minutes</p>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Estimated Time:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.estimatedTime}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                    View PDV History
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-4">Click a PDV marker on the map</p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-5">
              <h3 className="text-sm font-bold text-[#111827] mb-3.5">Selected Replenisher Details</h3>
              {repLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 mb-2" />
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : selectedRep ? (
                <>
                  <p className="text-lg font-bold text-[#111827] mb-3">{selectedRep.name}</p>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Accumulated Time:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.accumulatedTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">PDVs Visited:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.pdvsVisited} / {selectedRep.totalPdvs}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Next PDV:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.nextPdv}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">ETA:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.eta}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Deviation vs Plan:</span>
                      <span className={cn('font-semibold', selectedRep.deviation !== 'On track' ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                        {selectedRep.deviation}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Mobility Profile:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.mobilityProfile}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3.5 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                    View Full Route
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-4">Click a replenisher marker on the map</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-3.5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#111827]">Real-Time Events</h3>
            {eventsLoading && (
              <Loader2 className="w-3 h-3 text-[#DC2626] animate-spin" />
            )}
          </div>
          {eventsError ? (
            <div className="flex items-center gap-2 text-xs text-[#DC2626] py-2">
              <AlertOctagon className="w-4 h-4" />
              <span>Failed to load events</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-2">No recent events</p>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {events.slice(0, 4).map(ev => (
                <div key={ev.id} className="flex items-start gap-2.5">
                  <EventIcon type={ev.type} color={ev.color} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold text-[#6B7280]">{ev.time}</span>
                    </div>
                    <p className="text-[11px] text-[#111827] leading-snug">{ev.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end mt-2">
            <button className="text-[10px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors">
              View All ({events.length})
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

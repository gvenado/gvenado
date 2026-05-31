import { useMemo, useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Map,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  ChevronRight,
  ChevronDown,
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
          Reintentar
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
          <h3 className="text-sm font-bold text-[#111827]">Filtros</h3>
        </div>
        <button
          onClick={() => onChange({ supervisor: 'all', category: 'all', status: 'all', replenisherId: 'all', showDeviationsOnly: false })}
          className="text-[10px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Restablecer
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
              <option value="all">Todos los supervisores</option>
              {replenisherOptions.map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Categoría PDV</label>
            <select
              value={filters.category}
              onChange={e => set('category', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Estado</label>
            <select
              value={filters.status}
              onChange={e => set('status', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">Todos los estados</option>
              <option value="completed">Completado</option>
              <option value="in_progress">En curso</option>
              <option value="pending">Pendiente</option>
              <option value="stock_break">Quiebre</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium text-[#6B7280] mb-1 block">Reponedor</label>
            <select
              value={filters.replenisherId}
              onChange={e => set('replenisherId', e.target.value)}
              className="w-full text-xs border border-[#E5E7EB] rounded-md px-3 py-2 text-[#111827] bg-white outline-none focus:border-[#DC2626] appearance-none"
            >
              <option value="all">Todos los reponedores</option>
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
              <span className="text-xs font-medium text-[#111827]">Mostrar solo desviaciones</span>
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
    case 'completed': return 'Completado'
    case 'in_progress': return 'En curso'
    case 'pending': return 'No visitado'
    case 'stock_break': return 'Quiebre / Cerrado'
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
  const [searchParams] = useSearchParams()
  const { pdvs, rawPdvs, loading: pdvsLoading, error: pdvsError } = usePdvs()
  const { replenishers, loading: repLoading, error: repError } = useReponedores(rawPdvs)
  const { events, loading: eventsLoading, error: eventsError } = useVisitas(3000)

  const [selectedPdv, setSelectedPdv] = useState<PDVMarkerData | null>(null)
  const [selectedRep, setSelectedRep] = useState<ReplenisherMarkerData | null>(null)
  const [urlParamProcessed, setUrlParamProcessed] = useState(false)

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<FilterState>({
    supervisor: 'all',
    category: 'all',
    status: 'all',
    replenisherId: 'all',
    showDeviationsOnly: false,
  })

  /* Read ?reponedor= param from URL */
  useEffect(() => {
    if (urlParamProcessed || repLoading || replenishers.length === 0) return
    const repParam = searchParams.get('reponedor')
    if (!repParam) {
      setUrlParamProcessed(true)
      return
    }
    const matched = replenishers.find(r => r.id === repParam || r.name.toLowerCase().includes(repParam.toLowerCase()))
    if (matched) {
      setSelectedRep(matched)
      setFilters(prev => ({ ...prev, replenisherId: matched.id }))
    }
    setUrlParamProcessed(true)
  }, [searchParams, replenishers, repLoading, urlParamProcessed])

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
      if (filters.showDeviationsOnly && r.deviation === 'En tiempo') return false
      if (filters.supervisor !== 'all' && r.id !== filters.supervisor) return false
      if (filters.replenisherId !== 'all' && r.id !== filters.replenisherId) return false
      return true
    })
  }, [replenishers, filters])

  const mapLoading = pdvsLoading && repLoading

  const pdvsInProgress = useMemo(() => filteredPdvs.filter(p => p.status === 'in_progress').length, [filteredPdvs])
  const pendingPdvs = useMemo(() => filteredPdvs.filter(p => p.status === 'pending').length, [filteredPdvs])
  const deviationCount = useMemo(() => filteredReplenishers.filter(r => r.deviation !== 'En tiempo').length, [filteredReplenishers])
  const totalPdvs = filteredPdvs.length
  const projectedCoverage = totalPdvs > 0 ? Math.round(((totalPdvs - pendingPdvs) / totalPdvs) * 100) : 0

  const dataError = pdvsError || repError || eventsError

  return (
    <DashboardLayout currentPage="Mapa en vivo">
      <div className="p-6 space-y-5">
        {dataError && (
          <ErrorBanner message={dataError} />
        )}

        <div className="grid grid-cols-12 gap-5">
          {/* Map — 70% */}
          <div className="col-span-8">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                    <Map className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                  <h3 className="text-sm font-bold text-[#111827]">Mapa en vivo • Operaciones La Paz</h3>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-[#6B7280]">Actualizado cada 3s</span>
                  <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  </button>
                </div>
              </div>
              {mapLoading ? (
                <div className="flex items-center justify-center h-[600px] bg-gray-50">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#DC2626] animate-spin" />
                    <p className="text-sm text-[#6B7280]">Cargando datos del mapa...</p>
                  </div>
                </div>
              ) : filteredPdvs.length === 0 && filteredReplenishers.length === 0 ? (
                <EmptyState message="No hay PDVs o reponedores que coincidan con los filtros actuales." />
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

          {/* Side Panel — 30% */}
          <div className="col-span-4 space-y-4">
            {/* Collapsible Filters */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm">
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="w-full px-5 py-3.5 flex items-center justify-between text-sm font-bold text-[#111827]"
              >
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#6B7280]" />
                  Filtros
                </div>
                <ChevronDown className={cn('w-4 h-4 text-[#6B7280] transition-transform', filtersOpen && 'rotate-180')} />
              </button>
              <div className={cn('overflow-hidden transition-all', filtersOpen ? 'max-h-[500px]' : 'max-h-0')}>
                <div className="px-5 pb-4">
                  <FiltersPanel
                    filters={filters}
                    onChange={setFilters}
                    categories={categories}
                    replenisherOptions={replenisherOptions}
                    loading={pdvsLoading}
                  />
                </div>
              </div>
            </div>

            {/* Quick Status Summary */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#2563EB]">{pdvsLoading ? '—' : pdvsInProgress}</p>
                <p className="text-[10px] text-[#6B7280]">En curso</p>
              </div>
              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#F59E0B]">{pdvsLoading ? '—' : pendingPdvs}</p>
                <p className="text-[10px] text-[#6B7280]">Pendientes</p>
              </div>
              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#DC2626]">{repLoading ? '—' : deviationCount}</p>
                <p className="text-[10px] text-[#6B7280]">Desviaciones</p>
              </div>
              <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-3 text-center">
                <p className="text-lg font-bold text-[#16A34A]">{pdvsLoading ? '—' : `${projectedCoverage}%`}</p>
                <p className="text-[10px] text-[#6B7280]">Cobertura</p>
              </div>
            </div>

            {/* PDV Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Detalles del PDV</h3>
              {pdvsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : selectedPdv ? (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Código:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.code}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Cliente:</span>
                      <span className="font-semibold text-[#111827] text-right max-w-[140px]">{selectedPdv.name}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Categoría:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.category}</span>
                    </div>
                    <div className="flex justify-between text-xs items-center">
                      <span className="text-[#6B7280]">Estado:</span>
                      <span
                        className="font-semibold text-[10px] px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: statusBg(selectedPdv.status), color: statusColor(selectedPdv.status) }}
                      >
                        {statusLabel(selectedPdv.status)}
                      </span>
                    </div>
                    <div className="border-t border-[#E5E7EB] pt-2 mt-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-[#6B7280]">Llegada estimada:</span>
                        <span className="font-semibold text-[#111827]">10:42</span>
                      </div>
                      <p className="text-[10px] text-[#DC2626] mt-0.5 text-right">En 12 minutos</p>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Tiempo estimado:</span>
                      <span className="font-semibold text-[#111827]">{selectedPdv.estimatedTime}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                    Ver historial PDV
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-3">Haz clic en un marcador PDV en el mapa</p>
              )}
            </div>

            {/* Replenisher Details */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm p-4">
              <h3 className="text-sm font-bold text-[#111827] mb-3">Detalles del reponedor</h3>
              {repLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-5 w-24 mb-2" />
                  {[1, 2, 3, 4].map(i => (
                    <Skeleton key={i} className="h-4 w-full" />
                  ))}
                </div>
              ) : selectedRep ? (
                <>
                  <p className="text-base font-bold text-[#111827] mb-2.5">{selectedRep.name}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Tiempo acumulado:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.accumulatedTime}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">PDVs visitados:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.pdvsVisited} / {selectedRep.totalPdvs}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Próximo PDV:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.nextPdv}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">ETA:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.eta}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Desviación vs plan:</span>
                      <span className={cn('font-semibold', selectedRep.deviation !== 'En tiempo' ? 'text-[#DC2626]' : 'text-[#16A34A]')}>
                        {selectedRep.deviation}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6B7280]">Perfil de movilidad:</span>
                      <span className="font-semibold text-[#111827]">{selectedRep.mobilityProfile}</span>
                    </div>
                  </div>
                  <button className="w-full mt-3 px-4 py-2 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm">
                    Ver ruta completa
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <p className="text-xs text-[#6B7280] text-center py-3">Haz clic en un marcador de reponedor en el mapa</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-3.5">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-sm font-bold text-[#111827]">Eventos en tiempo real</h3>
            {eventsLoading && (
              <Loader2 className="w-3 h-3 text-[#DC2626] animate-spin" />
            )}
          </div>
          {eventsError ? (
            <div className="flex items-center gap-2 text-xs text-[#DC2626] py-2">
              <AlertOctagon className="w-4 h-4" />
              <span>Error al cargar eventos</span>
            </div>
          ) : events.length === 0 ? (
            <p className="text-xs text-[#6B7280] py-2">Sin eventos recientes</p>
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
              Ver todos ({events.length})
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

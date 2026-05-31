import { useState, useMemo, useCallback, useEffect, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Map,
  Route,
  BarChart3,
  RefreshCw,
  Navigation,
  Store,
  CheckCircle2,
  X,
  PersonStanding,
  Filter,
  ChevronDown,
  Target,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { RedistributionModal } from '@/dashboard/components/RedistributionModal'
import { ROUTES } from '@/dashboard/utils/constants'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { api } from '@/api/client'
import type { BackendReponedor } from '@/api/client'

/* ------------------------------------------------------------------ */
/*  Colors (stable, index-based)                                        */
/* ------------------------------------------------------------------ */

const REP_COLORS = [
  '#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#7C3AED',
  '#0891B2', '#D946EF', '#059669', '#B91C1C', '#1D4ED8',
  '#15803D', '#D97706', '#6D28D9', '#0E7490', '#C026D3',
  '#047857', '#9F1239', '#1E40AF', '#166534', '#92400E',
  '#5B21B6', '#164E63', '#86198F', '#065F46',
]

/* ------------------------------------------------------------------ */
/*  Mock/derived data (stable by index — backend does not provide       */
/*  deviation, efficiency, progress, or status)                         */
/* ------------------------------------------------------------------ */

const MOCK_DERIVED: ReadonlyArray<{ deviation: number; efficiency: number; pdvs: number }> = [
  { deviation: 18, efficiency: 82, pdvs: 12 },
  { deviation: 8,  efficiency: 88, pdvs: 10 },
  { deviation: 5,  efficiency: 90, pdvs: 11 },
  { deviation: 24, efficiency: 74, pdvs: 13 },
  { deviation: -3, efficiency: 93, pdvs: 9  },
  { deviation: -6, efficiency: 96, pdvs: 11 },
  { deviation: 27, efficiency: 68, pdvs: 14 },
  { deviation: -1, efficiency: 91, pdvs: 10 },
  { deviation: -10,efficiency: 95, pdvs: 8  },
  { deviation: 12, efficiency: 79, pdvs: 12 },
  { deviation: 15, efficiency: 85, pdvs: 10 },
  { deviation: 3,  efficiency: 87, pdvs: 9  },
  { deviation: -8, efficiency: 94, pdvs: 11 },
  { deviation: 20, efficiency: 72, pdvs: 13 },
  { deviation: 9,  efficiency: 89, pdvs: 10 },
  { deviation: -4, efficiency: 92, pdvs: 8  },
  { deviation: 22, efficiency: 76, pdvs: 12 },
  { deviation: 6,  efficiency: 83, pdvs: 10 },
  { deviation: -12,efficiency: 97, pdvs: 9  },
  { deviation: 16, efficiency: 80, pdvs: 11 },
  { deviation: 31, efficiency: 65, pdvs: 14 },
  { deviation: -2, efficiency: 93, pdvs: 10 },
  { deviation: 11, efficiency: 86, pdvs: 12 },
  { deviation: -7, efficiency: 91, pdvs: 9  },
]

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

interface DisplayRep {
  id: string         // String(backendId), e.g. "1"
  backendId: number
  name: string       // backend: nombre
  supervisor: string // backend: supervisor.nombre
  mobilityType: string // backend: perfil_movilidad.tipo
  velocidad: number    // backend: perfil_movilidad.velocidad_kmh
  color: string
  // MOCK/DERIVED fields (no backend equivalent):
  pdvs: number
  completed: number
  progressPct: number
  deviation: number
  efficiency: number
  status: 'overloaded' | 'en_riesgo' | 'en_tiempo'
}

interface MapPdv {
  id: string
  name: string
  address: string
  lat: number
  lng: number
  visitOrder: number
  status: 'pending' | 'completed'
}

interface RouteData {
  pdvCount: number
  mochila: { marca_precios: number; colgantes: number; cenefas: number }
  tiempo_estimado: number
  mapPdvs: MapPdv[]
}

type SortKey = 'deviation' | 'efficiency' | 'status' | 'name'
type SortDir = 'asc' | 'desc' | null

/* ------------------------------------------------------------------ */
/*  Status config                                                       */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  overloaded: { label: 'Sobrecargado', bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  en_riesgo:  { label: 'En riesgo',   bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' },
  en_tiempo:  { label: 'En tiempo',   bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */

function deriveStatus(deviation: number): DisplayRep['status'] {
  if (deviation >= 20) return 'overloaded'
  if (deviation >= 8)  return 'en_riesgo'
  return 'en_tiempo'
}

function toDisplayRep(r: BackendReponedor, index: number): DisplayRep {
  const d = MOCK_DERIVED[index % MOCK_DERIVED.length]
  const progressPct = Math.min(100, Math.max(50, Math.round(d.efficiency * 0.9)))
  return {
    id: String(r.id),
    backendId: r.id,
    name: r.nombre,
    supervisor: r.supervisor?.nombre ?? '—',
    mobilityType: r.perfil_movilidad?.tipo ?? 'moto',
    velocidad: r.perfil_movilidad?.velocidad_kmh ?? 22,
    color: REP_COLORS[index % REP_COLORS.length],
    pdvs: d.pdvs,
    completed: Math.floor(d.pdvs * progressPct / 100),
    progressPct,
    deviation: d.deviation,
    efficiency: d.efficiency,
    status: deriveStatus(d.deviation),
  }
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

/* ------------------------------------------------------------------ */
/*  Mini dual-line chart                                                */
/* ------------------------------------------------------------------ */

function MiniDualChart({ greenData, redData }: { greenData: number[]; redData: number[] }) {
  const w = 80
  const h = 32
  const all = [...greenData, ...redData]
  const min = Math.min(...all)
  const max = Math.max(...all)
  const range = max - min || 1
  function pts(data: number[]) {
    return data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  }
  return (
    <svg width={w} height={h} className="shrink-0">
      <polyline points={pts(greenData)} fill="none" stroke="#16A34A" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={pts(redData)}   fill="none" stroke="#DC2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Sparkline                                                           */
/* ------------------------------------------------------------------ */

function CardSparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length < 2) return null
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 160
  const h = 24
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ')
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block">
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Sub-components                                                      */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: DisplayRep['status'] }) {
  const s = STATUS_CONFIG[status]
  return (
    <span
      className="inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border whitespace-nowrap"
      style={{ backgroundColor: s.bg, color: s.text, borderColor: s.border }}
    >
      {s.label}
    </span>
  )
}

function DeviationBadge({ value }: { value: number }) {
  let color: string
  let circleColor: string
  if (value >= 12) { color = '#DC2626'; circleColor = '#DC2626' }
  else if (value >= 5) { color = '#F59E0B'; circleColor = '#F59E0B' }
  else { color = '#16A34A'; circleColor = '#16A34A' }
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold" style={{ color }}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: circleColor }} />
      {value > 0 ? `+${value}%` : `${value}%`}
    </span>
  )
}

function ProgressBar({ pct, height = 6 }: { pct: number; height?: number }) {
  return (
    <div className="bg-gray-100 rounded-full overflow-hidden" style={{ height }}>
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${pct}%`,
          backgroundColor: pct >= 80 ? '#16A34A' : pct >= 60 ? '#F59E0B' : '#DC2626',
        }}
      />
    </div>
  )
}

function MetricBox({ icon, label, value, valueColor = '#111827' }: { icon: ReactNode; label: string; value: string; valueColor?: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 border border-[#E5E7EB] rounded-lg">
      <div className="w-8 h-8 rounded-md bg-gray-50 flex items-center justify-center text-[#6B7280] shrink-0 [&_svg]:w-4 [&_svg]:h-4">
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
        <p className="text-sm font-bold leading-tight" style={{ color: valueColor }}>{value}</p>
      </div>
    </div>
  )
}

function RouteMapPreview({ pdvs, repName, repColor: _repColor }: { pdvs: MapPdv[]; repName: string; repColor: string }) {
  const center = pdvs.length > 0
    ? { lat: pdvs.reduce((s, p) => s + p.lat, 0) / pdvs.length, lng: pdvs.reduce((s, p) => s + p.lng, 0) / pdvs.length }
    : { lat: -16.5, lng: -68.12 }

  const sorted = [...pdvs].sort((a, b) => a.visitOrder - b.visitOrder)
  const routePoints = sorted.map(p => [p.lat, p.lng] as [number, number])

  return (
    <div className="rounded-lg overflow-hidden border border-[#E5E7EB] relative">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={13}
        className="w-full"
        style={{ height: 220 }}
        scrollWheelZoom={false}
        dragging={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {routePoints.length >= 2 && (
          <Polyline
            positions={routePoints}
            pathOptions={{ color: '#2563EB', weight: 2.5, opacity: 0.7, dashArray: '6 4' }}
          />
        )}
        {sorted.map((pdv, i) => {
          const fillColor = i === 0 ? '#DC2626' : i === sorted.length - 1 ? '#16A34A' : '#2563EB'
          return (
            <CircleMarker
              key={pdv.id}
              center={[pdv.lat, pdv.lng]}
              radius={10}
              pathOptions={{ color: '#FFFFFF', fillColor, fillOpacity: 1, weight: 2 }}
            >
              <Popup>
                <div className="text-xs min-w-[140px]">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] font-bold" style={{ backgroundColor: fillColor }}>
                      {i + 1}
                    </span>
                    <p className="font-bold text-[#111827] text-[13px]">{pdv.name}</p>
                  </div>
                  <p className="text-[#6B7280]">{pdv.address}</p>
                </div>
              </Popup>
            </CircleMarker>
          )
        })}
      </MapContainer>
      <div className="absolute top-2 left-2 z-[1000] bg-white/90 backdrop-blur-sm text-[10px] font-semibold text-[#111827] px-2.5 py-1 rounded border border-[#E5E7EB] shadow-sm">
        {repName} • {sorted.length} stops
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export function ReponedoresPage() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)
  const [detailTab, setDetailTab] = useState<'route' | 'trend' | 'microtasks' | 'upcoming'>('route')
  const [redistModalOpen, setRedistModalOpen] = useState(false)

  // Real data from GET /api/reponedores
  const [reponedores, setReponedores] = useState<DisplayRep[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real route data from GET /api/reponedores/{id}/ruta-hoy
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState<string | null>(null)

  // Load all 24 reponedores on mount
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    api.getReponedores()
      .then((data: BackendReponedor[]) => {
        if (cancelled) return
        setReponedores(data.map(toDisplayRep))
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setError(err instanceof Error ? err.message : 'Error al cargar reponedores')
        setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  // Load route for selected reponedor
  useEffect(() => {
    if (!selectedId) {
      setRouteData(null)
      setRouteLoading(false)
      setRouteError(null)
      return
    }
    const rep = reponedores.find(r => r.id === selectedId)
    if (!rep) return

    let cancelled = false
    setRouteLoading(true)
    setRouteError(null)
    setRouteData(null)

    api.getRutaHoy(rep.backendId, today())
      .then(data => {
        if (cancelled) return
        const mapPdvs: MapPdv[] = data.pdvs.map((p, i) => ({
          id: String(p.id),
          name: p.mercado,
          address: p.cliente,
          lat: p.latitud,
          lng: p.longitud,
          visitOrder: i + 1,
          status: 'pending' as const,
        }))
        setRouteData({
          pdvCount: data.pdvs.length,
          mochila: data.mochila,
          tiempo_estimado: data.tiempo_estimado,
          mapPdvs,
        })
        setRouteLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        setRouteError(err instanceof Error ? err.message : 'Error al cargar ruta')
        setRouteLoading(false)
      })

    return () => { cancelled = true }
  }, [selectedId, reponedores])

  const handleViewOnMap = useCallback((repId: string) => {
    navigate(`${ROUTES.MAPA_VIVO}?reponedor=${repId}`)
  }, [navigate])

  const handleRedistribuirCarga = useCallback(() => {
    setRedistModalOpen(true)
  }, [])

  const handleSimulateRedistribution = useCallback((repId: string) => {
    setRedistModalOpen(false)
    navigate(`${ROUTES.SIMULADOR}?source=${repId}`)
  }, [navigate])

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return reponedores
    return [...reponedores].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'deviation') cmp = a.deviation - b.deviation
      else if (sortKey === 'efficiency') cmp = a.efficiency - b.efficiency
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [reponedores, sortKey, sortDir])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null) }
      else setSortDir('asc')
    } else { setSortKey(key); setSortDir('asc') }
  }, [sortKey, sortDir])

  const selected = useMemo(() => sorted.find(r => r.id === selectedId), [sorted, selectedId])

  // KPI computed from real data (status/deviation are mock-derived but consistent)
  const overloadedCount = useMemo(() => reponedores.filter(r => r.status === 'overloaded').length, [reponedores])
  const avgDeviation = useMemo(() => {
    if (reponedores.length === 0) return 0
    const positiveOnly = reponedores.filter(r => r.deviation > 0)
    if (positiveOnly.length === 0) return 0
    return Math.round(positiveOnly.reduce((s, r) => s + r.deviation, 0) / positiveOnly.length)
  }, [reponedores])
  const bestEfficiencyRep = useMemo(() => {
    if (reponedores.length === 0) return null
    return reponedores.reduce((best, r) => r.efficiency > best.efficiency ? r : best)
  }, [reponedores])

  // Sparkline data (mock trend visuals)
  const sparkDev = [14, 15, 14, 16, 17, 16, 18]
  const sparkEff = [88, 90, 91, 92, 93, 94, 95]
  const miniGreen = [42, 48, 52, 58, 55, 62, 68]
  const miniRed = [38, 40, 35, 32, 38, 34, 30]

  const microtaskData = [
    { label: 'Estante instalado',      pct: 96, color: '#16A34A' },
    { label: 'Material colgante OK',   pct: 93, color: '#2563EB' },
    { label: 'Precios visibles',       pct: 90, color: '#F59E0B' },
    { label: 'Orden y frente',         pct: 88, color: '#DC2626' },
    { label: 'Disponibilidad stock',   pct: 83, color: '#6B7280' },
  ]

  // Build compatible rep object for RedistributionModal
  const modalRep = selected ? {
    id: selected.id,
    name: selected.name,
    pdvs: routeData?.pdvCount ?? selected.pdvs,
    completed: selected.completed,
    deviation: selected.deviation,
    efficiency: selected.efficiency,
    status: selected.status,
    color: selected.color,
    mobility: selected.mobilityType,
  } : null

  return (
    <DashboardLayout currentPage="Reponedores">
      <div className="p-6 space-y-5">
        {/* KPI Row — counts from real data, deviation/efficiency from mock-derived */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Reponedores activos</p>
                <p className="text-2xl font-bold text-[#2563EB] mt-0.5">
                  {loading ? '–' : reponedores.length}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {loading ? '' : `• ${reponedores.length} en ruta hoy`}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#2563EB]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Sobrecargados</p>
                <p className="text-2xl font-bold text-[#F59E0B] mt-0.5">{loading ? '–' : overloadedCount}</p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {loading ? '' : `${reponedores.length > 0 ? Math.round(overloadedCount / reponedores.length * 100) : 0}% del total`}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Desvío promedio</p>
                <p className="text-2xl font-bold text-[#DC2626] mt-0.5">
                  {loading ? '–' : `+${avgDeviation}%`}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#DC2626]" />
              </div>
            </div>
            <div className="mt-2 -mx-4 -mb-4">
              <CardSparkline data={sparkDev} color="#DC2626" />
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Mejor eficiencia POP</p>
                <p className="text-2xl font-bold text-[#16A34A] mt-0.5">
                  {loading || !bestEfficiencyRep ? '–' : `${bestEfficiencyRep.efficiency}%`}
                </p>
                <p className="text-xs text-[#6B7280] mt-0.5">
                  {!loading && bestEfficiencyRep ? bestEfficiencyRep.name : ''}
                </p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center gap-3 text-sm text-red-700">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Main Content: Table + Detail Panel */}
        <div className="grid grid-cols-12 gap-5">
          {/* Table */}
          <div className={cn('col-span-12', selected ? 'lg:col-span-8' : 'lg:col-span-12')}>
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#111827]">Reponedores · Vista operativa</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2.5 py-1.5 border border-[#E5E7EB] rounded-lg text-xs text-[#6B7280]">
                    <span>Estado:</span>
                    <span className="font-semibold text-[#111827]">Todos</span>
                    <ChevronDown className="w-3 h-3" />
                  </div>
                  <button className="w-7 h-7 rounded-lg border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50">
                    <Filter className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center h-48 gap-2 text-sm text-[#6B7280]">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Cargando reponedores…
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-gray-50/50">
                        {[
                          { key: 'name' as SortKey,       label: 'Nombre' },
                          { key: null,                     label: 'PDVs' },
                          { key: null,                     label: '% avance' },
                          { key: 'deviation' as SortKey,  label: 'Desviación vs plan' },
                          { key: 'efficiency' as SortKey, label: 'Eficiencia POP' },
                          { key: 'status' as SortKey,     label: 'Estado' },
                        ].map(col => (
                          <th
                            key={col.label}
                            className={cn(
                              'text-left px-4 py-3 text-xs font-semibold text-[#6B7280] uppercase tracking-wider',
                              col.key && 'cursor-pointer select-none hover:text-[#111827] transition-colors'
                            )}
                            onClick={() => col.key && handleSort(col.key)}
                          >
                            <span className="flex items-center gap-1">
                              {col.label}
                              {col.key && sortKey === col.key && (
                                <ArrowUpDown className={cn('w-3 h-3 transition-transform', sortDir === 'desc' && 'rotate-180')} />
                              )}
                            </span>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map(row => {
                        const isSelected = row.id === selectedId
                        return (
                          <tr
                            key={row.id}
                            className={cn(
                              'border-b border-[#E5E7EB] cursor-pointer transition-colors',
                              isSelected ? 'bg-red-50/50' : 'hover:bg-gray-50'
                            )}
                            onClick={() => setSelectedId(isSelected ? null : row.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                                  style={{ backgroundColor: row.color }}
                                >
                                  {row.name.charAt(row.name.length - 1)}
                                </div>
                                <div>
                                  <span className="font-semibold text-[#111827] block">{row.name}</span>
                                  <span className="text-[10px] text-[#6B7280]">{row.mobilityType} · {row.velocidad} km/h</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-semibold text-[#111827]">{row.pdvs}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2.5">
                                <ProgressBar pct={row.progressPct} height={8} />
                                <span className="text-xs font-semibold text-[#111827] w-8 text-right">{row.progressPct}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-3"><DeviationBadge value={row.deviation} /></td>
                            <td className="px-4 py-3">
                              <span className={cn('font-semibold', row.efficiency >= 80 ? 'text-[#16A34A]' : row.efficiency >= 70 ? 'text-[#F59E0B]' : 'text-[#DC2626]')}>
                                {row.efficiency}%
                              </span>
                            </td>
                            <td className="px-4 py-3"><StatusPill status={row.status} /></td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination footer */}
              <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">1-{sorted.length} de {sorted.length}</span>
                <div className="flex items-center gap-1">
                  <button disabled className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#D1D5DB] text-xs cursor-default">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button className="w-7 h-7 rounded-md bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">1</button>
                  <button disabled className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#D1D5DB] text-xs cursor-default">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          {selected && (
            <div className="col-span-12 lg:col-span-4">
              <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-5 py-3.5 border-b border-[#E5E7EB] flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Detalle del reponedor</h3>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0"
                        style={{ backgroundColor: selected.color }}
                      >
                        {selected.name.charAt(selected.name.length - 1)}
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-[#111827] block leading-tight">{selected.name}</span>
                        <span className="text-[10px] text-[#6B7280]">Sup: {selected.supervisor}</span>
                      </div>
                      <StatusPill status={selected.status} />
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedId(null)}
                    className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 hover:text-[#111827] transition-colors shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-5 space-y-4">
                  {/* Micro-Metrics Grid — mixes real (ruta-hoy) and mock-derived fields */}
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox
                      icon={<Store />}
                      label="PDVs en ruta"
                      value={routeLoading ? '…' : routeData ? String(routeData.pdvCount) : String(selected.pdvs)}
                    />
                    <MetricBox
                      icon={<Clock />}
                      label="Tiempo estimado"
                      value={routeLoading ? '…' : routeData ? `${routeData.tiempo_estimado} min` : '—'}
                      valueColor="#2563EB"
                    />
                    <MetricBox
                      icon={<TrendingUp className="text-[#DC2626]" />}
                      label="Desvío vs plan"
                      value={`${selected.deviation > 0 ? '+' : ''}${selected.deviation}%`}
                      valueColor="#DC2626"
                    />
                    <MetricBox
                      icon={<PersonStanding />}
                      label="Movilidad"
                      value={`${selected.mobilityType} · ${selected.velocidad} km/h`}
                      valueColor="#16A34A"
                    />
                  </div>

                  {/* Analytics Tabs */}
                  <div className="border border-[#E5E7EB] rounded-lg overflow-hidden">
                    <div className="flex border-b border-[#E5E7EB] bg-gray-50/50">
                      {[
                        { key: 'route' as const,      label: 'Ruta',        icon: <Route className="w-3 h-3" /> },
                        { key: 'trend' as const,      label: 'Tendencia',   icon: <BarChart3 className="w-3 h-3" /> },
                        { key: 'microtasks' as const, label: 'Microtareas', icon: <CheckCircle2 className="w-3 h-3" /> },
                        { key: 'upcoming' as const,   label: 'Próximos PDVs', icon: <Navigation className="w-3 h-3" /> },
                      ].map(tab => (
                        <button
                          key={tab.key}
                          onClick={() => setDetailTab(tab.key)}
                          className={cn(
                            'flex-1 flex items-center justify-center gap-1 px-2 py-2 text-[10px] font-semibold transition-colors',
                            detailTab === tab.key
                              ? 'text-[#DC2626] bg-white border-b-2 border-[#DC2626]'
                              : 'text-[#6B7280] hover:text-[#111827]'
                          )}
                        >
                          {tab.icon}
                          {tab.label}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div className="p-3">
                      {detailTab === 'route' && (
                        routeLoading ? (
                          <div className="flex items-center justify-center h-[160px] gap-2 text-xs text-[#6B7280] bg-gray-50 rounded-lg border border-[#E5E7EB]">
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            Cargando ruta…
                          </div>
                        ) : routeError ? (
                          <div className="flex flex-col items-center justify-center h-[160px] gap-1 text-xs text-[#DC2626] bg-red-50 rounded-lg border border-red-100">
                            <AlertTriangle className="w-4 h-4" />
                            {routeError}
                          </div>
                        ) : routeData && routeData.mapPdvs.length > 0 ? (
                          <>
                            <RouteMapPreview pdvs={routeData.mapPdvs} repName={selected.name} repColor={selected.color} />
                            {/* Mochila breakdown — real data from ruta-hoy */}
                            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[10px]">
                              <div className="bg-gray-50 rounded p-1.5 text-center border border-[#E5E7EB]">
                                <div className="font-semibold text-[#111827]">{routeData.mochila.marca_precios}</div>
                                <div className="text-[#6B7280]">Marca precios</div>
                              </div>
                              <div className="bg-gray-50 rounded p-1.5 text-center border border-[#E5E7EB]">
                                <div className="font-semibold text-[#111827]">{routeData.mochila.colgantes}</div>
                                <div className="text-[#6B7280]">Colgantes</div>
                              </div>
                              <div className="bg-gray-50 rounded p-1.5 text-center border border-[#E5E7EB]">
                                <div className="font-semibold text-[#111827]">{routeData.mochila.cenefas}</div>
                                <div className="text-[#6B7280]">Cenefas</div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="flex items-center justify-center h-[160px] text-xs text-[#6B7280] bg-gray-50 rounded-lg border border-[#E5E7EB]">
                            Sin PDVs asignados hoy
                          </div>
                        )
                      )}

                      {detailTab === 'trend' && (
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-bold text-[#111827]">Avance semanal</p>
                            <MiniDualChart greenData={miniGreen} redData={miniRed} />
                          </div>
                          <p className="text-[11px] text-[#6B7280] mb-2">
                            <span className="font-semibold text-[#111827]">{selected.completed}</span> / {routeData?.pdvCount ?? selected.pdvs} PDVs visitados hoy
                          </p>
                          <ProgressBar pct={selected.progressPct} height={10} />
                          <div className="mt-3 pt-3 border-t border-[#E5E7EB]">
                            <div className="flex items-center justify-between text-[10px]">
                              <span className="text-[#6B7280]">Tendencia semanal</span>
                              <div className="flex items-center gap-3">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#16A34A]" /> Completados</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#DC2626]" /> Pendientes</span>
                              </div>
                            </div>
                            <div className="mt-1">
                              <CardSparkline data={sparkEff} color="#16A34A" />
                            </div>
                          </div>
                        </div>
                      )}

                      {detailTab === 'microtasks' && (
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-[#111827] mb-2">Cumplimiento por microtarea</p>
                          {microtaskData.map(mt => (
                            <div key={mt.label}>
                              <div className="flex justify-between text-[10px] mb-0.5">
                                <span className="text-[#6B7280]">{mt.label}</span>
                                <span className="font-semibold" style={{ color: mt.color }}>{mt.pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all" style={{ width: `${mt.pct}%`, backgroundColor: mt.color }} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {detailTab === 'upcoming' && (
                        <div>
                          <p className="text-xs font-bold text-[#111827] mb-2">Próximos PDVs</p>
                          {routeLoading ? (
                            <div className="flex items-center justify-center py-4 gap-2 text-xs text-[#6B7280]">
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Cargando…
                            </div>
                          ) : routeData && routeData.mapPdvs.length > 0 ? (
                            routeData.mapPdvs.slice(0, 3).map((pdv, i) => (
                              <div key={pdv.id} className="flex items-start gap-3 py-2 border-b border-[#E5E7EB] last:border-0">
                                <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                  <span className="text-[9px] font-bold text-[#6B7280]">{i + 1}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-semibold text-[#111827] truncate">{pdv.name}</p>
                                  <p className="text-[10px] text-[#6B7280] truncate">{pdv.address}</p>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-[10px] font-semibold text-[#111827]">
                                    {[10, 11, 12][i]}:{[45, 30, 15][i].toString().padStart(2, '0')}
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-[#6B7280] text-center py-3">Sin PDVs asignados hoy</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3.5 border-t border-[#E5E7EB] flex items-center gap-3">
                  <button
                    onClick={() => handleViewOnMap(selected.id)}
                    className="flex-1 px-3 py-2 text-xs font-bold text-[#DC2626] bg-white border border-[#DC2626] rounded-lg hover:bg-red-50 hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <Map className="w-3.5 h-3.5" />
                    Ver en mapa
                  </button>
                  <button
                    onClick={handleRedistribuirCarga}
                    className="flex-1 px-3 py-2 text-xs font-bold text-white bg-[#DC2626] border border-[#DC2626] rounded-lg hover:bg-[#B91C1C] hover:shadow-sm transition-all duration-200 flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Redistribuir carga
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <RedistributionModal
        open={redistModalOpen}
        rep={modalRep}
        onCancel={() => setRedistModalOpen(false)}
        onSimulate={handleSimulateRedistribution}
      />
    </DashboardLayout>
  )
}

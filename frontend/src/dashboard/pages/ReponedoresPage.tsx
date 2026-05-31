import { useState, useMemo, useCallback, type ReactNode } from 'react'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  ChevronRight,
  ChevronLeft,
  Map,
  Clock,
  Route,
  BarChart3,
  Download,
  RefreshCw,
  Navigation,
  Store,
  CheckCircle2,
  X,
  Maximize2,
  PersonStanding,
  Filter,
  ChevronDown,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { MapContainer, TileLayer, Polyline, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

/* ------------------------------------------------------------------ */
/*  Exact data from spec                                                */
/* ------------------------------------------------------------------ */

interface ExactRep {
  id: string
  name: string
  pdvs: number
  completed: number
  progressPct: number
  deviation: number
  efficiency: number
  status: 'overloaded' | 'en_riesgo' | 'en_tiempo'
  color: string
  mobility: string
}

const EXACT_DATA: ExactRep[] = [
  { id: 'rep-1', name: 'Reponedor 1', pdvs: 12, completed: 10, progressPct: 86, deviation: 18, efficiency: 82, status: 'overloaded', color: '#2563EB', mobility: 'A pie' },
  { id: 'rep-2', name: 'Reponedor 2', pdvs: 10, completed: 8, progressPct: 78, deviation: 8, efficiency: 88, status: 'en_tiempo', color: '#16A34A', mobility: 'Bicicleta' },
  { id: 'rep-3', name: 'Reponedor 3', pdvs: 11, completed: 8, progressPct: 71, deviation: 5, efficiency: 90, status: 'en_tiempo', color: '#F59E0B', mobility: 'Moto' },
  { id: 'rep-4', name: 'Reponedor 4', pdvs: 13, completed: 9, progressPct: 69, deviation: 24, efficiency: 74, status: 'overloaded', color: '#DC2626', mobility: 'A pie' },
  { id: 'rep-5', name: 'Reponedor 5', pdvs: 9, completed: 7, progressPct: 82, deviation: -3, efficiency: 93, status: 'en_tiempo', color: '#7C3AED', mobility: 'Auto' },
  { id: 'rep-6', name: 'Reponedor 6', pdvs: 11, completed: 8, progressPct: 74, deviation: -6, efficiency: 96, status: 'en_tiempo', color: '#0891B2', mobility: 'Bicicleta' },
  { id: 'rep-7', name: 'Reponedor 7', pdvs: 14, completed: 9, progressPct: 62, deviation: 27, efficiency: 68, status: 'overloaded', color: '#D946EF', mobility: 'A pie' },
  { id: 'rep-8', name: 'Reponedor 8', pdvs: 10, completed: 8, progressPct: 76, deviation: -1, efficiency: 91, status: 'en_tiempo', color: '#059669', mobility: 'Moto' },
  { id: 'rep-9', name: 'Reponedor 9', pdvs: 8, completed: 7, progressPct: 88, deviation: -10, efficiency: 95, status: 'en_tiempo', color: '#2563EB', mobility: 'Auto' },
  { id: 'rep-10', name: 'Reponedor 10', pdvs: 12, completed: 8, progressPct: 70, deviation: 12, efficiency: 79, status: 'en_riesgo', color: '#DC2626', mobility: 'A pie' },
]

/* ------------------------------------------------------------------ */
/*  Mock PDV assignments for route map                                 */
/* ------------------------------------------------------------------ */

interface MockPdv {
  id: string
  name: string
  address: string
  repId: string
  status: string
  lat: number
  lng: number
  visitOrder: number
}

const MOCK_PDVS: MockPdv[] = [
  { id: 'pdv-1', name: 'Supermercado El Prado', address: 'Av. 16 de Julio #1234', repId: 'rep-1', status: 'pending', lat: -16.495, lng: -68.134, visitOrder: 1 },
  { id: 'pdv-2', name: 'Minimarket San Jorge', address: 'Calle 23 de Marzo #456', repId: 'rep-1', status: 'pending', lat: -16.507, lng: -68.127, visitOrder: 2 },
  { id: 'pdv-3', name: 'Tienda San Pedro', address: 'Av. Pando #789', repId: 'rep-1', status: 'pending', lat: -16.515, lng: -68.119, visitOrder: 3 },
  { id: 'pdv-4', name: 'Almacén Central', address: 'Calle Bolívar #321', repId: 'rep-1', status: 'completed', lat: -16.490, lng: -68.145, visitOrder: 4 },
  { id: 'pdv-5', name: 'Bodega Sur', address: 'Av. Argentina #555', repId: 'rep-1', status: 'completed', lat: -16.527, lng: -68.103, visitOrder: 5 },
  { id: 'pdv-6', name: 'Mercado Norte', address: 'Calle Comercio #777', repId: 'rep-1', status: 'completed', lat: -16.534, lng: -68.092, visitOrder: 6 },
  { id: 'pdv-7', name: 'Distribuidora Este', address: 'Av. América #888', repId: 'rep-1', status: 'completed', lat: -16.539, lng: -68.082, visitOrder: 7 },
  { id: 'pdv-8', name: 'Depósito Oeste', address: 'Calle Linares #111', repId: 'rep-2', status: 'pending', lat: -16.530, lng: -68.088, visitOrder: 1 },
  { id: 'pdv-9', name: 'Kiosko Central', address: 'Av. Villazón #222', repId: 'rep-2', status: 'pending', lat: -16.522, lng: -68.097, visitOrder: 2 },
  { id: 'pdv-10', name: 'Mini Market Sur', address: 'Calle Potosí #333', repId: 'rep-2', status: 'completed', lat: -16.514, lng: -68.108, visitOrder: 3 },
  { id: 'pdv-11', name: 'Farmacia Norte', address: 'Av. Montes #444', repId: 'rep-3', status: 'pending', lat: -16.490, lng: -68.150, visitOrder: 1 },
  { id: 'pdv-12', name: 'Librería San Miguel', address: 'Calle 21 #555', repId: 'rep-3', status: 'pending', lat: -16.480, lng: -68.140, visitOrder: 2 },
  { id: 'pdv-13', name: 'Panadería La Paz', address: 'Av. Bush #666', repId: 'rep-3', status: 'pending', lat: -16.490, lng: -68.170, visitOrder: 3 },
  { id: 'pdv-14', name: 'Carnicería Prado', address: 'Calle Colón #777', repId: 'rep-4', status: 'pending', lat: -16.518, lng: -68.100, visitOrder: 1 },
  { id: 'pdv-15', name: 'Abarrotes Sur', address: 'Av. Arce #888', repId: 'rep-4', status: 'completed', lat: -16.510, lng: -68.120, visitOrder: 2 },
]

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type SortKey = 'deviation' | 'efficiency' | 'status' | 'name'
type SortDir = 'asc' | 'desc' | null

/* ------------------------------------------------------------------ */
/*  Status config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  overloaded: { label: 'Sobrecargado', bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
  en_riesgo: { label: 'En riesgo', bg: '#FFFBEB', text: '#F59E0B', border: '#FDE68A' },
  en_tiempo: { label: 'En tiempo', bg: '#F0FDF4', text: '#16A34A', border: '#BBF7D0' },
}

/* ------------------------------------------------------------------ */
/*  Mini dual-line chart                                               */
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
      <polyline points={pts(redData)} fill="none" stroke="#DC2626" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" opacity={0.6} />
    </svg>
  )
}

/* ------------------------------------------------------------------ */
/*  Sparkline (embedded in card bottom)                                */
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
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

function StatusPill({ status }: { status: ExactRep['status'] }) {
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

function RouteMapPreview({ pdvs, repName, repColor }: { pdvs: MockPdv[]; repName: string; repColor: string }) {
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
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export function ReponedoresPage() {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>(null)
  const [sortDir, setSortDir] = useState<SortDir>(null)

  const rows = EXACT_DATA

  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return rows
    return [...rows].sort((a, b) => {
      let cmp = 0
      if (sortKey === 'deviation') cmp = a.deviation - b.deviation
      else if (sortKey === 'efficiency') cmp = a.efficiency - b.efficiency
      else if (sortKey === 'status') cmp = a.status.localeCompare(b.status)
      else cmp = a.name.localeCompare(b.name)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, sortKey, sortDir])

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey === key) {
      if (sortDir === 'asc') setSortDir('desc')
      else if (sortDir === 'desc') { setSortKey(null); setSortDir(null) }
      else setSortDir('asc')
    } else { setSortKey(key); setSortDir('asc') }
  }, [sortKey, sortDir])

  const selected = useMemo(() => sorted.find(r => r.id === selectedId), [sorted, selectedId])

  const selectedAssignedPdvs = useMemo(() => {
    if (!selected) return []
    return MOCK_PDVS.filter(p => p.repId === selected.id).sort((a, b) => a.visitOrder - b.visitOrder)
  }, [selected])

  // Exact KPI values from spec
  const kpiActive = 23
  const kpiOverloaded = 4
  const kpiDeviation = 18
  const kpiBestEff = 95

  // Sparkline data
  const sparkTrend = [19, 20, 18, 21, 22, 20, 23]
  const sparkOverload = [6, 5, 5, 4, 5, 4, 4]
  const sparkDev = [14, 15, 14, 16, 17, 16, 18]
  const sparkEff = [88, 90, 91, 92, 93, 94, 95]

  // Avance mini chart
  const miniGreen = [42, 48, 52, 58, 55, 62, 68]
  const miniRed = [38, 40, 35, 32, 38, 34, 30]

  return (
    <DashboardLayout currentPage="Reponedores">
      <div className="p-6 space-y-5">
        {/* KPI Row — exact values from spec */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 overflow-hidden">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-[#6B7280] uppercase tracking-wider">Reponedores activos</p>
                <p className="text-2xl font-bold text-[#2563EB] mt-0.5">23</p>
                <p className="text-xs text-[#6B7280] mt-0.5">• 1 inactivo</p>
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
                <p className="text-2xl font-bold text-[#F59E0B] mt-0.5">4</p>
                <p className="text-xs text-[#6B7280] mt-0.5">17% del total</p>
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
                <p className="text-2xl font-bold text-[#DC2626] mt-0.5">+18%</p>
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
                <p className="text-2xl font-bold text-[#16A34A] mt-0.5">95%</p>
                <p className="text-xs text-[#6B7280] mt-0.5">Reponedor 9</p>
              </div>
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-[#16A34A]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content: Table + Detail Panel */}
        <div className="grid grid-cols-12 gap-5">
          {/* Table */}
          <div className={cn('col-span-12', selected ? 'lg:col-span-7' : 'lg:col-span-12')}>
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#E5E7EB] bg-gray-50/50">
                      {[
                        { key: 'name' as SortKey, label: 'Nombre' },
                        { key: null, label: 'PDVs' },
                        { key: null, label: '% avance' },
                        { key: 'deviation' as SortKey, label: 'Desviación vs plan' },
                        { key: 'efficiency' as SortKey, label: 'Eficiencia POP' },
                        { key: 'status' as SortKey, label: 'Estado' },
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
                              <span className="font-semibold text-[#111827]">{row.name}</span>
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

              {/* Pagination footer */}
              <div className="px-5 py-3 border-t border-[#E5E7EB] flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">1-10 de 23</span>
                <div className="flex items-center gap-1">
                  <button className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 text-xs">
                    <ChevronLeft className="w-3 h-3" />
                  </button>
                  <button className="w-7 h-7 rounded-md bg-[#DC2626] text-white flex items-center justify-center text-xs font-bold">1</button>
                  <button className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 text-xs">2</button>
                  <button className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 text-xs">3</button>
                  <button className="w-7 h-7 rounded-md border border-[#E5E7EB] flex items-center justify-center text-[#6B7280] hover:bg-gray-50 text-xs">
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Detail Panel — Detalle del reponedor */}
          {selected && (
            <div className="col-span-12 lg:col-span-5">
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
                      <span className="text-xs font-semibold text-[#111827]">{selected.name}</span>
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
                  {/* Micro-Metrics Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <MetricBox icon={<Store />} label="PDVs asignados" value={String(selected.pdvs)} />
                    <MetricBox icon={<CheckCircle2 className="text-[#16A34A]" />} label="% avance" value={`${selected.progressPct}%`} valueColor="#16A34A" />
                    <MetricBox icon={<TrendingUp className="text-[#DC2626]" />} label="Desvío vs plan" value={`${selected.deviation > 0 ? '+' : ''}${selected.deviation}%`} valueColor="#DC2626" />
                    <MetricBox icon={<PersonStanding />} label="Movilidad" value={selected.mobility} valueColor="#16A34A" />
                  </div>

                  {/* Ruta del día */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <Route className="w-3.5 h-3.5 text-[#DC2626]" />
                        <h4 className="text-xs font-bold text-[#111827]">Ruta del día</h4>
                      </div>
                      <button className="text-[#6B7280] hover:text-[#111827] transition-colors">
                        <Maximize2 className="w-3 h-3" />
                      </button>
                    </div>
                    {selectedAssignedPdvs.length > 0 ? (
                      <RouteMapPreview pdvs={selectedAssignedPdvs} repName={selected.name} repColor={selected.color} />
                    ) : (
                      <div className="flex items-center justify-center h-[160px] text-xs text-[#6B7280] bg-gray-50 rounded-lg border border-[#E5E7EB]">
                        No PDVs assigned
                      </div>
                    )}
                  </div>

                  {/* Avance del día */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5">
                        <BarChart3 className="w-3.5 h-3.5 text-[#DC2626]" />
                        <h4 className="text-xs font-bold text-[#111827]">Avance del día</h4>
                      </div>
                      <MiniDualChart greenData={miniGreen} redData={miniRed} />
                    </div>
                    <p className="text-[11px] text-[#6B7280] mb-2">
                      <span className="font-semibold text-[#111827]">{selected.completed}</span> / {selected.pdvs} PDVs visitados
                    </p>
                    <ProgressBar pct={selected.progressPct} height={10} />
                  </div>

                  {/* Próximos PDVs */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-2.5">
                      <Navigation className="w-3.5 h-3.5 text-[#DC2626]" />
                      <h4 className="text-xs font-bold text-[#111827]">Próximos PDVs</h4>
                    </div>
                    <div className="space-y-0">
                      {selectedAssignedPdvs.filter(p => p.status === 'pending').slice(0, 3).map((pdv, i) => (
                        <div key={pdv.id} className="flex items-start gap-3 py-2.5 border-b border-[#E5E7EB] last:border-0">
                          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                            <span className="text-[10px] font-bold text-[#6B7280]">{i + 1}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-[#111827] truncate">{pdv.name}</p>
                            <p className="text-[11px] text-[#6B7280] truncate">{pdv.address}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[11px] font-semibold text-[#111827]">
                              {[10, 11, 12][i]}:{[45, 30, 15][i].toString().padStart(2, '0')}
                            </p>
                            <p className="text-[10px] text-[#6B7280]">{[1.2, 2.1, 1.4][i]} km</p>
                          </div>
                        </div>
                      ))}
                      {selectedAssignedPdvs.filter(p => p.status === 'pending').length === 0 && (
                        <p className="text-xs text-[#6B7280] text-center py-3">All PDVs completed</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action Buttons */}
                <div className="px-5 py-3.5 border-t border-[#E5E7EB] flex items-center gap-3">
                  <button className="flex-1 px-3 py-2 text-xs font-bold text-[#DC2626] bg-white border border-[#DC2626] rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5">
                    <Map className="w-3.5 h-3.5" />
                    Ver en mapa
                  </button>
                  <button className="flex-1 px-3 py-2 text-xs font-bold text-white bg-[#DC2626] border border-[#DC2626] rounded-lg hover:bg-[#B91C1C] transition-colors flex items-center justify-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5" />
                    Redistribuir carga
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}

import { useMemo, useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Map,
  Store,
  Users,
  TrendingUp,
  BarChart3,
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  Clock,
  ChevronRight,
  Target,
  Lightbulb,
} from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { cn } from '@/lib/utils'
import { DashboardLayout } from '@/dashboard/layouts/DashboardLayout'
import { MapaLeaflet } from '@/dashboard/components/MapaLeaflet'
import { useSupervisor } from '@/dashboard/context/SupervisorContext'
import { ROUTES } from '@/dashboard/utils/constants'
import type { Alerta } from '@/dashboard/types'

const POP_EFFICIENCY = 91

const dailyProgressData = [
  { hour: '06:00', planned: 0, actual: 0 },
  { hour: '07:00', planned: 4, actual: 4 },
  { hour: '08:00', planned: 10, actual: 10 },
  { hour: '09:00', planned: 18, actual: 17 },
  { hour: '10:00', planned: 26, actual: 24 },
  { hour: '11:00', planned: 34, actual: 30 },
  { hour: '12:00', planned: 42, actual: 37 },
  { hour: '13:00', planned: 48, actual: 42 },
  { hour: '14:00', planned: 56, actual: 49 },
  { hour: '15:00', planned: 64, actual: 55 },
  { hour: '16:00', planned: 72, actual: 60 },
  { hour: '17:00', planned: 80, actual: 64 },
  { hour: '18:00', planned: 88, actual: 67 },
  { hour: '19:00', planned: 95, actual: 67 },
]

interface TooltipPayloadEntry {
  name?: string
  value?: number
  color?: string
}

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadEntry[]; label?: string }) {
  if (!active || !payload) return null
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-[#111827] mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-[#6B7280]">{entry.name}:</span>
          <span className="font-medium text-[#111827]">{entry.value}</span>
        </p>
      ))}
    </div>
  )
}

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

interface OverviewKPICardProps {
  label: string
  value: string
  icon: ReactNode
  iconBgClass: string
  badge?: { text: string; color: string; bg: string }
  subtitle?: string
  progressValue?: number
  progressLabel?: string
}

function OverviewKPICard({ label, value, icon, iconBgClass, badge, subtitle, progressValue, progressLabel }: OverviewKPICardProps) {
  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] shadow-sm p-4 flex flex-col transition-all duration-300 hover:shadow-md hover:-translate-y-0.5">
      <div className="flex items-start justify-between mb-2">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', iconBgClass)}>
          <div className="text-white [&_svg]:w-[18px] [&_svg]:h-[18px]">{icon}</div>
        </div>
        {badge && (
          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', badge.bg, badge.color)}>
            {badge.text}
          </span>
        )}
      </div>
      <p className="text-[11px] font-medium text-[#6B7280] uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-[#111827] mt-0.5">{value}</p>
      {subtitle && <p className="text-xs text-[#6B7280] mt-0.5">{subtitle}</p>}
      {progressValue !== undefined && progressLabel && (
        <div className="mt-2">
          <div className="flex justify-between text-xs mb-0.5">
            <span className="text-[#6B7280]">{progressLabel}</span>
            <span className="font-semibold text-[#111827]">{Math.round(progressValue)}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-[#16A34A] transition-all duration-1000" style={{ width: `${progressValue}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}

interface AlertRowProps {
  alerta: Alerta
}

function AlertRow({ alerta }: AlertRowProps) {
  const Icon = alerta.severity === 'error' ? AlertCircle : alerta.severity === 'warning' ? AlertTriangle : Info
  const dotColor = alerta.severity === 'error' ? '#DC2626' : alerta.severity === 'warning' ? '#F59E0B' : '#2563EB'
  const bgColor = alerta.severity === 'error' ? '#FEF2F2' : alerta.severity === 'warning' ? '#FFFBEB' : '#EFF6FF'
  return (
    <div className={cn('flex items-start gap-2 rounded-lg px-3 py-2', bgColor)}>
      <Icon className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: dotColor }} />
      <div className="flex-1 min-w-0 flex items-start justify-between gap-2">
        <p className="text-[11px] text-[#111827] leading-snug">{alerta.message}</p>
        <p className="text-[10px] text-[#6B7280] shrink-0 whitespace-nowrap">
          {new Date(alerta.timestamp).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  )
}

export function OverviewPage() {
  const navigate = useNavigate()
  const { pdvs, reponedores, alertas, loading } = useSupervisor()

  const totalPdvs = pdvs.length
  const visitedPdvs = useMemo(() => pdvs.filter(p => p.status === 'completed').length, [pdvs])
  const pendingPdvs = useMemo(() => pdvs.filter(p => p.status === 'pending').length, [pdvs])
  const dailyCoveragePct = totalPdvs > 0 ? (visitedPdvs / totalPdvs) * 100 : 0

  const routes = useMemo(() =>
    reponedores.map(rep => {
      const repPdvs = pdvs
        .filter(p => p.reponedorId === rep.id)
        .sort((a, b) => a.visitOrder - b.visitOrder)
      return {
        reponedorId: rep.id,
        reponedorName: rep.name,
        color: rep.color,
        points: repPdvs.map(p => ({ lat: p.lat, lng: p.lng })),
      }
    }).filter(r => r.points.length > 0),
    [pdvs, reponedores]
  )

  const pdvMarkers = useMemo(() =>
    pdvs.map(p => ({
      id: p.id,
      name: p.name,
      lat: p.lat,
      lng: p.lng,
      status: p.status,
    })),
    [pdvs]
  )

  const visitedAnim = useCountUp(visitedPdvs, 1500, !loading)
  const pendingAnim = useCountUp(pendingPdvs, 1200, !loading)
  const activeAnim = useCountUp(reponedores.length, 1000, !loading)
  const efficiencyAnim = useCountUp(POP_EFFICIENCY, 1800, !loading)
  const alertsAnim = useCountUp(alertas.length, 800, !loading)

  return (
    <DashboardLayout currentPage="Operaciones del día">
      <div className="p-6 space-y-5">
        <div className="grid grid-cols-6 gap-3">
          <OverviewKPICard
            label="PDVs visitados hoy"
            value={loading ? '—' : `${visitedAnim} / ${totalPdvs}`}
            icon={<Store />}
            iconBgClass="bg-[#16A34A]"
            progressValue={dailyCoveragePct}
            progressLabel="Cobertura diaria"
          />
          <OverviewKPICard
            label="PDVs pendientes"
            value={loading ? '—' : String(pendingAnim)}
            icon={<Clock />}
            iconBgClass="bg-[#F59E0B]"
            badge={{ text: 'Riesgo medio', color: 'text-[#F59E0B]', bg: 'bg-[#FFFBEB]' }}
          />
          <OverviewKPICard
            label="Reponedores activos"
            value={loading ? '—' : String(activeAnim)}
            icon={<Users />}
            iconBgClass="bg-[#2563EB]"
          />
          <OverviewKPICard
            label="Desviación promedio vs plan"
            value="+18%"
            icon={<TrendingUp />}
            iconBgClass="bg-[#DC2626]"
          />
          <OverviewKPICard
            label="Eficiencia POP promedio"
            value={`${efficiencyAnim}%`}
            icon={<Target />}
            iconBgClass="bg-[#16A34A]"
            subtitle="+6 puntos vs ayer"
          />
          <OverviewKPICard
            label="Alertas críticas"
            value={loading ? '—' : String(alertsAnim)}
            icon={<Bell />}
            iconBgClass="bg-[#DC2626]"
            badge={{ text: 'Acción requerida', color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]' }}
          />
        </div>

        <div className="grid grid-cols-12 gap-5">
          {/* LEFT - Mini Map */}
          <div className="col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] flex items-center justify-center">
                    <Map className="w-3.5 h-3.5 text-[#DC2626]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#111827]">Informe del día</h3>
                    <p className="text-[10px] text-[#6B7280]">La Paz</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate(ROUTES.MAPA_VIVO)}
                  className="text-xs font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors flex items-center gap-1"
                >
                  Ver mapa en vivo
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-0 max-h-[240px] overflow-hidden">
                <MapaLeaflet pdvs={pdvMarkers} routes={routes} className="rounded-none" />
              </div>
            </div>

            <div className="bg-gradient-to-r from-[#FEF2F2] to-[#FFE4E4] rounded-xl border-2 border-[#FECACA] shadow-md px-5 py-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#DC2626] flex items-center justify-center shrink-0 shadow-sm">
                  <Lightbulb className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-[#DC2626] uppercase tracking-wider mb-1">Mapa Operativo</p>
                  <p className="text-xs text-[#111827] leading-relaxed">
                    <strong className="font-semibold">Reponedor 1</strong> está{' '}
                    <strong className="font-semibold">18% sobre el tiempo planificado</strong> en los primeros 4 PDVs.{' '}
                    Considera redistribuir <strong className="font-semibold">3 PDVs</strong> a{' '}
                    <strong className="font-semibold">Reponedor 7</strong> para equilibrar la carga y reducir la desviación de ruta.
                  </p>
                </div>
                <button
                  onClick={() => navigate(ROUTES.SIMULADOR)}
                  className="px-5 py-2.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 shadow-md hover:shadow-lg shrink-0"
                >
                  Ver simulador
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT - Chart + Alerts */}
          <div className="col-span-6 space-y-4">
            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#6B7280]" />
                  <h3 className="text-sm font-bold text-[#111827]">Avance del día</h3>
                </div>
                <select className="text-xs border border-[#E5E7EB] rounded-md px-2 py-1 text-[#6B7280] bg-white outline-none focus:border-[#DC2626]">
                  <option>PDVs cubiertos vs plan</option>
                </select>
              </div>
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyProgressData} margin={{ top: 10, right: 5, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                    <XAxis dataKey="hour" tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="planned" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4 3" fill="none" name="Planificado" />
                    <Area type="monotone" dataKey="actual" stroke="#DC2626" strokeWidth={2} fill="url(#colorActual)" name="Real" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-[#E5E7EB] shadow-sm px-5 py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[#DC2626]" />
                  <h3 className="text-sm font-bold text-[#111827]">Alertas en vivo</h3>
                </div>
                <button className="text-[10px] font-semibold text-[#DC2626] hover:text-[#B91C1C] transition-colors">
                  Ver todas ({alertas.length})
                </button>
              </div>
              <div className="space-y-1.5">
                {alertas.slice(0, 3).map(alerta => (
                  <AlertRow key={alerta.id} alerta={alerta} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}

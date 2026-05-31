import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, Store, Clock, ChevronLeft } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { cn } from '@/lib/utils'
import { useReponedor } from '@/context/ReponedorContext'
import { fetchPdvById, fetchMicrotasks } from '@/services/api'
import { getChecklistRoute, CATEGORY_BADGES } from '@/constants'
import type { PDV } from '@/data/mockData'
import type { MicroTask } from '@/types'
import { LoadingScreen } from '@/components/LoadingScreen'
import { ErrorState } from '@/components/ErrorState'
import { MobileLayout } from '@/layouts/MobileLayout'

const markerIcon = L.divIcon({
  className: 'bg-transparent',
  html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none"><path d="M14 0C6.27 0 0 6.27 0 14c0 10.5 14 22 14 22s14-11.5 14-22C28 6.27 21.73 0 14 0z" fill="#DC2626"/><circle cx="14" cy="14" r="6" fill="white"/></svg>`,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
})

export function PDVActualPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { reponedor } = useReponedor()

  const [pdv, setPdv] = useState<PDV | null>(null)
  const [tasks, setTasks] = useState<MicroTask[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    setIsLoading(true)
    setError(null)

    Promise.all([
      fetchPdvById(id),
      fetchMicrotasks(),
    ]).then(([pdvData, taskData]) => {
      if (!cancelled) {
        setPdv(pdvData)
        setTasks(taskData)
        setIsLoading(false)
      }
    }).catch(() => {
      if (!cancelled) {
        setError('No se pudo cargar la información del PDV.')
        setIsLoading(false)
      }
    })

    return () => { cancelled = true }
  }, [id])

  if (!reponedor) return <LoadingScreen message="Verificando sesión..." />

  if (error) {
    return (
      <MobileLayout
        header={
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => navigate('/app/ruta-hoy')}>
              <ChevronLeft className="w-5 h-5 text-white" />
            </button>
            <p className="text-white text-sm font-bold">Error</p>
          </div>
        }
      >
        <ErrorState title="Error" message={error} onRetry={() => window.location.reload()} fullScreen={false} />
      </MobileLayout>
    )
  }

  return (
    <MobileLayout
      header={
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => navigate('/app/ruta-hoy')}>
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-bold truncate">{pdv?.name ?? 'Cargando...'}</p>
          </div>
        </div>
      }
      bottomCta={
        <button
          type="button"
          onClick={() => id && navigate(getChecklistRoute(id))}
          disabled={!pdv || isLoading}
          className={cn(
            'w-full h-12 rounded-xl flex items-center justify-center gap-2 text-white text-sm font-bold transition-all',
            !pdv || isLoading
              ? 'bg-[#DC2626]/40 cursor-not-allowed'
              : 'bg-[#DC2626] active:bg-[#B91C1C] shadow-sm shadow-red-200',
          )}
        >
          Empezar visita
        </button>
      }
    >
      {isLoading ? (
        <div className="space-y-3">
          <div className="rounded-xl bg-gray-100 animate-pulse h-[140px]" />
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-3">
            <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-36 bg-gray-100 rounded mt-2 animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
          <div className="rounded-xl bg-white border border-[#E2E8F0] p-3">
            <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse mb-3" />
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-7 flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-100 animate-pulse" />
                <div className="h-3 flex-1 bg-gray-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      ) : pdv ? (
        <>
          <div className="rounded-xl overflow-hidden border border-[#E2E8F0] shadow-sm h-[140px]">
            <MapContainer
              center={[-16.5, -68.15]}
              zoom={15}
              scrollWheelZoom={false}
              dragging={false}
              zoomControl={false}
              style={{ height: '100%', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[-16.5, -68.15]} icon={markerIcon} />
            </MapContainer>
          </div>

          <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#DC2626]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-sm font-bold text-[#0F172A]">{pdv.name}</h2>
                <p className="text-[11px] text-[#64748B] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">{pdv.address}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2.5 pt-2.5 border-t border-[#E2E8F0]">
              <span className={cn(
                'inline-flex items-center px-2 py-0.5 rounded text-[9px] font-semibold leading-tight',
                CATEGORY_BADGES[pdv.category] || 'bg-gray-50 text-[#64748B]',
              )}>
                {pdv.category}
              </span>
              <span className="text-[10px] text-[#64748B] flex items-center gap-0.5">
                <Clock className="w-2.5 h-2.5" />
                ~{pdv.duration}
              </span>
            </div>
          </section>

          <section className="rounded-xl bg-white border border-[#E2E8F0] p-3.5 shadow-sm mt-3">
            <h3 className="text-xs font-bold text-[#0F172A] mb-3">Tareas previstas</h3>
            <div className="space-y-1">
              {tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-2.5 py-1.5">
                  <div className="w-6 h-6 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center shrink-0">
                    <span className="text-[9px] font-bold text-[#64748B]">{idx + 1}</span>
                  </div>
                  <span className="text-[11px] text-[#0F172A] leading-tight">{task.nombre}</span>
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        <ErrorState title="PDV no encontrado" message="No se encontró el punto de venta solicitado." fullScreen={false} />
      )}
    </MobileLayout>
  )
}

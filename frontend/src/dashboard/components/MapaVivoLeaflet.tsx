import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup, ZoomControl, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export interface PDVMarkerData {
  id: string
  name: string
  code: string
  category: string
  lat: number
  lng: number
  status: 'completed' | 'in_progress' | 'pending' | 'stock_break'
  estimatedTime: string
}

export interface ReplenisherMarkerData {
  id: string
  name: string
  lat: number
  lng: number
  color: string
  accumulatedTime: string
  pdvsVisited: number
  totalPdvs: number
  currentPdvName: string
  nextPdv: string
  eta: string
  efficiency: string
  deviation: string
  mobilityProfile: string
  operationStatus: 'En PDV' | 'En ruta' | 'Retrasado' | 'Finalizando visita' | 'Sin conexión'
  routePoints: { lat: number; lng: number }[]
}

interface MapaVivoLeafletProps {
  pdvs: PDVMarkerData[]
  replenishers: ReplenisherMarkerData[]
  onPdvClick?: (pdv: PDVMarkerData) => void
  onReplenisherClick?: (rep: ReplenisherMarkerData) => void
  selectedPdvId?: string
  selectedRepId?: string
  className?: string
}

const PDV_COLORS: Record<string, string> = {
  completed: '#16A34A',
  in_progress: '#F59E0B',
  pending: '#9CA3AF',
  stock_break: '#DC2626',
}

const MAP_CENTER: [number, number] = [-16.5, -68.12]
const DEFAULT_ZOOM = 12

// DEMO SIMULATION CONSTANTS — not real-time scheduling
/** Seconds a reponedor stays at each PDV during the demo */
const DEMO_REPONEDOR_DWELL_SECONDS = 15
/** Seconds a reponedor takes to travel between PDVs during the demo */
const DEMO_REPONEDOR_MOVE_SECONDS = 8
/** Marker position update interval in milliseconds */
const DEMO_POSITION_UPDATE_MS = 1000

interface DemoPhaseState {
  phase: 'dwell' | 'moving'
  fromIdx: number
  toIdx: number
  phaseStartMs: number
  labelPhase: 'dwell' | 'moving' | null
}

function buildLabelIcon(name: string, phase: 'dwell' | 'moving'): L.DivIcon {
  const statusColor = phase === 'dwell' ? '#16A34A' : '#F59E0B'
  const statusText = phase === 'dwell' ? '● En PDV' : '▶ En ruta'
  return L.divIcon({
    className: '',
    html: `<div style="
      background: rgba(255,255,255,0.95); padding: 2px 7px 4px;
      border-radius: 4px; font-size: 9px; font-weight: 600;
      color: #111827; border: 1px solid #E5E7EB;
      white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      text-align: center; line-height: 1.4;
    ">${name}<div style="font-size: 8px; font-weight: 500; color: ${statusColor}">${statusText}</div></div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 26],
  })
}

function Legend() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-[#E5E7EB] px-3 py-2 text-[10px] space-y-1 shadow-sm">
      {[
        { label: 'Completed', color: '#16A34A' },
        { label: 'In Progress', color: '#F59E0B' },
        { label: 'Pending / Not Visited', color: '#9CA3AF' },
        { label: 'Stock Break / Closed', color: '#DC2626' },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-[#6B7280]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function ReplenisherAnimationLayer({
  replenishers,
  onReplenisherClick,
  selectedRepId,
}: {
  replenishers: ReplenisherMarkerData[]
  onReplenisherClick?: (rep: ReplenisherMarkerData) => void
  selectedRepId?: string
}) {
  const map = useMap()
  const markersRef = useRef<Map<string, { marker: L.Marker; label: L.Marker }>>(new Map())

  // Create/destroy markers when the reponedor list changes
  useEffect(() => {
    replenishers.forEach(rep => {
      if (markersRef.current.has(rep.id)) return

      const pts = rep.routePoints
      const startPt = pts[0] ?? { lat: rep.lat, lng: rep.lng }

      const marker = L.marker([startPt.lat, startPt.lng], {
        icon: L.divIcon({
          className: '',
          html: `<div style="
            width: 28px; height: 28px; border-radius: 50%;
            background: #2563EB; border: 3px solid #FFFFFF;
            box-shadow: 0 2px 6px rgba(0,0,0,0.3);
            display: flex; align-items: center; justify-content: center;
            font-size: 9px; font-weight: bold; color: white;
          ">${rep.name.charAt(0)}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      })
      marker.addTo(map)

      const label = L.marker([startPt.lat + 0.003, startPt.lng], {
        icon: buildLabelIcon(rep.name, 'dwell'),
      })
      label.addTo(map)

      if (onReplenisherClick) {
        marker.on('click', () => onReplenisherClick(rep))
      }

      markersRef.current.set(rep.id, { marker, label })
    })

    return () => {
      markersRef.current.forEach(entry => {
        entry.marker.remove()
        entry.label.remove()
      })
      markersRef.current.clear()
    }
  }, [replenishers.length])

  // Update marker icon when selection changes
  useEffect(() => {
    replenishers.forEach(rep => {
      const entry = markersRef.current.get(rep.id)
      if (!entry) return
      const isSelected = rep.id === selectedRepId
      entry.marker.setIcon(L.divIcon({
        className: '',
        html: `<div style="
          width: 28px; height: 28px; border-radius: 50%;
          background: #2563EB; border: 3px solid #FFFFFF;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 9px; font-weight: bold; color: white;
          ${isSelected ? 'transform: scale(1.15); box-shadow: 0 0 0 3px rgba(37,99,235,0.3);' : ''}
        ">${rep.name.charAt(0)}</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }))
    })
  }, [selectedRepId])

  // DEMO SIMULATION — dwell/moving state machine, not real-time scheduling
  useEffect(() => {
    const demoStates = new Map<string, DemoPhaseState>()

    replenishers.forEach((rep, i) => {
      const pts = rep.routePoints
      if (pts.length < 2) return

      // Spread reponedores across different PDVs and phases so they don't all move together
      const startIdx = i % (pts.length - 1)

      if (i % 2 === 0) {
        // Start dwelling — stagger how far into dwell they already are
        const alreadyElapsedMs = (i * 3500) % (DEMO_REPONEDOR_DWELL_SECONDS * 1000)
        demoStates.set(rep.id, {
          phase: 'dwell',
          fromIdx: startIdx,
          toIdx: startIdx,
          phaseStartMs: Date.now() - alreadyElapsedMs,
          labelPhase: null,
        })
      } else {
        // Start moving — stagger how far into the move they already are
        const alreadyElapsedMs = (i * 2000) % (DEMO_REPONEDOR_MOVE_SECONDS * 1000)
        demoStates.set(rep.id, {
          phase: 'moving',
          fromIdx: startIdx,
          toIdx: (startIdx + 1) % pts.length,
          phaseStartMs: Date.now() - alreadyElapsedMs,
          labelPhase: null,
        })
      }
    })

    const intervalId = setInterval(() => {
      const now = Date.now()

      replenishers.forEach(rep => {
        const entry = markersRef.current.get(rep.id)
        const state = demoStates.get(rep.id)
        if (!entry || !state) return

        const pts = rep.routePoints
        if (pts.length < 2) return

        const elapsedSec = (now - state.phaseStartMs) / 1000
        let lat: number
        let lng: number

        if (state.phase === 'dwell') {
          const pt = pts[state.toIdx]
          lat = pt.lat
          lng = pt.lng

          if (elapsedSec >= DEMO_REPONEDOR_DWELL_SECONDS) {
            state.fromIdx = state.toIdx
            state.toIdx = (state.toIdx + 1) % pts.length
            state.phase = 'moving'
            state.phaseStartMs = now
          }
        } else {
          const t = Math.min(elapsedSec / DEMO_REPONEDOR_MOVE_SECONDS, 1)
          const from = pts[state.fromIdx]
          const to = pts[state.toIdx]
          lat = from.lat + (to.lat - from.lat) * t
          lng = from.lng + (to.lng - from.lng) * t

          if (elapsedSec >= DEMO_REPONEDOR_MOVE_SECONDS) {
            state.phase = 'dwell'
            state.phaseStartMs = now
          }
        }

        entry.marker.setLatLng([lat, lng])
        entry.label.setLatLng([lat + 0.003, lng])

        // Only rebuild label icon on phase change to avoid DOM flicker
        if (state.phase !== state.labelPhase) {
          entry.label.setIcon(buildLabelIcon(rep.name, state.phase))
          state.labelPhase = state.phase
        }
      })
    }, DEMO_POSITION_UPDATE_MS)

    return () => clearInterval(intervalId)
  }, [replenishers])

  return null
}

export function MapaVivoLeaflet({
  pdvs,
  replenishers,
  onPdvClick,
  onReplenisherClick,
  selectedPdvId,
  selectedRepId,
  className = '',
}: MapaVivoLeafletProps) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }, [])

  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full rounded-lg z-0"
        style={{ height: 500 }}
        zoomControl={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <ZoomControl position="topright" />

        {replenishers.map(rep => {
          const pts = rep.routePoints
          if (pts.length < 2) return null
          return (
            <Polyline
              key={`route-${rep.id}`}
              positions={pts.map(p => [p.lat, p.lng] as [number, number])}
              pathOptions={{
                color: '#2563EB',
                weight: 2.5,
                opacity: 0.6,
                dashArray: '6 4',
              }}
            />
          )
        })}

        {pdvs.map(pdv => (
          <CircleMarker
            key={pdv.id}
            center={[pdv.lat, pdv.lng]}
            radius={pdv.id === selectedPdvId ? 10 : 7}
            pathOptions={{
              color: pdv.id === selectedPdvId ? '#FFFFFF' : PDV_COLORS[pdv.status],
              fillColor: PDV_COLORS[pdv.status],
              fillOpacity: 1,
              weight: pdv.id === selectedPdvId ? 3 : 2,
            }}
            eventHandlers={onPdvClick ? { click: () => onPdvClick(pdv) } : undefined}
          >
            <Popup>
              <div className="text-xs space-y-1 min-w-[160px]">
                <p className="font-bold text-[#111827] text-sm border-b border-[#E5E7EB] pb-1 mb-1">{pdv.code}</p>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Customer:</span>
                  <span className="font-medium text-[#111827] text-right">{pdv.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Category:</span>
                  <span className="font-medium text-[#111827] text-right">{pdv.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6B7280]">Est. Time:</span>
                  <span className="font-medium text-[#111827] text-right">{pdv.estimatedTime}</span>
                </div>
                <div className="flex justify-between items-center pt-1 border-t border-[#E5E7EB] mt-1">
                  <span className="text-[#6B7280]">Status:</span>
                  <span
                    className="font-semibold text-xs px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: pdv.status === 'completed' ? '#F0FDF4' : pdv.status === 'in_progress' ? '#FFFBEB' : pdv.status === 'pending' ? '#F9FAFB' : '#FEF2F2',
                      color: PDV_COLORS[pdv.status],
                    }}
                  >
                    {pdv.status === 'completed' ? 'Completed' : pdv.status === 'in_progress' ? 'In Progress' : pdv.status === 'pending' ? 'Not Visited' : 'Stock Break'}
                  </span>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <ReplenisherAnimationLayer
          replenishers={replenishers}
          onReplenisherClick={onReplenisherClick}
          selectedRepId={selectedRepId}
        />
      </MapContainer>

      <div className="absolute bottom-2 left-2 z-[1000]">
        <Legend />
      </div>
      <div className="absolute top-2 right-14 z-[1000] text-[10px] text-[#6B7280] bg-white/80 px-2 py-1 rounded border border-[#E5E7EB]">
        Updated every 3s
      </div>
    </div>
  )
}

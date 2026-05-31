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
  nextPdv: string
  eta: string
  efficiency: string
  deviation: string
  mobilityProfile: string
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
  const markersRef = useRef<Map<string, { marker: L.Marker; label: L.Marker; animFrame: number; startTime: number }>>(new Map())

  useEffect(() => {
    const icons = new Map<string, L.DivIcon>()
    const labelIcons = new Map<string, L.DivIcon>()

    replenishers.forEach(rep => {
      const isSelected = rep.id === selectedRepId
      icons.set(rep.id, L.divIcon({
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
      labelIcons.set(rep.id, L.divIcon({
        className: '',
        html: `<div style="
          background: rgba(255,255,255,0.95); padding: 1px 6px;
          border-radius: 4px; font-size: 9px; font-weight: 600;
          color: #111827; border: 1px solid #E5E7EB;
          white-space: nowrap; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        ">${rep.name}</div>`,
        iconSize: [0, 0],
        iconAnchor: [30, 22],
      }))
    })

    replenishers.forEach(rep => {
      if (markersRef.current.has(rep.id)) return

      const marker = L.marker([rep.lat, rep.lng], { icon: icons.get(rep.id)! })
      marker.addTo(map)

      const label = L.marker([rep.lat + 0.003, rep.lng], { icon: labelIcons.get(rep.id)! })
      label.addTo(map)

      if (onReplenisherClick) {
        marker.on('click', () => onReplenisherClick(rep))
      }

      const entry = {
        marker,
        label,
        animFrame: 0,
        startTime: performance.now(),
      }

      markersRef.current.set(rep.id, entry)
    })

    return () => {
      markersRef.current.forEach(entry => {
        cancelAnimationFrame(entry.animFrame)
        entry.marker.remove()
        entry.label.remove()
      })
      markersRef.current.clear()
    }
  }, [replenishers.length])

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

  useEffect(() => {
    const animDuration = 2000
    let frameId: number

    function animate() {
      replenishers.forEach(rep => {
        const entry = markersRef.current.get(rep.id)
        if (!entry) return

        const pts = rep.routePoints
        if (pts.length < 2) return

        const elapsed = performance.now() - entry.startTime
        const rawProgress = (elapsed % animDuration) / animDuration
        const totalSegments = pts.length - 1
        const totalProgress = rawProgress * totalSegments
        const idx = Math.min(Math.floor(totalProgress), totalSegments - 1)
        const frac = totalProgress - idx

        const a = pts[idx]
        const b = pts[Math.min(idx + 1, totalSegments)]
        const lat = a.lat + (b.lat - a.lat) * frac
        const lng = a.lng + (b.lng - a.lng) * frac

        entry.marker.setLatLng([lat, lng])
        entry.label.setLatLng([lat + 0.003, lng])
      })

      frameId = requestAnimationFrame(animate)
    }

    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
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

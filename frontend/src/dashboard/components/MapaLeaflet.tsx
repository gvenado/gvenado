import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

interface PDVMarker {
  id: string
  name: string
  lat: number
  lng: number
  status: 'completed' | 'in_progress' | 'pending' | 'stock_break'
}

interface RouteLine {
  reponedorId: string
  reponedorName: string
  color: string
  points: { lat: number; lng: number }[]
}

interface MapaLeafletProps {
  pdvs: PDVMarker[]
  routes: RouteLine[]
  className?: string
}

const PDV_COLORS: Record<string, string> = {
  completed: '#16A34A',
  in_progress: '#F59E0B',
  pending: '#9CA3AF',
  stock_break: '#DC2626',
}

const MAP_CENTER: [number, number] = [-16.5, -68.13]
const DEFAULT_ZOOM = 13

function Legend() {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-lg border border-[#E5E7EB] px-3 py-2 text-[10px] space-y-1 shadow-sm">
      {[
        { label: 'Completed', color: '#16A34A' },
        { label: 'In Progress', color: '#F59E0B' },
        { label: 'Pending', color: '#9CA3AF' },
        { label: 'Stock Break', color: '#DC2626' },
      ].map(item => (
        <div key={item.label} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
          <span className="text-[#6B7280]">{item.label}</span>
        </div>
      ))}
    </div>
  )
}

function UpdateTimestamp() {
  return (
    <div className="text-[10px] text-[#6B7280] bg-white/80 px-2 py-1 rounded border border-[#E5E7EB]">
      Updated: 10:32
    </div>
  )
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

interface Edge {
  to: number
  weight: number
}

function dijkstraShortestPath(
  points: { lat: number; lng: number }[]
): { path: number[]; totalDistance: number } {
  const n = points.length
  if (n <= 2) return { path: points.map((_, i) => i), totalDistance: 0 }

  const graph: Edge[][] = points.map((p, i) => {
    const edges: Edge[] = []
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        edges.push({
          to: j,
          weight: haversineKm(p.lat, p.lng, points[j].lat, points[j].lng),
        })
      }
    }
    return edges
  })

  const dist: number[] = new Array(n).fill(Infinity)
  const prev: number[] = new Array(n).fill(-1)
  const visited: boolean[] = new Array(n).fill(false)
  dist[0] = 0

  for (let count = 0; count < n - 1; count++) {
    let u = -1
    let minDist = Infinity
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i] < minDist) {
        minDist = dist[i]
        u = i
      }
    }
    if (u === -1) break
    visited[u] = true

    for (const edge of graph[u]) {
      if (!visited[edge.to] && dist[u] + edge.weight < dist[edge.to]) {
        dist[edge.to] = dist[u] + edge.weight
        prev[edge.to] = u
      }
    }
  }

  const path: number[] = []
  let current = n - 1
  while (current !== -1) {
    path.push(current)
    current = prev[current]
  }
  path.reverse()

  if (path.length === 1 && path[0] !== 0) {
    return { path: points.map((_, i) => i), totalDistance: 0 }
  }

  return { path, totalDistance: dist[n - 1] }
}

export function MapaLeaflet({ pdvs, routes, className = '' }: MapaLeafletProps) {
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }, [])

  const statusCounts = { completed: 0, in_progress: 0, pending: 0, stock_break: 0 }
  pdvs.forEach(p => { statusCounts[p.status]++ })

  return (
    <div className={`relative w-full ${className}`}>
      <MapContainer
        center={MAP_CENTER}
        zoom={DEFAULT_ZOOM}
        className="w-full rounded-lg z-0"
        style={{ height: 400 }}
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map(route => {
          const sorted = route.points
          const { path } = dijkstraShortestPath(sorted)
          const orderedPoints = path.map(i => [sorted[i].lat, sorted[i].lng] as [number, number])

          return (
            <Polyline
              key={route.reponedorId}
              positions={orderedPoints}
              pathOptions={{
                color: route.color,
                weight: 3,
                opacity: 0.7,
                dashArray: '8 4',
              }}
            />
          )
        })}

        {pdvs.map(pdv => (
          <CircleMarker
            key={pdv.id}
            center={[pdv.lat, pdv.lng]}
            radius={8}
            pathOptions={{
              color: PDV_COLORS[pdv.status],
              fillColor: PDV_COLORS[pdv.status],
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Popup>
              <div className="text-xs">
                <p className="font-semibold text-[#111827]">{pdv.name}</p>
                <p className="text-[#6B7280] capitalize">{pdv.status.replace('_', ' ')}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="absolute bottom-3 left-3 z-[1000]">
        <Legend />
      </div>
      <div className="absolute bottom-3 right-3 z-[1000]">
        <UpdateTimestamp />
      </div>
    </div>
  )
}

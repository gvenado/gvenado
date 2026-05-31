import { useEffect } from 'react'
import { MapContainer, TileLayer, CircleMarker, Polyline } from 'react-leaflet'

interface SimPDVMarker {
  id: string
  lat: number
  lng: number
  status: 'completed' | 'in_progress' | 'pending' | 'stock_break'
  reponedorId: string
}

interface SimRouteLine {
  reponedorId: string
  color: string
  points: { lat: number; lng: number }[]
}

interface SimuladorMapaProps {
  pdvs: SimPDVMarker[]
  routes: SimRouteLine[]
  className?: string
}

const MAP_CENTER: [number, number] = [-16.5, -68.13]
const DEFAULT_ZOOM = 13

const STATUS_COLORS: Record<string, string> = {
  completed: '#16A34A',
  in_progress: '#F59E0B',
  pending: '#9CA3AF',
  stock_break: '#DC2626',
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

function dijkstraShortestPath(points: { lat: number; lng: number }[]): number[] {
  const n = points.length
  if (n <= 2) return points.map((_, i) => i)

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

    for (let v = 0; v < n; v++) {
      if (!visited[v]) {
        const weight = haversineKm(points[u].lat, points[u].lng, points[v].lat, points[v].lng)
        if (dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight
          prev[v] = u
        }
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
    return points.map((_, i) => i)
  }

  return path
}

export function SimuladorMapa({ pdvs, routes, className = '' }: SimuladorMapaProps) {
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
        style={{ height: 320 }}
        zoomControl={false}
        scrollWheelZoom={false}
        dragging={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {routes.map(route => {
          const pts = route.points
          if (pts.length < 2) return null
          const path = dijkstraShortestPath(pts)
          const orderedPoints = path.map(i => [pts[i].lat, pts[i].lng] as [number, number])
          return (
            <Polyline
              key={route.reponedorId}
              positions={orderedPoints}
              pathOptions={{
                color: route.color,
                weight: 2.5,
                opacity: 0.7,
              }}
            />
          )
        })}

        {pdvs.map(pdv => (
          <CircleMarker
            key={pdv.id}
            center={[pdv.lat, pdv.lng]}
            radius={5}
            pathOptions={{
              color: '#FFFFFF',
              fillColor: STATUS_COLORS[pdv.status] || '#9CA3AF',
              fillOpacity: 1,
              weight: 1.5,
            }}
          />
        ))}
      </MapContainer>
    </div>
  )
}

import { useEffect, useRef } from 'react'

interface PDVMarker {
  id: string
  lat: number
  lng: number
  status: 'completed' | 'in_progress' | 'pending' | 'stock_break'
  reponedorId: string
}

interface RouteLine {
  reponedorId: string
  color: string
  points: { lat: number; lng: number }[]
}

interface MapaPDVsProps {
  pdvs: PDVMarker[]
  routes: RouteLine[]
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

export function MapaPDVs({ pdvs, routes, className = '' }: MapaPDVsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const W = rect.width
    const H = rect.height

    ctx.clearRect(0, 0, W, H)

    const padding = 40
    const mapW = W - padding * 2
    const mapH = H - padding * 2

    const allLats = pdvs.map(p => p.lat)
    const allLngs = pdvs.map(p => p.lng)
    const minLat = Math.min(...allLats) - 0.005
    const maxLat = Math.max(...allLats) + 0.005
    const minLng = Math.min(...allLngs) - 0.005
    const maxLng = Math.max(...allLngs) + 0.005

    const toX = (lng: number) => padding + ((lng - minLng) / (maxLng - minLng)) * mapW
    const toY = (lat: number) => padding + ((maxLat - lat) / (maxLat - minLat)) * mapH

    const bgGrad = ctx.createLinearGradient(0, 0, 0, H)
    bgGrad.addColorStop(0, '#F0F4F8')
    bgGrad.addColorStop(1, '#E2E8F0')
    ctx.fillStyle = bgGrad
    ctx.fillRect(0, 0, W, H)

    ctx.font = '11px sans-serif'
    ctx.fillStyle = '#94A3B8'
    ctx.textAlign = 'center'
    for (let i = 0; i <= 4; i++) {
      const lat = minLat + (maxLat - minLat) * (i / 4)
      const y = toY(lat)
      ctx.fillText(`${lat.toFixed(2)}°S`, 20, y + 4)
    }
    for (let i = 0; i <= 4; i++) {
      const lng = minLng + (maxLng - minLng) * (i / 4)
      const x = toX(lng)
      ctx.fillText(`${Math.abs(lng).toFixed(2)}°W`, x, H - 8)
    }

    routes.forEach(route => {
      if (route.points.length < 2) return
      ctx.beginPath()
      ctx.strokeStyle = route.color
      ctx.lineWidth = 2.5
      ctx.setLineDash([])
      ctx.globalAlpha = 0.7
      const first = route.points[0]
      ctx.moveTo(toX(first.lng), toY(first.lat))
      for (let i = 1; i < route.points.length; i++) {
        ctx.lineTo(toX(route.points[i].lng), toY(route.points[i].lat))
      }
      ctx.stroke()
      ctx.globalAlpha = 1

      ctx.beginPath()
      ctx.strokeStyle = route.color
      ctx.lineWidth = 1
      ctx.setLineDash([4, 4])
      ctx.globalAlpha = 0.3
      ctx.moveTo(toX(first.lng), toY(first.lat))
      for (let i = 1; i < route.points.length; i++) {
        ctx.lineTo(toX(route.points[i].lng), toY(route.points[i].lat))
      }
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.setLineDash([])
    })

    pdvs.forEach(pdv => {
      const x = toX(pdv.lng)
      const y = toY(pdv.lat)

      const colors: Record<string, string> = {
        completed: '#16A34A',
        in_progress: '#F59E0B',
        pending: '#9CA3AF',
        stock_break: '#DC2626',
      }
      const color = colors[pdv.status] || '#9CA3AF'

      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.fillStyle = color
      ctx.fill()

      ctx.beginPath()
      ctx.arc(x, y, 7, 0, Math.PI * 2)
      ctx.strokeStyle = '#FFFFFF'
      ctx.lineWidth = 2
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(x, y, 10, 0, Math.PI * 2)
      ctx.fillStyle = `${color}22`
      ctx.fill()
    })
  }, [pdvs, routes])

  return (
    <canvas
      ref={canvasRef}
      className={`w-full rounded-lg ${className}`}
      style={{ height: 300 }}
    />
  )
}

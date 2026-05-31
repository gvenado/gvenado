import type { Visita } from '@/dashboard/types'

export interface LiveEvent {
  id: string
  type: 'critical' | 'stock_break' | 'completed' | 'closed' | 'deviation' | 'delayed'
  time: string
  description: string
  color: string
}

const EVENT_TEMPLATES: Array<{ description: string; color: string }> = [
  { description: 'Critical: Replenisher 1 overload detected at PDV Central', color: '#DC2626' },
  { description: 'Stock break alert at PDV Central - SKU-0452 critically low', color: '#DC2626' },
  { description: 'Visit completed at PDV Miraflores by Rep 2', color: '#16A34A' },
  { description: 'PDV San Pedro closed - out of schedule', color: '#F59E0B' },
  { description: 'Route deviation detected for Rep 3 at PDV Obrajes', color: '#F59E0B' },
  { description: 'Delayed arrival at PDV Calacoto - ETA +12 min', color: '#DC2626' },
  { description: 'Exhibition photo missing for PDV Sopocachi', color: '#F59E0B' },
  { description: 'Replenisher 4 completed all assigned PDVs ahead of schedule', color: '#16A34A' },
  { description: 'PDV Cotacota visit started - Rep 1 on site', color: '#2563EB' },
  { description: 'Warehouse Sur low stock alert for SKU-1023', color: '#F59E0B' },
  { description: 'Route optimization available for Rep 5 and Rep 6', color: '#2563EB' },
  { description: 'PDV Valle Hermoso closed - security incident reported', color: '#DC2626' },
]

const EVENT_TYPES: LiveEvent['type'][] = [
  'critical', 'stock_break', 'completed', 'closed', 'deviation', 'delayed',
  'critical', 'completed', 'critical', 'stock_break', 'deviation', 'closed',
]

function randomTime(): string {
  const h = 8 + Math.floor(Math.random() * 9)
  const m = Math.floor(Math.random() * 60)
  return `${h}:${String(m).padStart(2, '0')}`
}

function generateLiveEvents(): LiveEvent[] {
  const count = 4 + Math.floor(Math.random() * 3)
  const indices = new Set<number>()
  while (indices.size < Math.min(count, EVENT_TEMPLATES.length)) {
    indices.add(Math.floor(Math.random() * EVENT_TEMPLATES.length))
  }
  return Array.from(indices).map(i => ({
    id: `ev-${String(Date.now()).slice(-4)}-${i}`,
    type: EVENT_TYPES[i],
    time: randomTime(),
    description: EVENT_TEMPLATES[i].description,
    color: EVENT_TEMPLATES[i].color,
  }))
}

export async function fetchVisitasHoy(): Promise<{ visitas: Visita[]; events: LiveEvent[] }> {
  await new Promise(r => setTimeout(r, 200))
  return {
    visitas: [],
    events: generateLiveEvents(),
  }
}

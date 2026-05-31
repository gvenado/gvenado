import { api, type BackendVisita } from '@/api/client'
import type { Visita } from '@/dashboard/types'

export interface LiveEvent {
  id: string
  type: 'critical' | 'stock_break' | 'completed' | 'closed' | 'deviation' | 'delayed'
  time: string
  description: string
  color: string
}

function formatHora(iso: string | null): string {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' })
  } catch {
    return '—'
  }
}

function toFrontendVisita(v: BackendVisita): Visita {
  return {
    id: String(v.id),
    pdvId: String(v.pdv_id),
    reponedorId: String(v.reponedor_id),
    date: v.fecha,
    status: v.estado === 'completada' ? 'completed' : 'in_progress',
    duration: 0,
    notes: v.notas ?? '',
  }
}

function toEvent(v: BackendVisita): LiveEvent {
  const isCompleted = v.estado === 'completada'
  const mercado = v.pdv?.mercado ?? `PDV ${v.pdv_id}`
  const rep = v.reponedor?.nombre ?? `Rep ${v.reponedor_id}`

  return {
    id: `ev-${v.id}`,
    type: isCompleted ? 'completed' : 'deviation',
    time: formatHora(v.hora_inicio ?? v.hora_fin),
    description: isCompleted
      ? `Visita completada en ${mercado} por ${rep}`
      : `Visita pendiente en ${mercado}`,
    color: isCompleted ? '#16A34A' : '#F59E0B',
  }
}

export async function fetchVisitasHoy(): Promise<{ visitas: Visita[]; events: LiveEvent[] }> {
  try {
    const data = await api.getVisitasHoy()
    const backendVisitas = data as BackendVisita[]
    return {
      visitas: backendVisitas.map(toFrontendVisita),
      events: backendVisitas.slice(0, 8).map(toEvent),
    }
  } catch {
    return { visitas: [], events: [] }
  }
}

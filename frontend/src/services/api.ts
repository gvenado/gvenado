import { api } from '@/api/client'
import type { BackendReponedor, BackendPDV, BackendRutaHoy } from '@/api/client'
import type { RutaHoy, PDV, Reponedor } from '@/data/mockData'
import { MOCK_MICROTASKS } from '@/constants'
import type { MicroTask, DaySummary, PhotoUploadResult } from '@/types'
import { DEMO_DATE, DEMO_FALLBACK_ROUTE } from '@/config/demo'

function demoDate(): string {
  return DEMO_DATE
}

function mapReponedor(r: BackendReponedor): Reponedor {
  return {
    id: r.id,
    nombre: r.nombre,
    supervisor: r.supervisor?.nombre ?? '—',
  }
}

function mapPDV(p: BackendPDV): PDV {
  return {
    id: p.id,
    name: p.mercado,
    category: p.categoria,
    address: p.cliente,
    duration: `${p.visita_minutos} min`,
    latitud: p.latitud,
    longitud: p.longitud,
  }
}

function mapRutaHoy(r: BackendRutaHoy): RutaHoy {
  return {
    mochila: {
      marcaPrecios: r.mochila.marca_precios,
      colgantes: r.mochila.colgantes,
      cenefas: r.mochila.cenefas,
    },
    pdvs: r.pdvs.map(mapPDV),
    tiempo_estimado: r.tiempo_estimado,
  }
}

export async function fetchRutaHoy(reponedorId: number): Promise<RutaHoy> {
  const data = await api.getRutaHoy(reponedorId, demoDate())
  const ruta = mapRutaHoy(data)
  if (ruta.pdvs.length === 0) return DEMO_FALLBACK_ROUTE
  return ruta
}

export async function fetchReponedores(): Promise<Reponedor[]> {
  const data = await api.getReponedores()
  return data.map(mapReponedor)
}

export async function fetchMicrotasks(): Promise<MicroTask[]> {
  return MOCK_MICROTASKS
}

export async function fetchDaySummary(reponedorId?: number): Promise<DaySummary> {
  try {
    if (reponedorId !== undefined) {
      const visits = await api.getVisitasHoy(demoDate(), reponedorId)
      const completed = visits.filter(v => v.estado === 'completada').length
      const total = visits.length
      return {
        pdvsCompletados: completed,
        totalPdvs: total,
        tiempoTrabajado: '—',
        eficienciaPOP: total > 0 ? Math.round((completed / total) * 100) : 0,
        facesGanadas: 0,
        microTareasCompletadas: 0,
        totalMicroTareas: 0,
        popUsado: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
        popPlanificado: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
        materialRestante: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
        posicionSemanal: 0,
        totalReponedores: 0,
      }
    }
  } catch {
    // fall through to empty summary
  }
  return {
    pdvsCompletados: 0,
    totalPdvs: 0,
    tiempoTrabajado: '—',
    eficienciaPOP: 0,
    facesGanadas: 0,
    microTareasCompletadas: 0,
    totalMicroTareas: 0,
    popUsado: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
    popPlanificado: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
    materialRestante: { marcaPrecios: 0, colgantes: 0, cenefas: 0 },
    posicionSemanal: 0,
    totalReponedores: 0,
  }
}

export async function createVisita(pdvId: number, reponedorId: number): Promise<number> {
  const visita = await api.createVisita({
    pdv_id: pdvId,
    reponedor_id: reponedorId,
    fecha: demoDate(),
    hora_inicio: new Date().toISOString().replace('Z', ''),
  })
  return visita.id
}

// Uploads photo to backend, marks visita as completada.
// Returns foto_url from backend. hash_sha256 and faces_detectadas are not
// returned by this endpoint — see POST /api/vision/analyze if needed.
export async function uploadVisitaFoto(visitaId: number, file: File): Promise<PhotoUploadResult> {
  const result = await api.uploadVisitaFoto(visitaId, file)
  return { foto_url: result.foto_url ?? '' }
}

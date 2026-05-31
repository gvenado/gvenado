const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...init?.headers },
    ...init,
  })
  if (!res.ok) {
    throw new Error(`API ${res.status}: ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

// ── Backend shapes ────────────────────────────────────────────────────────────

export interface BackendPDV {
  id: number
  nro: number
  mercado: string
  categoria: string
  codigo: string
  cliente: string
  latitud: number
  longitud: number
  supervisor_id: number | null
  reponedor_id: number | null
  visita_minutos: number
  semanal: number
  mensual: number
}

export interface BackendReponedor {
  id: number
  nombre: string
  supervisor_id: number | null
  supervisor: { id: number; nombre: string } | null
  perfil_movilidad: { tipo: string; velocidad_kmh: number } | null
}

export interface BackendVisita {
  id: number
  pdv_id: number
  reponedor_id: number
  fecha: string
  hora_inicio: string | null
  hora_fin: string | null
  foto_url: string | null
  estado: string
  notas: string | null
  pdv?: { id: number; mercado: string; cliente: string }
  reponedor?: { id: number; nombre: string }
}

export interface BackendDeposito {
  id: number
  mercado: string
  stock: { marca_precios: number; colgantes: number; cenefas: number }
  consumo_promedio_diario: { marca_precios: number; colgantes: number; cenefas: number }
  dias_restantes: number
  riesgo_quiebre: 'alto' | 'medio' | 'bajo'
}

export interface BackendOptimizeResult {
  rutas_por_reponedor: Record<string, {
    reponedor_id: number
    reponedor_nombre: string
    pdvs: Array<{
      orden: number
      pdv_id: number
      cliente: string
      mercado: string
      latitud: number
      longitud: number
      visita_minutos: number
    }>
    total_km: number
    total_tiempo_min: number
    cantidad_pdvs: number
  }>
  metricas_globales: {
    total_km: number
    total_tiempo_min: number
    pdvs_asignados: number
    pdvs_totales_dia: number
    reponedores_usados: number
    max_tiempo_ruta_min: number
    balance_carga: {
      tiempo_promedio_min: number
      desviacion_std_min: number
      coeficiente_variacion: number
      reponedor_mas_cargado_id: number
      reponedor_menos_cargado_id: number
    }
  }
  pdvs_sin_asignar: number[]
  infactible: boolean
  from_cache: boolean
  notas: string[]
}

export interface BackendRedistribution {
  reponedor_ausente_id: number
  fecha: string
  redistribucion: Array<{
    pdv_id: number
    cliente: string
    mercado: string
    reponedor_asignado_id: number
    reponedor_asignado: string
  }>
  aviso: string
}

// ── API surface ───────────────────────────────────────────────────────────────

export const api = {
  getPdvs: (params?: { reponedor_id?: number; limit?: number }) => {
    const qs = params ? `?${new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined).map(([k, v]) => [k, String(v)]))
    )}` : ''
    return request<BackendPDV[]>(`/api/pdvs${qs}`)
  },

  getReponedores: () =>
    request<BackendReponedor[]>('/api/reponedores'),

  getVisitasHoy: (fecha?: string) => {
    const qs = fecha ? `?fecha=${fecha}` : ''
    return request<BackendVisita[]>(`/api/visitas/hoy${qs}`)
  },

  getDepositos: () =>
    request<BackendDeposito[]>('/api/depositos'),

  optimize: (fecha: string) =>
    request<BackendOptimizeResult>('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({ fecha, restricciones: {} }),
    }),

  simulateRedistribution: (reponedor_ausente_id: number, fecha: string) =>
    request<BackendRedistribution>('/api/simulate-redistribution', {
      method: 'POST',
      body: JSON.stringify({ reponedor_ausente_id, fecha }),
    }),
}

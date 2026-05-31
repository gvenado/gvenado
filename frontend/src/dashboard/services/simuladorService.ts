import { api, type BackendOptimizeResult, type BackendRedistribution } from '@/api/client'

export interface OptimizeRouteEntry {
  reponedorId: number
  nombre: string
  cantidadPdvs: number
  totalKm: number
  totalTiempoMin: number
}

export interface OptimizeResult {
  totalKm: number
  totalTiempoMin: number
  pdvsAsignados: number
  pdvsTotalesDia: number
  reponedoresUsados: number
  fromCache: boolean
  infactible: boolean
  notas: string[]
  pdvsSinAsignar: number[]
  maxTiempoRutaMin: number
  reponedorMasCargadoId: number
  rutasPorReponedor: OptimizeRouteEntry[]
  balanceCarga: {
    tiempoPromedioMin: number
    desviacionStdMin: number
    coeficienteVariacion: number
  }
}

export interface RedistribucionResult {
  aviso: string
  pdvsRedistribuidos: number
  reponedoresAfectados: number
  redistribucion: Array<{
    pdvId: number
    cliente: string
    mercado: string
    reponedorAsignadoId: number
    reponedorAsignado: string
  }>
}

export async function optimizeRoutes(fecha: string): Promise<OptimizeResult> {
  const data = await api.optimize(fecha) as BackendOptimizeResult

  const rutasPorReponedor: OptimizeRouteEntry[] = Object.values(data.rutas_por_reponedor).map(r => ({
    reponedorId: r.reponedor_id,
    nombre: r.reponedor_nombre,
    cantidadPdvs: r.cantidad_pdvs,
    totalKm: r.total_km,
    totalTiempoMin: r.total_tiempo_min,
  }))

  return {
    totalKm: data.metricas_globales.total_km,
    totalTiempoMin: data.metricas_globales.total_tiempo_min,
    pdvsAsignados: data.metricas_globales.pdvs_asignados,
    pdvsTotalesDia: data.metricas_globales.pdvs_totales_dia,
    reponedoresUsados: data.metricas_globales.reponedores_usados,
    maxTiempoRutaMin: data.metricas_globales.max_tiempo_ruta_min,
    reponedorMasCargadoId: data.metricas_globales.balance_carga.reponedor_mas_cargado_id,
    fromCache: data.from_cache,
    infactible: data.infactible,
    notas: data.notas,
    pdvsSinAsignar: data.pdvs_sin_asignar,
    rutasPorReponedor,
    balanceCarga: {
      tiempoPromedioMin: data.metricas_globales.balance_carga.tiempo_promedio_min,
      desviacionStdMin: data.metricas_globales.balance_carga.desviacion_std_min,
      coeficienteVariacion: data.metricas_globales.balance_carga.coeficiente_variacion,
    },
  }
}

export async function simulateRedistribution(reponedorAusenteId: number, fecha: string): Promise<RedistribucionResult> {
  const data = await api.simulateRedistribution(reponedorAusenteId, fecha) as BackendRedistribution
  const reponedoresAfectados = new Set(data.redistribucion.map(r => r.reponedor_asignado_id)).size
  return {
    aviso: data.aviso,
    pdvsRedistribuidos: data.redistribucion.length,
    reponedoresAfectados,
    redistribucion: data.redistribucion.map(r => ({
      pdvId: r.pdv_id,
      cliente: r.cliente,
      mercado: r.mercado,
      reponedorAsignadoId: r.reponedor_asignado_id,
      reponedorAsignado: r.reponedor_asignado,
    })),
  }
}

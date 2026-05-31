import { api, type BackendOptimizeResult, type BackendRedistribution } from '@/api/client'

export interface OptimizeResult {
  totalKm: number
  totalTiempoMin: number
  pdvsAsignados: number
  pdvsTotalesDia: number
  reponedoresUsados: number
  fromCache: boolean
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
}

export async function optimizeRoutes(fecha: string): Promise<OptimizeResult> {
  const data = await api.optimize(fecha) as BackendOptimizeResult
  return {
    totalKm: data.metricas_globales.total_km,
    totalTiempoMin: data.metricas_globales.total_tiempo_min,
    pdvsAsignados: data.metricas_globales.pdvs_asignados,
    pdvsTotalesDia: data.metricas_globales.pdvs_totales_dia,
    reponedoresUsados: data.metricas_globales.reponedores_usados,
    fromCache: data.from_cache,
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
  }
}

import { MOCK_RUTA_HOY, MOCK_REPONEDORES, simulateApiCall } from '@/data/mockData'
import type { RutaHoy, PDV, Reponedor } from '@/data/mockData'
import { MOCK_MICROTASKS } from '@/constants'
import type { MicroTask, DaySummary } from '@/types'

export async function fetchRutaHoy(): Promise<RutaHoy> {
  return simulateApiCall(MOCK_RUTA_HOY, 1000)
}

export async function fetchPdvById(id: string): Promise<PDV | null> {
  const pdv = MOCK_RUTA_HOY.pdvs.find(p => p.id === id)
  return simulateApiCall(pdv ?? null, 500)
}

export async function fetchMicrotasks(): Promise<MicroTask[]> {
  return simulateApiCall(MOCK_MICROTASKS, 300)
}

export async function fetchReponedores(): Promise<Reponedor[]> {
  return simulateApiCall(MOCK_REPONEDORES, 300)
}

export async function analyzePhoto(_before: string, _after: string): Promise<string> {
  return simulateApiCall('✓ Detectamos 7 caras de Frussion. POP cenefa instalado correctamente.', 1500)
}

export async function fetchDaySummary(): Promise<DaySummary> {
  return simulateApiCall({
    pdvsCompletados: 5,
    totalPdvs: 5,
    tiempoTrabajado: '6h 12min',
    eficienciaPOP: 92,
    facesGanadas: 43,
    microTareasCompletadas: 25,
    totalMicroTareas: 25,
    popUsado: { marcaPrecios: 18, colgantes: 12, cenefas: 8 },
    popPlanificado: { marcaPrecios: 24, colgantes: 18, cenefas: 12 },
    materialRestante: { marcaPrecios: 6, colgantes: 6, cenefas: 4 },
    posicionSemanal: 3,
    totalReponedores: 12,
  }, 800)
}

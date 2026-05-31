import type { PDV, Mochila, Reponedor, RutaHoy } from '@/data/mockData'

export type { PDV, Mochila, Reponedor, RutaHoy }

export interface MicroTask {
  id: number
  nombre: string
  descripcion: string
  tipo: 'toggle' | 'numeric' | 'photo'
  consumeMochila: Partial<Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>>
  requiereFoto: boolean
}

export interface PhotoEvidence {
  before: string | null
  after: string | null
  analyzing: boolean
  analysisResult: string | null
  analysisComplete: boolean
}

export interface TaskProgress {
  id: number
  completed: boolean
  value: number | null
}

export interface DaySummary {
  pdvsCompletados: number
  totalPdvs: number
  tiempoTrabajado: string
  eficienciaPOP: number
  facesGanadas: number
  microTareasCompletadas: number
  totalMicroTareas: number
  popUsado: Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>
  popPlanificado: Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>
  materialRestante: Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>
  posicionSemanal: number
  totalReponedores: number
}

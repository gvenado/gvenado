import type { PDV, Mochila, Reponedor, RutaHoy } from '@/data/mockData'

export type { PDV, Mochila, Reponedor, RutaHoy }

export interface MicroTask {
  id: number
  nombre: string
  descripcion: string
  tipo: 'toggle' | 'numeric' | 'photo'
  /** For photo tasks: which slot this task captures */
  photoSlot?: 'before' | 'after'
  /** false = optional task; omitting or true = required for visit close */
  required?: boolean
  consumeMochila: Partial<Pick<Mochila, 'marcaPrecios' | 'colgantes' | 'cenefas'>>
  requiereFoto: boolean
}

export interface PhotoUploadResult {
  foto_url: string
  hash_sha256?: string
  faces_detectadas?: number
}

export interface PhotoEvidence {
  before: string | null           // local preview URL (createObjectURL)
  after: string | null            // local preview URL (createObjectURL)
  beforeResult: PhotoUploadResult | null   // response from POST /api/visitas/{id}/foto
  afterResult: PhotoUploadResult | null
  uploading: 'before' | 'after' | null
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

export interface GaleriaImage {
  id: string
  pdvId: string
  beforeUrl: string
  afterUrl: string
  date: string
  reponedorId: string
}

export interface EvidenceTag {
  label: string
  type: 'success' | 'warning' | 'error'
}

export interface EvidenceCardData {
  id: string
  storeName: string
  replenisher: string
  time: string
  beforeUrl: string
  afterUrl: string
  beforeLabel: string
  afterLabel: string
  facesGained: number
  tags: EvidenceTag[]
  date: string
}

export interface ComplianceItem {
  label: string
  percentage: number
  color: string
}

export interface ImprovementItem {
  code: string
  name: string
  facesGained: number
}

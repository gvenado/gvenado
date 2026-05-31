export interface Visita {
  id: string
  pdvId: string
  reponedorId: string
  date: string
  status: 'scheduled' | 'in_progress' | 'completed' | 'missed'
  duration: number
  notes: string
}

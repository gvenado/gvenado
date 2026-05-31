export type PDVStatus = 'completed' | 'in_progress' | 'pending' | 'stock_break'

export interface PDV {
  id: string
  name: string
  address: string
  reponedorId: string
  status: PDVStatus
  lat: number
  lng: number
  visitOrder: number
}

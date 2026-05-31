export type ReponedorStatus = 'idle' | 'in_route' | 'at_pdv' | 'overloaded'

export interface Reponedor {
  id: string
  name: string
  photoUrl: string
  workload: number
  assignedPdvs: number
  status: ReponedorStatus
  rating: number
  color: string
}

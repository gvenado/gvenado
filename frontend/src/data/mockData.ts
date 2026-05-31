export interface Reponedor {
  id: string
  nombre: string
  supervisor: string
}

export interface Mochila {
  marcaPrecios: number
  colgantes: number
  cenefas: number
}

export interface PDV {
  id: string
  name: string
  category: string
  address: string
  duration: string
}

export interface RutaHoy {
  mochila: Mochila
  pdvs: PDV[]
}

export const MOCK_REPONEDORES: Reponedor[] = [
  { id: 'rep-001', nombre: 'Carlos Flores', supervisor: 'María López' },
  { id: 'rep-002', nombre: 'María Rojas', supervisor: 'Pedro Sánchez' },
  { id: 'rep-003', nombre: 'Juan Pérez', supervisor: 'María López' },
]

export const MOCK_RUTA_HOY: RutaHoy = {
  mochila: {
    marcaPrecios: 24,
    colgantes: 18,
    cenefas: 12,
  },
  pdvs: [
    { id: 'pdv-001', name: 'Supermercado Ketal', category: 'Supermercado', address: 'Calle 21 de Calacoto #1234', duration: '15 min' },
    { id: 'pdv-002', name: 'Hipermaxi Sopocachi', category: 'Hipermercado', address: 'Av. 6 de Agosto #567', duration: '20 min' },
    { id: 'pdv-003', name: 'IC Norte', category: 'Centro Comercial', address: 'Av. Montenegro #890', duration: '25 min' },
    { id: 'pdv-004', name: 'Fidalga San Miguel', category: 'Supermercado', address: 'Av. Ballivián #4321', duration: '10 min' },
    { id: 'pdv-005', name: 'SLS MegaCenter', category: 'Hipermercado', address: 'Av. Banzer Esq. 4to Anillo', duration: '30 min' },
  ],
}

export function simulateApiCall<T>(data: T, delay = 1000): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay))
}

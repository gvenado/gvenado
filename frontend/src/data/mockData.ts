export interface Reponedor {
  id: number
  nombre: string
  supervisor: string
}

export interface Mochila {
  marcaPrecios: number
  colgantes: number
  cenefas: number
}

export interface PDV {
  id: number
  name: string
  category: string
  address: string
  duration: string
  latitud?: number
  longitud?: number
}

export interface RutaHoy {
  mochila: Mochila
  pdvs: PDV[]
  tiempo_estimado?: number
}

export const MOCK_REPONEDORES: Reponedor[] = [
  { id: 1, nombre: 'REPONEDOR 1', supervisor: 'SUPERVISOR 1' },
  { id: 2, nombre: 'REPONEDOR 2', supervisor: 'SUPERVISOR 1' },
  { id: 3, nombre: 'REPONEDOR 3', supervisor: 'SUPERVISOR 2' },
]

export const MOCK_RUTA_HOY: RutaHoy = {
  mochila: {
    marcaPrecios: 24,
    colgantes: 18,
    cenefas: 12,
  },
  pdvs: [
    { id: 1, name: 'CHASQUIPAMPA', category: 'MINORISTA', address: 'GV001', duration: '40 min', latitud: -16.537, longitud: -68.047 },
    { id: 2, name: 'GARCILAZO', category: 'MAYORISTA', address: 'GV002', duration: '30 min', latitud: -16.493, longitud: -68.142 },
    { id: 3, name: 'SOPOCACHI', category: 'DETALLISTA', address: 'GV003', duration: '20 min', latitud: -16.510, longitud: -68.125 },
  ],
  tiempo_estimado: 180,
}

export function simulateApiCall<T>(data: T, delay = 1000): Promise<T> {
  return new Promise(resolve => setTimeout(() => resolve(data), delay))
}

import type { PDV } from '@/dashboard/types'

function pdv(
  id: string, name: string, address: string,
  reponedorId: string, status: PDV['status'],
  lat: number, lng: number, visitOrder: number
): PDV {
  return { id, name, address, reponedorId, status, lat, lng, visitOrder }
}

export const mockPDVs: PDV[] = [
  pdv('pdv-01', 'PDV Central', 'Av. 16 de Julio #1500', 'rep-1', 'stock_break', -16.495, -68.134, 1),
  pdv('pdv-02', 'PDV Sopocachi', 'Calle Guachalla #200', 'rep-1', 'completed', -16.507, -68.127, 2),
  pdv('pdv-03', 'PDV Miraflores', 'Av. Buenos Aires #500', 'rep-1', 'in_progress', -16.515, -68.119, 3),
  pdv('pdv-04', 'PDV San Pedro', 'Calle Murillo #100', 'rep-1', 'pending', -16.490, -68.145, 4),
  pdv('pdv-05', 'PDV Obrajes', 'Av. Ballivián #800', 'rep-1', 'pending', -16.527, -68.103, 5),
  pdv('pdv-06', 'PDV Cotacota', 'Av. Alexander #300', 'rep-1', 'pending', -16.534, -68.092, 6),
  pdv('pdv-07', 'PDV Calacoto', 'Calle 21 #50', 'rep-1', 'pending', -16.539, -68.082, 7),
  pdv('pdv-08', 'PDV Achumani', 'Calle 15 #120', 'rep-1', 'pending', -16.545, -68.074, 8),
  pdv('pdv-09', 'PDV Cota Cota', 'Av. Cota Cota #400', 'rep-2', 'completed', -16.530, -68.088, 1),
  pdv('pdv-10', 'PDV Bolognia', 'Calle 5 #80', 'rep-2', 'completed', -16.522, -68.097, 2),
  pdv('pdv-11', 'PDV San Miguel', 'Av. Montenegro #600', 'rep-2', 'completed', -16.514, -68.108, 3),
  pdv('pdv-12', 'PDV La Florida', 'Calle 8 #200', 'rep-2', 'in_progress', -16.506, -68.115, 4),
  pdv('pdv-13', 'PDV Irpavi', 'Calle 16 #300', 'rep-2', 'pending', -16.540, -68.078, 5),
  pdv('pdv-14', 'PDV Següencoma', 'Av. Costanera #500', 'rep-2', 'pending', -16.535, -68.070, 6),
  pdv('pdv-15', 'PDV Chasquipampa', 'Calle Principal #100', 'rep-2', 'pending', -16.550, -68.065, 7),
  pdv('pdv-16', 'PDV Villa Copacabana', 'Av. Panorámica #250', 'rep-3', 'completed', -16.470, -68.150, 1),
  pdv('pdv-17', 'PDV Villa Fatima', 'Av. Las Américas #300', 'rep-3', 'completed', -16.480, -68.140, 2),
  pdv('pdv-18', 'PDV El Alto', 'Av. Juan Pablo II #1000', 'rep-3', 'in_progress', -16.490, -68.170, 3),
  pdv('pdv-19', 'PDV Alto Obrajes', 'Av. Pablo Sánchez #400', 'rep-4', 'completed', -16.518, -68.100, 1),
  pdv('pdv-20', 'PDV San Jorge', 'Calle 14 #60', 'rep-4', 'completed', -16.510, -68.120, 2),
  pdv('pdv-21', 'PDV Llojeta', 'Av. Kantutani #500', 'rep-4', 'in_progress', -16.485, -68.155, 3),
  pdv('pdv-22', 'PDV Villa Salome', 'Calle Murillo #220', 'rep-5', 'completed', -16.460, -68.165, 1),
  pdv('pdv-23', 'PDV Pampahasi', 'Av. Periférica #700', 'rep-6', 'completed', -16.500, -68.080, 1),
  pdv('pdv-24', 'PDV Valle Hermoso', 'Calle 1 #150', 'rep-7', 'completed', -16.475, -68.160, 1),
]

const rep1Assignments = mockPDVs.filter(p => p.reponedorId === 'rep-1').map(p => p.id)
const rep2Assignments = mockPDVs.filter(p => p.reponedorId === 'rep-2').map(p => p.id)

export const mockOptimizedPDVs: PDV[] = mockPDVs.map(p => {
  if (rep1Assignments.includes(p.id) && ['pdv-06', 'pdv-07', 'pdv-08'].includes(p.id)) {
    return { ...p, reponedorId: 'rep-5', status: 'pending' as const }
  }
  if (rep2Assignments.includes(p.id) && ['pdv-13', 'pdv-14'].includes(p.id)) {
    return { ...p, reponedorId: 'rep-6', status: 'pending' as const }
  }
  if (p.id === 'pdv-24') return { ...p, reponedorId: 'rep-6', status: 'pending' as const }
  if (rep1Assignments.includes(p.id) && p.id === 'pdv-05') {
    return { ...p, reponedorId: 'rep-7', status: 'pending' as const }
  }
  return p
})

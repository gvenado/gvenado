import type { PDV } from '@/dashboard/types'

const CATEGORIES = ['Minimarket', 'Kiosko', 'Farmacia', 'Abarrotes', 'Restaurante', 'Libreria', 'Panaderia', 'Carniceria']
const CUSTOMER_NAMES = [
  'Minimarket Sofia', 'Kiosko El Sol', 'Farmacia San Jose', 'Supermercado Bolivar',
  'Tienda La Esquina', 'Panaderia El Progreso', 'Minimarket Los Andes', 'Carniceria La Paz',
  'Farmacia Central', 'Abarrotes Don Carlos', 'Libreria El Estudiante', 'Restaurante La Casona',
  'Kiosko 16 de Julio', 'Minimarket Murillo', 'Tienda Santa Cruz', 'Panaderia San Martin',
  'Farmacia Popular', 'Abarrotes La Colonia', 'Carniceria Del Valle', 'Supermercado Norte',
  'Restaurante El Patio', 'Kiosko Central', 'Minimarket Sopocachi', 'Libreria Mundial',
]

const STATUSES: PDV['status'][] = ['completed', 'in_progress', 'pending', 'stock_break']

function generateMockPdvs(count: number): PDV[] {
  const result: PDV[] = []
  for (let i = 0; i < count; i++) {
    const lat = -16.5 + (Math.random() - 0.5) * 0.14
    const lng = -68.12 + (Math.random() - 0.5) * 0.14
    const nameIdx = i % CUSTOMER_NAMES.length
    const repIdx = (i % 79) === 0 ? Math.min(Math.floor(i / 79), 5) : Math.floor(i / 79) % 6
    result.push({
      id: `pdv-${String(i + 1).padStart(3, '0')}`,
      name: CUSTOMER_NAMES[nameIdx] + (i >= CUSTOMER_NAMES.length ? ` ${Math.floor(i / CUSTOMER_NAMES.length) + 1}` : ''),
      address: `Av. ${CATEGORIES[i % CATEGORIES.length]} #${100 + i}`,
      reponedorId: `rep-${repIdx + 1}`,
      status: STATUSES[i % 4],
      lat,
      lng,
      visitOrder: (i % 79) + 1,
    })
  }
  return result
}

let cachedPdvs: PDV[] | null = null

export async function fetchPdvs(): Promise<PDV[]> {
  await new Promise(r => setTimeout(r, 400))
  if (!cachedPdvs) {
    cachedPdvs = generateMockPdvs(474)
  }
  return cachedPdvs!
}

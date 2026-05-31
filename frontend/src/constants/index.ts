import type { MicroTask } from '@/types'

export const ASTA_COLORS = {
  primary: '#DC2626',
  primaryHover: '#B91C1C',
  background: '#F8FAFC',
  card: '#FFFFFF',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  border: '#E2E8F0',
} as const

export const ROUTES = {
  LOGIN: '/login',
  RUTA_HOY: '/app/ruta-hoy',
  PDV: '/app/pdv',
  CHECKLIST: '/app/pdv/:id/checklist',
  CIERRE_DIA: '/app/cierre-dia',
} as const

export function getPdvRoute(id: string) {
  return `/app/pdv/${id}`
}

export function getChecklistRoute(id: string) {
  return `/app/pdv/${id}/checklist`
}

export const CATEGORY_BADGES: Record<string, string> = {
  // Backend categories (UPPERCASE)
  'MINORISTA': 'bg-red-50 text-[#DC2626]',
  'MAYORISTA': 'bg-orange-50 text-[#EA580C]',
  'DETALLISTA': 'bg-amber-50 text-[#D97706]',
  // Legacy mock categories
  'Supermercado': 'bg-red-50 text-[#DC2626]',
  'Hipermercado': 'bg-orange-50 text-[#EA580C]',
  'Centro Comercial': 'bg-amber-50 text-[#D97706]',
}

// LOCAL DEMO STATE — no backend checklist endpoint.
// When the backend gains a checklist endpoint, replace this with an API call in fetchMicrotasks().
export const MOCK_MICROTASKS: MicroTask[] = [
  {
    id: 1,
    nombre: 'Confirmar disponibilidad de producto',
    descripcion: 'Verificá que todos los productos asignados estén disponibles en la góndola.',
    tipo: 'toggle',
    consumeMochila: {},
    requiereFoto: false,
    required: true,
  },
  {
    id: 2,
    nombre: 'Instalar marca precios',
    descripcion: 'Colocá las etiquetas de precio correctamente en todos los productos.',
    tipo: 'toggle',
    consumeMochila: { marcaPrecios: 2 },
    requiereFoto: false,
    required: true,
  },
  {
    id: 3,
    nombre: 'Instalar colgantes',
    descripcion: 'Colocá los colgantes promocionales según el planograma indicado.',
    tipo: 'toggle',
    consumeMochila: { colgantes: 2 },
    requiereFoto: false,
    required: true,
  },
  {
    id: 4,
    nombre: 'Instalar cenefas',
    descripcion: 'Colocá las cenefas en los estantes según las indicaciones del supervisor.',
    tipo: 'toggle',
    consumeMochila: { cenefas: 1 },
    requiereFoto: false,
    required: true,
  },
  {
    id: 5,
    nombre: 'Foto antes',
    descripcion: 'Tomá una foto del estado inicial del PDV antes de iniciar la reposición.',
    tipo: 'photo',
    photoSlot: 'before',
    consumeMochila: {},
    requiereFoto: true,
    required: true,
  },
  {
    id: 6,
    nombre: 'Foto después',
    descripcion: 'Tomá una foto del estado final del PDV luego de completar la reposición.',
    tipo: 'photo',
    photoSlot: 'after',
    consumeMochila: {},
    requiereFoto: true,
    required: true,
  },
  {
    id: 7,
    nombre: 'Reportar incidencia',
    descripcion: 'Si encontraste algún problema (faltante, daño, producto vencido), registralo. Opcional.',
    tipo: 'toggle',
    consumeMochila: {},
    requiereFoto: false,
    required: false,
  },
]

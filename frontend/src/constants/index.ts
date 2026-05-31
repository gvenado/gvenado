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
  'Supermercado': 'bg-red-50 text-[#DC2626]',
  'Hipermercado': 'bg-orange-50 text-[#EA580C]',
  'Centro Comercial': 'bg-amber-50 text-[#D97706]',
}

export const MOCK_MICROTASKS: MicroTask[] = [
  {
    id: 1,
    nombre: 'Armado y mantenimiento de exhibiciones',
    descripcion: 'Verificá que todos los productos tengan el precio visible y correcto.',
    tipo: 'toggle',
    consumeMochila: {},
    requiereFoto: false,
  },
  {
    id: 2,
    nombre: 'Toma y actualización de precios',
    descripcion: 'Registrá los precios actualizados de los productos en la góndola.',
    tipo: 'numeric',
    consumeMochila: { marcaPrecios: 1 },
    requiereFoto: false,
  },
  {
    id: 3,
    nombre: 'Limpieza y generación de espacios',
    descripcion: 'Asegurate de que los pasillos y exhibiciones estén limpios y ordenados.',
    tipo: 'toggle',
    consumeMochila: {},
    requiereFoto: false,
  },
  {
    id: 4,
    nombre: 'Instalación de material POP',
    descripcion: 'Colocá los colgantes y cenefas promocionales según el planograma.',
    tipo: 'photo',
    consumeMochila: { colgantes: 2, cenefas: 2 },
    requiereFoto: true,
  },
  {
    id: 5,
    nombre: 'Toma de inventarios',
    descripcion: 'Registrá el stock actual y detectá quiebres de stock.',
    tipo: 'toggle',
    consumeMochila: {},
    requiereFoto: true,
  },
]

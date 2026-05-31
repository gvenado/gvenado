export const ASTA_COLORS = {
  primary: '#DC2626',
  primaryHover: '#B91C1C',
  background: '#FFFFFF',
  card: '#FFFFFF',
  sidebar: '#991B1B',
  sidebarHover: '#B91C1C',
  primaryText: '#111827',
  secondaryText: '#6B7280',
  border: '#E5E7EB',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  completed: '#16A34A',
  inProgress: '#F59E0B',
  pending: '#9CA3AF',
  stockBreak: '#DC2626',
} as const

export const ROUTES = {
  OVERVIEW: '/',
  MAPA_VIVO: '/mapa-vivo',
  REPONEDORES: '/reponedores',
  GALERIA: '/galeria',
  DEPOSITOS: '/depositos',
  SIMULADOR: '/simulador',
} as const

export const NAV_ITEMS = [
  { label: 'Overview', href: ROUTES.OVERVIEW, icon: 'LayoutDashboard' },
  { label: 'Live Map', href: ROUTES.MAPA_VIVO, icon: 'Map' },
  { label: 'Replenishers', href: ROUTES.REPONEDORES, icon: 'Users' },
  { label: 'AI Gallery', href: ROUTES.GALERIA, icon: 'Image' },
  { label: 'POP Warehouses', href: ROUTES.DEPOSITOS, icon: 'Warehouse' },
  { label: 'Simulator', href: ROUTES.SIMULADOR, icon: 'GitCompare' },
] as const

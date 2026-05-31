import type { EvidenceCardData } from '@/dashboard/types'

function placeholder(label: string, sub: string, hue: number): string {
  const c1 = `hsl(${hue}, 35%, 94%)`
  const c2 = `hsl(${hue}, 25%, 85%)`
  return `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="280">
      <defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient></defs>
      <rect fill="url(#g)" width="400" height="280"/>
      <rect fill="rgba(0,0,0,0.02)" width="400" height="280"/>
      <text x="200" y="120" text-anchor="middle" font-family="Arial,sans-serif" font-size="16" font-weight="bold" fill="#111827">${label}</text>
      <text x="200" y="150" text-anchor="middle" font-family="Arial,sans-serif" font-size="12" fill="#6B7280">${sub}</text>
    </svg>`
  )}`
}

const MOCK_EVIDENCE: EvidenceCardData[] = [
  {
    id: 'ev-001',
    storeName: 'Tienda Los Andes',
    replenisher: 'Rep 5',
    time: '11:02',
    beforeUrl: placeholder('ANTES', '4 frentes Pepsi', 210),
    afterUrl: placeholder('DESPUÉS', '8 frentes Pepsi', 30),
    beforeLabel: 'Antes: 4 frentes Pepsi',
    afterLabel: 'Después: 8 frentes Pepsi',
    facesGained: 4,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
      { label: 'Precio visible', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-002',
    storeName: 'Minimarket Don Lucho',
    replenisher: 'Rep 3',
    time: '10:45',
    beforeUrl: placeholder('ANTES', '2 frentes Coca-Cola', 210),
    afterUrl: placeholder('DESPUÉS', '6 frentes Coca-Cola', 30),
    beforeLabel: 'Antes: 2 frentes Coca-Cola',
    afterLabel: 'Después: 6 frentes Coca-Cola',
    facesGained: 4,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-003',
    storeName: 'Super 24 Horas',
    replenisher: 'Rep 7',
    time: '09:30',
    beforeUrl: placeholder('ANTES', 'Sin stock', 210),
    afterUrl: placeholder('DESPUÉS', 'Reabastecido', 30),
    beforeLabel: 'Antes: Sin stock',
    afterLabel: 'Después: Reabastecido',
    facesGained: 6,
    tags: [
      { label: 'Quiebre detectado', type: 'error' },
      { label: 'Estante instalado', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-004',
    storeName: 'Autoservicio El Prado',
    replenisher: 'Rep 2',
    time: '08:15',
    beforeUrl: placeholder('ANTES', '3 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '7 frentes', 30),
    beforeLabel: 'Antes: 3 frentes',
    afterLabel: 'Después: 7 frentes',
    facesGained: 4,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
      { label: 'Precio visible', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-005',
    storeName: 'Bodega San Isidro',
    replenisher: 'Rep 1',
    time: '14:20',
    beforeUrl: placeholder('ANTES', '1 frente', 210),
    afterUrl: placeholder('DESPUÉS', '5 frentes', 30),
    beforeLabel: 'Antes: 1 frente',
    afterLabel: 'Después: 5 frentes',
    facesGained: 4,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-006',
    storeName: 'Mercado El Palomar',
    replenisher: 'Rep 4',
    time: '15:10',
    beforeUrl: placeholder('ANTES', 'Sin exhibición', 210),
    afterUrl: placeholder('DESPUÉS', 'Exhibición completa', 30),
    beforeLabel: 'Antes: Sin exhibición',
    afterLabel: 'Después: Exhibición completa',
    facesGained: 8,
    tags: [
      { label: 'Quiebre detectado', type: 'error' },
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-24',
  },
  {
    id: 'ev-007',
    storeName: 'Súper Ahorro',
    replenisher: 'Rep 3',
    time: '09:55',
    beforeUrl: placeholder('ANTES', '2 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '11 frentes', 30),
    beforeLabel: 'Antes: 2 frentes',
    afterLabel: 'Después: 11 frentes',
    facesGained: 9,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-24',
  },
  {
    id: 'ev-008',
    storeName: 'Minimarket Central',
    replenisher: 'Rep 5',
    time: '11:30',
    beforeUrl: placeholder('ANTES', '3 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '10 frentes', 30),
    beforeLabel: 'Antes: 3 frentes',
    afterLabel: 'Después: 10 frentes',
    facesGained: 7,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-24',
  },
  {
    id: 'ev-009',
    storeName: 'Tienda Los Olivos',
    replenisher: 'Rep 2',
    time: '10:20',
    beforeUrl: placeholder('ANTES', '3 frentes Coca-Cola', 210),
    afterUrl: placeholder('DESPUÉS', '6 frentes Coca-Cola', 30),
    beforeLabel: 'Antes: 3 frentes Coca-Cola',
    afterLabel: 'Después: 6 frentes Coca-Cola',
    facesGained: 3,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Precio visible', type: 'success' },
    ],
    date: '2025-05-24',
  },
  {
    id: 'ev-010',
    storeName: 'Autoservicio Los Andes',
    replenisher: 'Rep 6',
    time: '08:00',
    beforeUrl: placeholder('ANTES', 'Sin stock', 210),
    afterUrl: placeholder('DESPUÉS', 'Reabastecido', 30),
    beforeLabel: 'Antes: Sin stock',
    afterLabel: 'Después: Reabastecido',
    facesGained: 5,
    tags: [
      { label: 'Quiebre detectado', type: 'error' },
      { label: 'Estante instalado', type: 'success' },
    ],
    date: '2025-05-22',
  },
  {
    id: 'ev-011',
    storeName: 'Supermercado Oriental',
    replenisher: 'Rep 1',
    time: '13:15',
    beforeUrl: placeholder('ANTES', '2 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '4 frentes', 30),
    beforeLabel: 'Antes: 2 frentes',
    afterLabel: 'Después: 4 frentes',
    facesGained: 2,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-22',
  },
  {
    id: 'ev-012',
    storeName: 'Bodega Santa Fe',
    replenisher: 'Rep 7',
    time: '07:45',
    beforeUrl: placeholder('ANTES', '1 frente Pepsi', 210),
    afterUrl: placeholder('DESPUÉS', '4 frentes Pepsi', 30),
    beforeLabel: 'Antes: 1 frente Pepsi',
    afterLabel: 'Después: 4 frentes Pepsi',
    facesGained: 3,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Precio visible', type: 'success' },
    ],
    date: '2025-05-22',
  },
  {
    id: 'ev-013',
    storeName: 'Minimarket San Martín',
    replenisher: 'Rep 4',
    time: '16:00',
    beforeUrl: placeholder('ANTES', '4 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '6 frentes', 30),
    beforeLabel: 'Antes: 4 frentes',
    afterLabel: 'Después: 6 frentes',
    facesGained: 2,
    tags: [
      { label: 'Estante instalado', type: 'success' },
    ],
    date: '2025-05-25',
  },
  {
    id: 'ev-014',
    storeName: 'Súper Ahorro',
    replenisher: 'Rep 3',
    time: '10:05',
    beforeUrl: placeholder('ANTES', '2 frentes', 210),
    afterUrl: placeholder('DESPUÉS', '8 frentes', 30),
    beforeLabel: 'Antes: 2 frentes',
    afterLabel: 'Después: 8 frentes',
    facesGained: 6,
    tags: [
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-25',
  },
  {
    id: 'ev-015',
    storeName: 'Abasto Don Miguel',
    replenisher: 'Rep 6',
    time: '09:40',
    beforeUrl: placeholder('ANTES', 'Sin stock Coca-Cola', 210),
    afterUrl: placeholder('DESPUÉS', '6 frentes Coca-Cola', 30),
    beforeLabel: 'Antes: Sin stock Coca-Cola',
    afterLabel: 'Después: 6 frentes Coca-Cola',
    facesGained: 6,
    tags: [
      { label: 'Quiebre detectado', type: 'error' },
      { label: 'Estante instalado', type: 'success' },
      { label: 'Mejorado', type: 'success' },
    ],
    date: '2025-05-25',
  },
]

export async function fetchGalleryEvidence(): Promise<EvidenceCardData[]> {
  await new Promise(r => setTimeout(r, 200))
  return MOCK_EVIDENCE
}

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
    beforeUrl: placeholder('BEFORE', '4 Pepsi Facings', 210),
    afterUrl: placeholder('AFTER', '8 Pepsi Facings', 30),
    beforeLabel: 'Before: 4 Pepsi Facings',
    afterLabel: 'After: 8 Pepsi Facings',
    facesGained: 4,
    tags: [
      { label: 'Shelf Installed', type: 'success' },
      { label: 'Improved', type: 'success' },
      { label: 'Price Tag Visible', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-002',
    storeName: 'Minimarket Don Lucho',
    replenisher: 'Rep 3',
    time: '10:45',
    beforeUrl: placeholder('BEFORE', '2 Coca-Cola Facings', 210),
    afterUrl: placeholder('AFTER', '6 Coca-Cola Facings', 30),
    beforeLabel: 'Before: 2 Coca-Cola Facings',
    afterLabel: 'After: 6 Coca-Cola Facings',
    facesGained: 4,
    tags: [
      { label: 'Shelf Installed', type: 'success' },
      { label: 'Improved', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-003',
    storeName: 'Super 24 Horas',
    replenisher: 'Rep 7',
    time: '09:30',
    beforeUrl: placeholder('BEFORE', 'Missing Stock', 210),
    afterUrl: placeholder('AFTER', 'Restocked', 30),
    beforeLabel: 'Before: Missing Stock',
    afterLabel: 'After: Restocked',
    facesGained: 6,
    tags: [
      { label: 'Stock Break Detected', type: 'error' },
      { label: 'Shelf Installed', type: 'success' },
    ],
    date: '2025-05-23',
  },
  {
    id: 'ev-004',
    storeName: 'Autoservicio El Prado',
    replenisher: 'Rep 2',
    time: '08:15',
    beforeUrl: placeholder('BEFORE', '3 Facing Sections', 210),
    afterUrl: placeholder('AFTER', '7 Facing Sections', 30),
    beforeLabel: 'Before: 3 Facing Sections',
    afterLabel: 'After: 7 Facing Sections',
    facesGained: 4,
    tags: [
      { label: 'Shelf Installed', type: 'success' },
      { label: 'Improved', type: 'success' },
      { label: 'Price Tag Visible', type: 'success' },
    ],
    date: '2025-05-23',
  },
]

export async function fetchGalleryEvidence(): Promise<EvidenceCardData[]> {
  await new Promise(r => setTimeout(r, 200))
  return MOCK_EVIDENCE
}

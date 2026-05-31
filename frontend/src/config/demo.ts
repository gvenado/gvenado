// Demo configuration — single source of truth for live demo.
// 2026-05-28 is a Thursday. REPONEDOR 1 (id=1) has 31 PDVs scheduled that day.
// Change DEMO_DATE to any Mon–Sat with seeded data when needed.

import type { RutaHoy } from '@/data/mockData'

export const DEMO_DATE = '2026-05-28'
export const DEMO_REPONEDOR_ID = 1

// DEMO_FALLBACK_ROUTE — shown only when backend returns 0 PDVs.
// Uses real PDV ids and coords from the seeded database so navigation works.
export const DEMO_FALLBACK_ROUTE: RutaHoy = {
  mochila: { marcaPrecios: 62, colgantes: 44, cenefas: 31 },
  pdvs: [
    { id: 1,  name: 'CHASQUIPAMPA', category: 'MINORISTA', address: 'GV001', duration: '40 min', latitud: -16.53678674, longitud: -68.04696858 },
    { id: 42, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV042', duration: '25 min', latitud: -16.530631,   longitud: -68.0735448  },
    { id: 43, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV043', duration: '35 min', latitud: -16.53065559, longitud: -68.07345073 },
    { id: 44, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV044', duration: '33 min', latitud: -16.5305981,  longitud: -68.0731682  },
    { id: 45, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV045', duration: '34 min', latitud: -16.53143,    longitud: -68.073275   },
    { id: 46, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV046', duration: '30 min', latitud: -16.53107353, longitud: -68.07253814 },
    { id: 47, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV047', duration: '20 min', latitud: -16.530815,   longitud: -68.0736671  },
    { id: 48, name: 'ACHUMANI',     category: 'MINORISTA', address: 'GV048', duration: '20 min', latitud: -16.53081059, longitud: -68.07353309 },
  ],
  tiempo_estimado: 277,
}

# gvenado API Contract

Base URL: `http://localhost:8000`

---

## PDVs

### `GET /api/pdvs`
List all PDVs. Supports optional query filters.

**Query parameters**
| param | type | description |
|---|---|---|
| `mercado` | string | case-insensitive partial match on mercado name |
| `categoria` | string | exact match (MINORISTA, MAYORISTA, DETALLISTA) |
| `reponedor_id` | int | filter by assigned reponedor |
| `skip` | int | pagination offset (default 0) |
| `limit` | int | page size (default 500) |

**Response** `200 OK` — array of PDV objects
```json
[
  {
    "id": 1,
    "nro": 1,
    "mercado": "CHASQUIPAMPA",
    "categoria": "MINORISTA",
    "codigo": "111886",
    "cliente": "GV001",
    "latitud": -16.53678674,
    "longitud": -68.04696858,
    "supervisor_id": 1,
    "reponedor_id": 1,
    "visita_minutos": 40,
    "lunes": true,
    "martes": false,
    "miercoles": false,
    "jueves": true,
    "viernes": false,
    "sabado": false,
    "semanal": 2,
    "mensual": 8
  }
]
```

---

### `GET /api/pdvs/{id}`
Get a single PDV with supervisor and reponedor details.

**Path param:** `id` — PDV primary key

**Response** `200 OK`
```json
{
  "id": 1,
  "nro": 1,
  "mercado": "CHASQUIPAMPA",
  "categoria": "MINORISTA",
  "codigo": "111886",
  "cliente": "GV001",
  "latitud": -16.53678674,
  "longitud": -68.04696858,
  "supervisor_id": 1,
  "reponedor_id": 1,
  "visita_minutos": 40,
  "lunes": true,
  "martes": false,
  "miercoles": false,
  "jueves": true,
  "viernes": false,
  "sabado": false,
  "semanal": 2,
  "mensual": 8,
  "supervisor": { "id": 1, "nombre": "SUPERVISOR 1" },
  "reponedor": {
    "id": 1,
    "nombre": "REPONEDOR 1",
    "supervisor_id": 1,
    "supervisor": { "id": 1, "nombre": "SUPERVISOR 1" }
  }
}
```

**Errors:** `404` PDV not found

---

## Reponedores

### `GET /api/reponedores`
List all reponedores with their supervisor.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "REPONEDOR 1",
    "supervisor_id": 1,
    "supervisor": { "id": 1, "nombre": "SUPERVISOR 1" }
  }
]
```

---

### `GET /api/reponedores/{id}/ruta-hoy`
Returns the list of PDVs scheduled for a given reponedor on a given date (filtered by day-of-week visit schedule).

**Path param:** `id` — Reponedor primary key

**Query params**
| param | type | description |
|---|---|---|
| `fecha` | date (YYYY-MM-DD) | date to check (defaults to today) |

**Response** `200 OK` — array of PDV objects (same shape as `GET /api/pdvs`)

**Note:** Returns `[]` for Sundays (no visit day).

**Errors:** `404` Reponedor not found

---

## Visitas

### `POST /api/visitas`
Create a new visit record.

**Request body**
```json
{
  "pdv_id": 1,
  "reponedor_id": 1,
  "fecha": "2026-05-30",
  "hora_inicio": "2026-05-30T09:00:00",
  "hora_fin": "2026-05-30T09:40:00",
  "notas": "Revisión estantes"
}
```
`hora_inicio`, `hora_fin`, and `notas` are optional.

**Response** `201 Created`
```json
{
  "id": 6609,
  "pdv_id": 1,
  "reponedor_id": 1,
  "fecha": "2026-05-30",
  "hora_inicio": null,
  "hora_fin": null,
  "foto_url": null,
  "estado": "pendiente",
  "notas": null
}
```

**Errors:** `404` PDV or Reponedor not found

---

### `POST /api/visitas/{id}/foto`
Upload a photo for an existing visit. Sets `estado` to `"completada"`.

**Path param:** `id` — Visita primary key

**Request body** `multipart/form-data`
| field | type |
|---|---|
| `file` | image file (jpg, png, etc.) |

**Response** `200 OK` — updated Visita object with `foto_url` populated
```json
{
  "id": 6609,
  "pdv_id": 1,
  "reponedor_id": 1,
  "fecha": "2026-05-30",
  "hora_inicio": null,
  "hora_fin": null,
  "foto_url": "/assets/fotos/6609_abc123.jpg",
  "estado": "completada",
  "notas": null
}
```

**Errors:** `404` Visita not found

---

### `GET /api/visitas/hoy`
List all visits for a given date with PDV and reponedor details.

**Query params**
| param | type | description |
|---|---|---|
| `fecha` | date (YYYY-MM-DD) | defaults to today |
| `reponedor_id` | int | filter by reponedor |

**Response** `200 OK`
```json
[
  {
    "id": 6609,
    "pdv_id": 1,
    "reponedor_id": 1,
    "fecha": "2026-05-30",
    "hora_inicio": null,
    "hora_fin": null,
    "foto_url": null,
    "estado": "pendiente",
    "notas": null,
    "pdv": { "id": 1, "cliente": "GV001", "mercado": "CHASQUIPAMPA", "..." : "..." },
    "reponedor": { "id": 1, "nombre": "REPONEDOR 1", "..." : "..." }
  }
]
```

---

## Routing Engine

### `POST /api/optimize`
Optimize the daily route for a reponedor using OR-Tools TSP.

**Request body**
```json
{
  "reponedor_id": 1,
  "fecha": "2026-05-26",
  "max_pdvs": 5
}
```
`max_pdvs` is optional; omit to include all scheduled PDVs.

**Response** `200 OK`
```json
{
  "reponedor_id": 1,
  "fecha": "2026-05-26",
  "ruta": [
    {
      "orden": 1,
      "pdv_id": 9,
      "cliente": "GV009",
      "mercado": "ALTO PAMPAHASI",
      "latitud": -16.49544574,
      "longitud": -68.1034628,
      "visita_minutos": 20
    }
  ],
  "distancia_total_km": 1.66,
  "tiempo_estimado_min": 115
}
```

**Errors:** `404` Reponedor not found

---

### `POST /api/simulate-redistribution`
Simulate redistribution of a reponedor's PDVs to the rest of their supervisor's team.

**Request body**
```json
{
  "reponedor_ausente_id": 1,
  "fecha": "2026-05-26"
}
```

**Response** `200 OK`
```json
{
  "reponedor_ausente_id": 1,
  "fecha": "2026-05-26",
  "redistribucion": [
    {
      "pdv_id": 9,
      "cliente": "GV009",
      "mercado": "ALTO PAMPAHASI",
      "reponedor_asignado_id": 2,
      "reponedor_asignado": "REPONEDOR 2"
    }
  ],
  "aviso": "35 PDVs redistribuidos entre 7 reponedores del equipo."
}
```

**Errors:** `404` Reponedor not found

---

## Depositos POP

### `GET /api/depositos`
List all active POP material depots.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "Deposito Central La Paz",
    "latitud": -16.5,
    "longitud": -68.119293,
    "descripcion": "Deposito principal de materiales POP",
    "activo": true
  }
]
```

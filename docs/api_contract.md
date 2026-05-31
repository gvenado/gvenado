# gvenado API Contract

Base URL: `http://localhost:8000`

---

## Health

### `GET /health`
Liveness check. Returns immediately; no database access.

**Response** `200 OK`
```json
{ "status": "ok" }
```

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
List all reponedores with their supervisor and mobility profile.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "nombre": "REPONEDOR 1",
    "supervisor_id": 1,
    "supervisor": { "id": 1, "nombre": "SUPERVISOR 1" },
    "perfil_movilidad": {
      "tipo": "moto",
      "velocidad_kmh": 22.0
    }
  }
]
```

`perfil_movilidad.tipo` is one of `"moto"`, `"a pie"`, `"auto"`. Profiles are loaded from `backend/data/mobility_profiles.json`.

---

### `GET /api/reponedores/{id}/ruta-hoy`
Returns the PDVs scheduled for a given reponedor on a given date, with mochila POP allocation and estimated route time.

**Path param:** `id` — Reponedor primary key

**Query params**
| param | type | description |
|---|---|---|
| `fecha` | date (YYYY-MM-DD) | date to check (defaults to today) |

**Response** `200 OK`
```json
{
  "reponedor_id": 1,
  "pdvs": [ { "...": "same shape as GET /api/pdvs" } ],
  "mochila": {
    "marca_precios": 33,
    "colgantes": 22,
    "cenefas": 11
  },
  "tiempo_estimado": 453
}
```

`tiempo_estimado` (minutes) = sum of `visita_minutos` across all PDVs + 8 min transit per stop.

`mochila` allocation per PDV by category:
| categoria | marca_precios | colgantes | cenefas |
|---|---|---|---|
| MAYORISTA | 6 | 4 | 3 |
| MINORISTA | 3 | 2 | 1 |
| DETALLISTA | 2 | 1 | 1 |

**Note:** Returns empty `pdvs` and zero mochila for Sundays (no visit day).

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
Capacitated VRP: computes optimised routes for **all 24 reponedores** for a
given date in a single call.  Uses a two-phase algorithm — balanced geographic
pre-assignment + per-group OR-Tools TSP.

**Algorithm constraints**
- Maximum route time per reponedor: **435 min (7h 15m)**, including travel
  and service time.
- Travel speed: 30 km/h (haversine distances).
- PDVs filtered by weekday flag (`lunes` … `sabado`). Sunday returns empty routes.
- All reponedores always appear in the response; reponedores with no PDVs
  scheduled on that day will have `cantidad_pdvs: 0`.

**Caching**: results are cached in memory per `(fecha, restricciones)` for the
lifetime of the server process.  The first call runs the full VRP (~25–50 s);
subsequent calls with the same inputs return in under 100 ms.  Check
`from_cache` in the response to distinguish the two.

**Request body**
```json
{
  "fecha": "2026-05-30",
  "restricciones": {}
}
```

| field | type | required | description |
|---|---|---|---|
| `fecha` | date (YYYY-MM-DD) | yes | date to optimise |
| `restricciones` | object | no | reserved for future constraints; pass `{}` |

**Response** `200 OK`
```json
{
  "rutas_por_reponedor": {
    "1": {
      "reponedor_id": 1,
      "reponedor_nombre": "REPONEDOR 1",
      "pdvs": [
        {
          "orden": 1,
          "pdv_id": 418,
          "cliente": "GV418",
          "mercado": "GARCILAZO",
          "latitud": -16.4933694,
          "longitud": -68.1418372,
          "visita_minutos": 20
        },
        {
          "orden": 2,
          "pdv_id": 362,
          "cliente": "GV362",
          "mercado": "GARCILAZO",
          "latitud": -16.493396,
          "longitud": -68.1426655,
          "visita_minutos": 30
        }
      ],
      "total_km": 3.94,
      "total_tiempo_min": 218,
      "cantidad_pdvs": 9
    },
    "2": {
      "reponedor_id": 2,
      "reponedor_nombre": "REPONEDOR 2",
      "pdvs": ["..."],
      "total_km": 8.37,
      "total_tiempo_min": 237,
      "cantidad_pdvs": 5
    },
    "...": "(keys 3–24 follow the same shape)"
  },
  "metricas_globales": {
    "total_km": 204.24,
    "total_tiempo_min": 5430,
    "pdvs_asignados": 200,
    "pdvs_totales_dia": 200,
    "reponedores_usados": 24,
    "max_tiempo_ruta_min": 244,
    "balance_carga": {
      "tiempo_promedio_min": 226.3,
      "desviacion_std_min": 9.6,
      "coeficiente_variacion": 0.042,
      "reponedor_mas_cargado_id": 7,
      "reponedor_menos_cargado_id": 24
    }
  },
  "pdvs_sin_asignar": [],
  "infactible": false,
  "from_cache": false,
  "notas": []
}
```

**Response fields**

`rutas_por_reponedor` — object keyed by reponedor `id` (string)

| field | type | description |
|---|---|---|
| `reponedor_id` | int | reponedor primary key |
| `reponedor_nombre` | string | display name |
| `pdvs` | array | ordered visit list (see PDV stop shape below) |
| `total_km` | float | total route distance (depot → stops → depot) |
| `total_tiempo_min` | int | total route time = travel + service (minutes) |
| `cantidad_pdvs` | int | number of PDVs in this route |

PDV stop shape inside `pdvs`:

| field | type | description |
|---|---|---|
| `orden` | int | visit sequence (1-based) |
| `pdv_id` | int | PDV primary key |
| `cliente` | string | unique client code (GV001–GV474) |
| `mercado` | string | market name |
| `latitud` | float | WGS-84 latitude |
| `longitud` | float | WGS-84 longitude |
| `visita_minutos` | int | planned service time at this stop |

`metricas_globales`:

| field | type | description |
|---|---|---|
| `total_km` | float | sum of all route distances |
| `total_tiempo_min` | int | sum of all route times |
| `pdvs_asignados` | int | PDVs with a route (equals `pdvs_totales_dia` when feasible) |
| `pdvs_totales_dia` | int | PDVs scheduled for the requested weekday |
| `reponedores_usados` | int | reponedores with at least one PDV |
| `max_tiempo_ruta_min` | int | longest single route (must be ≤ 435 when `infactible: false`) |
| `balance_carga` | object | workload distribution metrics |

`balance_carga` sub-fields:

| field | type | description |
|---|---|---|
| `tiempo_promedio_min` | float | mean route time across all 24 reponedores |
| `desviacion_std_min` | float | standard deviation of route times |
| `coeficiente_variacion` | float | CV = std/mean (lower = more balanced) |
| `reponedor_mas_cargado_id` | int | reponedor ID with the longest route |
| `reponedor_menos_cargado_id` | int | reponedor ID with the shortest route |

Top-level fields:

| field | type | description |
|---|---|---|
| `pdvs_sin_asignar` | int[] | PDV IDs that could not be routed (empty when feasible) |
| `infactible` | bool | `true` if any route exceeds 435 min |
| `from_cache` | bool | `true` if this response was served from the in-memory cache |
| `notas` | string[] | warnings or informational messages |

**Errors:** `500` if no reponedores exist in the database

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
List all active POP material depots with stock, daily consumption, days remaining, and stockout risk.

**Response** `200 OK`
```json
[
  {
    "id": 1,
    "mercado": "La Paz",
    "stock": {
      "marca_precios": 500,
      "colgantes": 175,
      "cenefas": 125
    },
    "consumo_promedio_diario": {
      "marca_precios": 100,
      "colgantes": 35,
      "cenefas": 25
    },
    "dias_restantes": 5,
    "riesgo_quiebre": "medio"
  }
]
```

`dias_restantes` = min(stock / consumo) across all three POP materials.

`riesgo_quiebre` heuristic:
| dias_restantes | riesgo_quiebre |
|---|---|
| < 3 | `"alto"` |
| 3 – 6 | `"medio"` |
| ≥ 7 | `"bajo"` |

Stock and consumption figures are mock values from `backend/routers/depositos.py` (`_STOCK_DATA`).

---

## Vision

### `POST /api/vision/analyze`
Upload a shelf photo for AI analysis. Simulates a ~1.5 s vision model call and
returns a structured analysis response. Photo metadata is persisted to
`FotoAnalisis` in SQLite.

**Request body** `multipart/form-data`
| field | type | required | description |
|---|---|---|---|
| `file` | image file | yes | shelf photo (jpg, png, etc.) |
| `visita_id` | int | no | links the analysis to an existing Visita |

**Response** `200 OK`
```json
{
  "foto_url": "/assets/demo_photos/pdv_antes_01.jpg",
  "hash_sha256": "a3f1c2...",
  "timestamp": "2026-05-30T14:22:10.123456Z",
  "analysis": {
    "faces_ganadas": 3,
    "productos_detectados": ["Coca-Cola 500ml", "Sprite 350ml"],
    "observaciones": "Estante bien surtido. 3 caras adicionales detectadas.",
    "score": 87
  }
}
```

Response shape of `analysis` depends on `assets/demo_responses/responses.json` —
keyed by filename stem, falling back to `"default"` entry.

**Errors:** `404` if `visita_id` is provided but not found

---

## Demo Orchestration

Stateful demo controller for scripted live demos. State is in-process memory
only — not persisted to SQLite and not visible to the real dashboard or reponedor
UI. All endpoints return `{"status": "ok", ...}`.

### `GET /api/demo/state`
Return the current demo step counter.

**Response** `200 OK`
```json
{
  "step": 3,
  "active": true,
  "last_updated": "2026-05-30T14:22:10.123456"
}
```

| field | type | description |
|---|---|---|
| `step` | int | current step (0 = idle, 1–7 = in-sequence) |
| `active` | bool | `true` after `/reset`, never reset by other steps |
| `last_updated` | string | ISO-8601 UTC timestamp of last state change |

---

### `POST /api/demo/reset`
Reset demo to step 0, set `active: true`.

**Response** `200 OK`
```json
{ "status": "ok", "message": "Demo reseteado al estado inicial" }
```

---

### `POST /api/demo/geofence/{pdv_id}`
Simulate reponedor arriving at a PDV geofence. Advances to step 1.

**Path param:** `pdv_id` — must exist in the database

**Response** `200 OK`
```json
{ "status": "ok", "pdv_id": 1, "message": "Reponedor llegó al PDV 1" }
```

**Errors:** `404` PDV not found

---

### `POST /api/demo/foto-antes`
Register the before-shelf photo. Advances to step 2.

**Response** `200 OK`
```json
{ "status": "ok", "foto": "pdv_antes_01.jpg", "message": "Foto ANTES registrada" }
```

---

### `POST /api/demo/checklist`
Mark checklist as completed. Advances to step 3.

**Response** `200 OK`
```json
{ "status": "ok", "tareas_completadas": 5, "message": "Checklist completado" }
```

---

### `POST /api/demo/foto-despues`
Register the after-shelf photo with face gain. Advances to step 4.

**Response** `200 OK`
```json
{ "status": "ok", "foto": "pdv_despues_01.jpg", "faces_ganadas": 3, "message": "+3 caras ganadas" }
```

---

### `POST /api/demo/cerrar-visita`
Close the demo visit. Advances to step 5.

**Response** `200 OK`
```json
{ "status": "ok", "message": "Visita cerrada. Dashboard actualizado." }
```

---

### `POST /api/demo/redistribucion`
Simulate workload redistribution. Advances to step 6.

**Response** `200 OK`
```json
{
  "status": "ok",
  "impacto": { "km_ahorrados": 47, "tiempo_ahorrado": 35, "balance_carga": "equilibrado" },
  "message": "Redistribución simulada"
}
```

---

### `POST /api/demo/impacto`
Return aggregated impact metrics. Advances to step 7.

**Response** `200 OK`
```json
{
  "status": "ok",
  "metricas": {
    "reduccion_km": "23%",
    "faces_ganadas": 847,
    "pdvs_visitados": 474,
    "tiempo_promedio_visita": "12 min"
  }
}
```

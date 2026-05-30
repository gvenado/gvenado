# gvenado

Route optimization and field visit tracking for La Paz PDVs.

**Stack:** Vite + React 19 + TypeScript + Tailwind CSS / FastAPI + SQLAlchemy + OR-Tools + SQLite

---

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+

---

### Backend

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate        # Linux/Mac
# venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt
```

> **Windows:** Si `pip install -r requirements.txt` falla con `uvloop does not support Windows`, usá este comando en su lugar:
> ```
> pip install fastapi uvicorn sqlalchemy pandas openpyxl ortools geopy pydantic python-multipart pillow python-dotenv
> ```

```bash
# Seed real PDV data (474 PDVs from Excel)
python3 scripts/seed.py

# Optional: reset and reload from scratch
python3 scripts/seed.py --reset

# Generate 4 weeks of mock historical visits
python3 scripts/mock_visits.py

# Start the API server (port 8000)
uvicorn main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

---

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
```

---

## Data Notes

- PDV source: `docs/INFORMACION DE DATOS TRADICIONAL LA PAZ rev..xlsx`, sheet `CLIENT. TRADE LP`
- `CODIGO` column is **not** unique in the source data (31 duplicate pairs + non-numeric values like "AUTO VENTA"). The true unique key is `CLIENTE` (GV001–GV474).
- The `seed.py` script is idempotent: safe to run multiple times, uses `cliente` as the deduplication key.

---

## API Contract

See [`docs/api_contract.md`](docs/api_contract.md) for full endpoint documentation.

---

## Dev C · Vision Service + Demo Controller + Incidencias

**Branch:** `feature/vision-demo`

### Módulos

- `backend/routers/vision.py` — Endpoint de análisis de fotos con mock IA y hash SHA-256
- `backend/routers/demo.py` — 8 endpoints para controlar la coreografía del pitch
- `backend/routers/incidencias.py` — Reporte de bloqueos con alertas a reponedores cercanos
- `frontend/src/demo/DemoControllerPage.tsx` — Panel de control visual del demo
- `assets/demo_responses/responses.json` — Respuestas mock de la IA para los 5 escenarios

### Endpoints Vision Service

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/vision/analyze` | Recibe foto, devuelve análisis mock IA + hash SHA-256 |

### Endpoints Demo Controller

| Método | Endpoint | Momento del pitch |
|--------|----------|-------------------|
| POST | `/api/demo/reset` | Minuto 0:00 — Iniciar demo |
| POST | `/api/demo/geofence/{pdv_id}` | Minuto 2:00 — Reponedor llega al PDV |
| POST | `/api/demo/foto-antes` | Minuto 2:20 — Foto antes |
| POST | `/api/demo/checklist` | Minuto 2:45 — Checklist completo |
| POST | `/api/demo/foto-despues` | Minuto 2:55 — Foto después + IA |
| POST | `/api/demo/cerrar-visita` | Minuto 3:15 — Cerrar visita |
| POST | `/api/demo/redistribucion` | Minuto 3:35 — Simular redistribución |
| POST | `/api/demo/impacto` | Minuto 3:55 — Mostrar métricas finales |
| GET | `/api/demo/state` | Estado actual del demo |

### Endpoints Incidencias

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/incidencias/reportar` | Reportar bloqueo con foto + alerta a reponedores cercanos |
| GET | `/api/incidencias/activas` | Ver todos los bloqueos activos |
| POST | `/api/incidencias/{id}/resolver` | Marcar bloqueo como resuelto |
| DELETE | `/api/incidencias/limpiar` | Limpiar todas las incidencias |

### Panel de control del demo

Acceder en: `http://localhost:5173/demo-control`

### Probar incidencias

```bash
# Reportar bloqueo en Av. 6 de Agosto, La Paz
curl -X POST "http://localhost:8000/api/incidencias/reportar?lat=-16.5050&lng=-68.1450&tipo=bloqueo&descripcion=Bloqueo+en+Av+6+de+Agosto"

# Ver bloqueos activos
curl http://localhost:8000/api/incidencias/activas
```

### Fotos necesarias para el demo

Guardar en `assets/demo_photos/`:

| Archivo | Descripción |
|---------|-------------|
| `pdv_antes_01.jpg` | Estante desordenado, poco producto visible |
| `pdv_despues_01.jpg` | El mismo estante ordenado con POP instalado |
| `pdv_mayorista_antes.jpg` | Góndola grande sin POP |
| `pdv_mayorista_despues.jpg` | La misma góndola post-reponedor |
| `pdv_cerrado.jpg` | Puerta de local cerrado |
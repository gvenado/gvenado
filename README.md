# gvenado — ASTA Field Operations Platform

ASTA (Automated Supply & Territory Assistant) is a full-stack field operations platform for managing replenishment routes, POP supply visibility, and real-time supervisor dashboards across a network of 474 points of sale (PDVs) in La Paz, Bolivia.

The system lets supervisors optimize daily routes via a VRP engine, track replenishers in real time on a live map, analyze shelf photos with AI vision, and manage POP deposit stock — while replenishers use a companion mobile web app to navigate their route, complete checklists, and upload photos.

---

## Main Modules

| Module | Description |
|---|---|
| **Backend API** | FastAPI + SQLite, serves all data and business logic |
| **Supervisor Dashboard** | React SPA — overview, live map, replenisher tracking, AI gallery, POP warehouses, VRP simulator |
| **Replenisher / Mobile App** | Mobile-first React app — route view, PDV checklist, photo upload, day close |
| **Demo Controller** | Orchestration page to choreograph live demos step by step |
| **Vision / Photo Analysis** | `/api/vision/analyze` — accepts shelf photos, returns AI-powered stock analysis |
| **Routing / VRP Engine** | `/api/optimize` — two-phase balanced geographic pre-assignment + OR-Tools TSP |

---

## Requirements

| Tool | Version |
|---|---|
| Python | 3.10+ |
| Node.js | 18+ (tested on v22) |
| npm | 8+ (tested on v11) |
| Git | any recent version |

> **OS note:** Commands below use Unix/macOS syntax. See the Windows note in the Backend Setup section for the venv activation difference.

---

## Repository Structure

```
gvenado/
├── backend/                  # FastAPI application
│   ├── main.py               # App entry point, router registration, CORS, static files
│   ├── database.py           # SQLAlchemy engine + session factory
│   ├── models.py             # ORM models (PDV, Reponedor, Visita, etc.)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── requirements.txt      # Python dependencies
│   ├── routers/              # One file per feature domain
│   │   ├── pdvs.py
│   │   ├── reponedores.py
│   │   ├── visitas.py
│   │   ├── optimize.py       # VRP / route optimization engine
│   │   ├── vision.py         # Photo analysis endpoint
│   │   ├── depositos.py      # POP deposit stock
│   │   └── demo.py           # In-memory demo state machine
│   ├── scripts/
│   │   ├── seed.py           # Loads 474 PDVs from Excel into SQLite
│   │   ├── mock_visits.py    # Generates 4 weeks of mock historical visits
│   │   └── validate_vrp.py   # Sanity checks for VRP output
│   └── data/                 # Any supplementary data files
├── frontend/                 # Vite + React + TypeScript SPA
│   ├── src/
│   │   ├── dashboard/        # Supervisor dashboard (pages, components, routes)
│   │   ├── pages/            # Replenisher / mobile app pages
│   │   ├── demo/             # Demo controller page
│   │   ├── context/          # React contexts (ReponedorContext, etc.)
│   │   ├── api/              # API client functions
│   │   ├── components/       # Shared UI components
│   │   └── routes/           # Route definitions
│   └── .env.example          # Template for local environment variables
├── docs/
│   ├── api_contract.md       # Full API endpoint documentation
│   └── INFORMACION DE DATOS TRADICIONAL LA PAZ rev..xlsx  # Source PDV data
└── assets/
    ├── demo_photos/          # Demo shelf photos used by vision service
    ├── demo_responses/       # Canned AI responses keyed by photo filename
    └── fotos/                # Runtime-generated uploaded photos (gitignored)
```

---

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate          # macOS / Linux
# venv\Scripts\activate           # Windows

# Install dependencies
pip install -r requirements.txt

# Load 474 PDVs from Excel + seed supervisors and reponedores
python3 scripts/seed.py --reset

# Generate 4 weeks of mock historical visits
python3 scripts/mock_visits.py

# Start the API server
uvicorn main:app --reload --port 8000
```

The `--reset` flag clears and reloads all PDV, reponedor, supervisor, and depot data. Safe to run again at any time to get back to a clean state.

### Backend Verification

With the server running, test these endpoints:

```bash
# Health check
curl http://localhost:8000/health

# List all PDVs (474 records)
curl http://localhost:8000/api/pdvs

# List all replenishers
curl http://localhost:8000/api/reponedores

# Today's route for replenisher 1
curl "http://localhost:8000/api/reponedores/1/ruta-hoy?fecha=2026-05-26"

# Visits for a specific date
curl "http://localhost:8000/api/visitas/hoy?fecha=2026-05-26"

# POP deposit stock
curl http://localhost:8000/api/depositos

# Run route optimization (first call computes; second call returns cached result)
curl -X POST http://localhost:8000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2026-05-26","restricciones":{}}'
```

Interactive API docs are available at: `http://localhost:8000/docs`

---

## Frontend Setup

```bash
cd frontend

# Copy the environment template
cp .env.example .env

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The `.env.example` already contains the correct default:

```env
VITE_API_URL=http://localhost:8000
```

---

## Frontend Routes

### Supervisor Dashboard
| URL | View |
|---|---|
| `http://localhost:5173/` | Overview |
| `http://localhost:5173/mapa-vivo` | Live Map |
| `http://localhost:5173/reponedores` | Replenisher tracking |
| `http://localhost:5173/galeria` | AI photo gallery |
| `http://localhost:5173/depositos` | POP warehouse stock |
| `http://localhost:5173/simulador` | Route optimizer / VRP simulator |

### Replenisher / Mobile App
| URL | View |
|---|---|
| `http://localhost:5173/login` | Replenisher login |
| `http://localhost:5173/app/ruta-hoy` | Today's route |
| `http://localhost:5173/app/pdv/:id` | Current PDV detail |
| `http://localhost:5173/app/pdv/:id/checklist` | PDV checklist + photo upload |
| `http://localhost:5173/app/cierre-dia` | Close day |
| `http://localhost:5173/app/historial` | Visit history |
| `http://localhost:5173/app/perfil` | Replenisher profile |

### Demo & Docs
| URL | Description |
|---|---|
| `http://localhost:5173/demo-control` | Demo controller / step orchestrator |
| `http://localhost:8000/docs` | Interactive Swagger API docs |

---

## Running Both Services

Two terminals are required:

**Terminal 1 — Backend**
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 — Frontend**
```bash
cd frontend
npm run dev
```

---

## Data Setup

- The source PDV data lives in `docs/INFORMACION DE DATOS TRADICIONAL LA PAZ rev..xlsx` (committed, do not delete).
- `python3 scripts/seed.py --reset` reads the Excel file and loads **474 PDVs**, 24 replenishers, 3 supervisors, and POP depots into `backend/gvenado.db`.
- `python3 scripts/mock_visits.py` inserts **4 weeks of mock visits** (idempotent — skips dates that already have data).
- `gvenado.db` is a local SQLite file and is **gitignored**. Regenerate it at any time with the two seed commands above.

---

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Liveness check |
| GET | `/api/pdvs` | List all 474 PDVs |
| GET | `/api/pdvs/{id}` | PDV detail |
| GET | `/api/reponedores` | List all replenishers |
| GET | `/api/reponedores/{id}/ruta-hoy` | Daily route for one replenisher |
| POST | `/api/visitas` | Create a visit record |
| POST | `/api/visitas/{id}/foto` | Attach a photo to a visit |
| GET | `/api/visitas/hoy` | All visits for a given date |
| POST | `/api/optimize` | Run VRP route optimization |
| POST | `/api/simulate-redistribution` | Simulate load redistribution |
| GET | `/api/depositos` | POP depot stock |
| POST | `/api/vision/analyze` | Analyze a shelf photo |
| POST | `/api/demo/reset` | Reset demo state |
| POST | `/api/demo/geofence/{pdv_id}` | Simulate replenisher arrival at PDV |
| POST | `/api/demo/foto-antes` | Demo: pre-visit photo step |
| POST | `/api/demo/checklist` | Demo: checklist step |
| POST | `/api/demo/foto-despues` | Demo: post-visit photo step |
| POST | `/api/demo/cerrar-visita` | Demo: close visit step |
| POST | `/api/demo/redistribucion` | Demo: redistribution step |
| POST | `/api/demo/impacto` | Demo: impact step |
| GET | `/api/demo/state` | Get current demo state |

Full request/response schemas are documented in [`docs/api_contract.md`](docs/api_contract.md).

---

## Demo Flow Checklist

1. **Start backend** — `uvicorn main:app --reload --port 8000`
2. **Start frontend** — `npm run dev`
3. **Open supervisor dashboard** — `http://localhost:5173/simulador`
4. **Run route optimization** — click Optimize or POST `/api/optimize`; the second call returns a cached result instantly
5. **Open replenisher app** — `http://localhost:5173/login`, log in as any replenisher
6. **Navigate route** — go to Ruta Hoy, tap a PDV, complete the checklist
7. **Upload a shelf photo** — the vision service returns a canned analysis response
8. **Close the day** — go to Cierre Día and submit
9. **Open demo controller** — `http://localhost:5173/demo-control` to step through the orchestrated demo sequence
10. **Check AI gallery** — `http://localhost:5173/galeria` to verify analyzed photos appear
11. **Check POP stock** — `http://localhost:5173/depositos`

---

## Common Issues

**Port 8000 already in use**
```bash
lsof -ti:8000 | xargs kill -9
```

**Frontend cannot reach backend (CORS / network error)**
- Confirm `.env` has `VITE_API_URL=http://localhost:8000` (no trailing slash).
- Confirm the backend is running and `http://localhost:8000/health` responds.

**`ModuleNotFoundError` or `uvicorn: command not found`**
- You forgot to activate the virtual environment: `source venv/bin/activate`

**`.env` file missing**
```bash
cp frontend/.env.example frontend/.env
```

**Data looks empty or stale**
```bash
cd backend
source venv/bin/activate
python3 scripts/seed.py --reset
python3 scripts/mock_visits.py
```

**First `/api/optimize` call is slow**
- The VRP solver computes 24 routes on first call (~5–15 seconds depending on hardware). The result is cached in memory; subsequent calls with the same parameters return instantly.

---

## Git Workflow

- **Stable branch:** `dev` — all integrated features land here
- **Feature branches:** branch from `dev`, merge back to `dev` via PR
- **Do not commit:**
  - `backend/venv/`
  - `frontend/node_modules/`
  - `.env` (any environment)
  - `*.db` / `*.sqlite`
  - `assets/fotos/` (runtime-generated photos)
  - `assets/demo_photos/` (gitignored)
- **Commit style:** use [Conventional Commits](https://www.conventionalcommits.org/) — `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`

---

## Documentation

- [`docs/api_contract.md`](docs/api_contract.md) — full endpoint reference with request/response schemas

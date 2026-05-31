from fastapi import APIRouter, File, UploadFile
from pathlib import Path
from datetime import datetime
from geopy.distance import geodesic
import json, hashlib, shutil, asyncio

router = APIRouter(prefix="/api/incidencias", tags=["incidencias"])

PHOTOS_PATH = Path(__file__).parent.parent.parent / "assets" / "incidencias"
RESPONSES_PATH = Path(__file__).parent.parent.parent / "assets" / "demo_responses" / "responses.json"

# Estado en memoria (mock para el demo)
INCIDENCIAS_ACTIVAS = []

# Reponedores mock con coordenadas (La Paz)
REPONEDORES_MOCK = [
    {"id": 1, "nombre": "Carlos Mamani",   "lat": -16.5000, "lng": -68.1500},
    {"id": 2, "nombre": "Pedro Quispe",    "lat": -16.5100, "lng": -68.1400},
    {"id": 3, "nombre": "Juan Flores",     "lat": -16.4900, "lng": -68.1600},
    {"id": 4, "nombre": "Luis Condori",    "lat": -16.5200, "lng": -68.1300},
    {"id": 5, "nombre": "Mario Huanca",    "lat": -16.4800, "lng": -68.1700},
]

def get_reponedores_cercanos(lat: float, lng: float, radio_km: float = 2.0):
    cercanos = []
    for rep in REPONEDORES_MOCK:
        distancia = geodesic((lat, lng), (rep["lat"], rep["lng"])).km
        if distancia <= radio_km:
            cercanos.append({**rep, "distancia_km": round(distancia, 2)})
    return cercanos

@router.post("/reportar")
async def reportar_bloqueo(
    lat: float,
    lng: float,
    tipo: str = "bloqueo",
    descripcion: str = "",
    file: UploadFile = File(None)
):
    PHOTOS_PATH.mkdir(parents=True, exist_ok=True)

    foto_url = None
    sha256 = None

    if file:
        save_path = PHOTOS_PATH / file.filename
        with open(save_path, "wb") as f:
            shutil.copyfileobj(file.file, f)
        content = save_path.read_bytes()
        sha256 = hashlib.sha256(content).hexdigest()
        foto_url = f"/assets/incidencias/{file.filename}"

    # Simular delay de procesamiento
    await asyncio.sleep(0.8)

    reponedores_alertados = get_reponedores_cercanos(lat, lng)

    incidencia = {
        "id": len(INCIDENCIAS_ACTIVAS) + 1,
        "tipo": tipo,
        "descripcion": descripcion or f"{tipo.capitalize()} detectado en la zona",
        "lat": lat,
        "lng": lng,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "foto_url": foto_url,
        "hash_sha256": sha256,
        "estado": "activa",
        "reponedores_alertados": reponedores_alertados,
        "ruta_alternativa": {
            "mensaje": "Ruta recalculada evitando el punto de bloqueo",
            "tiempo_adicional_min": 8,
            "km_adicionales": 1.2
        }
    }

    INCIDENCIAS_ACTIVAS.append(incidencia)

    return incidencia

@router.get("/activas")
def get_incidencias_activas():
    return INCIDENCIAS_ACTIVAS

@router.post("/{incidencia_id}/resolver")
def resolver_incidencia(incidencia_id: int):
    for inc in INCIDENCIAS_ACTIVAS:
        if inc["id"] == incidencia_id:
            inc["estado"] = "resuelta"
            inc["resuelto_at"] = datetime.utcnow().isoformat() + "Z"
            return {"status": "ok", "message": f"Incidencia {incidencia_id} marcada como resuelta"}
    return {"status": "error", "message": "Incidencia no encontrada"}

@router.delete("/limpiar")
def limpiar_incidencias():
    INCIDENCIAS_ACTIVAS.clear()
    return {"status": "ok", "message": "Todas las incidencias eliminadas"}
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import PDV

router = APIRouter(prefix="/api/demo", tags=["demo"])

# NOTE: DEMO_STATE is in-memory only. It is not connected to the real Visita/PDV
# data in SQLite and is not consumed by the dashboard or reponedor UI. It is
# intentionally simple for demo choreography. Connect to real DB state when
# the live dashboard polling feature is implemented.
DEMO_STATE = {"step": 0, "active": False, "last_updated": None}


@router.post("/reset")
async def reset_demo():
    DEMO_STATE.update({"step": 0, "active": True, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "message": "Demo reseteado al estado inicial"}


@router.post("/geofence/{pdv_id}")
async def simulate_geofence(pdv_id: int, db: Session = Depends(get_db)):
    if not db.query(PDV).filter(PDV.id == pdv_id).first():
        raise HTTPException(status_code=404, detail=f"PDV {pdv_id} not found")
    DEMO_STATE.update({"step": 1, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "pdv_id": pdv_id, "message": f"Reponedor llegó al PDV {pdv_id}"}


@router.post("/foto-antes")
async def demo_foto_antes():
    DEMO_STATE.update({"step": 2, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "foto": "pdv_antes_01.jpg", "message": "Foto ANTES registrada"}


@router.post("/checklist")
async def demo_checklist():
    DEMO_STATE.update({"step": 3, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "tareas_completadas": 5, "message": "Checklist completado"}


@router.post("/foto-despues")
async def demo_foto_despues():
    DEMO_STATE.update({"step": 4, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "foto": "pdv_despues_01.jpg", "faces_ganadas": 3, "message": "+3 caras ganadas"}


@router.post("/cerrar-visita")
async def demo_cerrar_visita():
    DEMO_STATE.update({"step": 5, "last_updated": datetime.utcnow().isoformat()})
    return {"status": "ok", "message": "Visita cerrada. Dashboard actualizado."}


@router.post("/redistribucion")
async def demo_redistribucion():
    DEMO_STATE.update({"step": 6, "last_updated": datetime.utcnow().isoformat()})
    return {
        "status": "ok",
        "impacto": {"km_ahorrados": 47, "tiempo_ahorrado": 35, "balance_carga": "equilibrado"},
        "message": "Redistribución simulada",
    }


@router.post("/impacto")
async def demo_impacto():
    DEMO_STATE.update({"step": 7, "last_updated": datetime.utcnow().isoformat()})
    return {
        "status": "ok",
        "metricas": {
            "reduccion_km": "23%",
            "faces_ganadas": 847,
            "pdvs_visitados": 474,
            "tiempo_promedio_visita": "12 min",
        },
    }


@router.get("/state")
async def get_demo_state():
    return DEMO_STATE

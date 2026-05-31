import json
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PDV, Reponedor
from schemas import MochilaOut, PDVOut, ReponedorWithPerfilOut, RutaHoyOut

router = APIRouter(prefix="/api/reponedores", tags=["Reponedores"])

_PROFILES_PATH = Path(__file__).parent.parent / "data" / "mobility_profiles.json"
_profiles: dict | None = None


def _load_profiles() -> dict:
    global _profiles
    if _profiles is None:
        _profiles = json.loads(_PROFILES_PATH.read_text())
    return _profiles


def _get_perfil(reponedor_id: int) -> dict:
    profiles = _load_profiles()
    return profiles.get(str(reponedor_id), profiles["default"])


# --- POP allocation per PDV category ---
_POP_BY_CATEGORY: dict[str, dict] = {
    "MAYORISTA":  {"marca_precios": 6, "colgantes": 4, "cenefas": 3},
    "MINORISTA":  {"marca_precios": 3, "colgantes": 2, "cenefas": 1},
    "DETALLISTA": {"marca_precios": 2, "colgantes": 1, "cenefas": 1},
}
_POP_DEFAULT = {"marca_precios": 2, "colgantes": 1, "cenefas": 0}


def _calcular_mochila(pdvs: list) -> MochilaOut:
    total = {"marca_precios": 0, "colgantes": 0, "cenefas": 0}
    for pdv in pdvs:
        alloc = _POP_BY_CATEGORY.get(pdv.categoria.upper(), _POP_DEFAULT)
        total["marca_precios"] += alloc["marca_precios"]
        total["colgantes"] += alloc["colgantes"]
        total["cenefas"] += alloc["cenefas"]
    return MochilaOut(**total)


def _calcular_tiempo(pdvs: list) -> int:
    service = sum(p.visita_minutos for p in pdvs)
    transit = len(pdvs) * 8  # ~8 min avg transit between stops
    return service + transit


@router.get("", response_model=list[ReponedorWithPerfilOut])
def list_reponedores(db: Session = Depends(get_db)):
    reponedores = db.query(Reponedor).all()
    result = []
    for rep in reponedores:
        result.append({
            "id": rep.id,
            "nombre": rep.nombre,
            "supervisor_id": rep.supervisor_id,
            "supervisor": {"id": rep.supervisor.id, "nombre": rep.supervisor.nombre},
            "perfil_movilidad": _get_perfil(rep.id),
        })
    return result


@router.get("/{reponedor_id}/ruta-hoy", response_model=RutaHoyOut)
def ruta_hoy(reponedor_id: int, fecha: date | None = None, db: Session = Depends(get_db)):
    rep = db.query(Reponedor).filter(Reponedor.id == reponedor_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Reponedor not found")

    target_date = fecha or date.today()
    weekday = target_date.weekday()  # 0=Mon … 5=Sat
    day_map = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado"}
    day_attr = day_map.get(weekday)

    pdvs = []
    if day_attr is not None:
        pdvs = (
            db.query(PDV)
            .filter(PDV.reponedor_id == reponedor_id)
            .filter(getattr(PDV, day_attr) == True)
            .all()
        )

    return {
        "reponedor_id": reponedor_id,
        "pdvs": [PDVOut.model_validate(p) for p in pdvs],
        "mochila": _calcular_mochila(pdvs),
        "tiempo_estimado": _calcular_tiempo(pdvs),
    }

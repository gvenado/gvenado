from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import DepositoPOP
from schemas import DepositoPOPStockOut

router = APIRouter(prefix="/api/depositos", tags=["Depositos POP"])

# Static mock stock data keyed by deposito id.
# consumo_promedio_diario is derived from field visit patterns (mock).
_STOCK_DATA: dict[int, dict] = {
    1: {
        "mercado": "La Paz",
        "stock": {"marca_precios": 500, "colgantes": 175, "cenefas": 125},
        "consumo_promedio_diario": {"marca_precios": 100, "colgantes": 35, "cenefas": 25},
    },
}

_DEFAULT_STOCK = {
    "mercado": "Sin datos",
    "stock": {"marca_precios": 0, "colgantes": 0, "cenefas": 0},
    "consumo_promedio_diario": {"marca_precios": 1, "colgantes": 1, "cenefas": 1},
}


def _dias_restantes(stock: dict, consumo: dict) -> int:
    items = ["marca_precios", "colgantes", "cenefas"]
    return min(
        stock[k] // consumo[k] if consumo[k] > 0 else 9999
        for k in items
    )


def _riesgo_quiebre(dias: int) -> str:
    if dias < 3:
        return "alto"
    if dias < 7:
        return "medio"
    return "bajo"


@router.get("", response_model=list[DepositoPOPStockOut])
def list_depositos(db: Session = Depends(get_db)):
    depositos = db.query(DepositoPOP).filter(DepositoPOP.activo == True).all()
    result = []
    for dep in depositos:
        data = _STOCK_DATA.get(dep.id, _DEFAULT_STOCK)
        dias = _dias_restantes(data["stock"], data["consumo_promedio_diario"])
        result.append({
            "id": dep.id,
            "mercado": data["mercado"],
            "stock": data["stock"],
            "consumo_promedio_diario": data["consumo_promedio_diario"],
            "dias_restantes": dias,
            "riesgo_quiebre": _riesgo_quiebre(dias),
        })
    return result

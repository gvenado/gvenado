from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PDV, Reponedor, Visita
from schemas import PDVOut, ReponedorOut, VisitaOut

router = APIRouter(prefix="/api/reponedores", tags=["Reponedores"])


@router.get("", response_model=list[ReponedorOut])
def list_reponedores(db: Session = Depends(get_db)):
    return db.query(Reponedor).all()


@router.get("/{reponedor_id}/ruta-hoy", response_model=list[PDVOut])
def ruta_hoy(reponedor_id: int, fecha: date | None = None, db: Session = Depends(get_db)):
    rep = db.query(Reponedor).filter(Reponedor.id == reponedor_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Reponedor not found")

    target_date = fecha or date.today()
    weekday = target_date.weekday()  # 0=Mon … 5=Sat

    day_map = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado"}
    day_attr = day_map.get(weekday)

    if day_attr is None:
        return []

    q = db.query(PDV).filter(PDV.reponedor_id == reponedor_id)
    q = q.filter(getattr(PDV, day_attr) == True)
    return q.all()

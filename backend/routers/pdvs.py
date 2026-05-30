from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import PDV
from schemas import PDVDetail, PDVOut

router = APIRouter(prefix="/api/pdvs", tags=["PDVs"])


@router.get("", response_model=list[PDVOut])
def list_pdvs(
    mercado: str | None = None,
    categoria: str | None = None,
    reponedor_id: int | None = None,
    skip: int = 0,
    limit: int = 500,
    db: Session = Depends(get_db),
):
    q = db.query(PDV)
    if mercado:
        q = q.filter(PDV.mercado.ilike(f"%{mercado}%"))
    if categoria:
        q = q.filter(PDV.categoria == categoria)
    if reponedor_id:
        q = q.filter(PDV.reponedor_id == reponedor_id)
    return q.offset(skip).limit(limit).all()


@router.get("/{pdv_id}", response_model=PDVDetail)
def get_pdv(pdv_id: int, db: Session = Depends(get_db)):
    pdv = db.query(PDV).filter(PDV.id == pdv_id).first()
    if not pdv:
        raise HTTPException(status_code=404, detail="PDV not found")
    return pdv

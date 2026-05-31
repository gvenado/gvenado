import os
import uuid
from datetime import date
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from database import get_db
from models import PDV, Reponedor, Visita
from schemas import VisitaCreate, VisitaDetail, VisitaOut

router = APIRouter(prefix="/api/visitas", tags=["Visitas"])

UPLOAD_DIR = Path(__file__).parent.parent.parent / "assets" / "fotos"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@router.post("", response_model=VisitaOut, status_code=201)
def create_visita(payload: VisitaCreate, db: Session = Depends(get_db)):
    if not db.query(PDV).filter(PDV.id == payload.pdv_id).first():
        raise HTTPException(status_code=404, detail="PDV not found")
    if not db.query(Reponedor).filter(Reponedor.id == payload.reponedor_id).first():
        raise HTTPException(status_code=404, detail="Reponedor not found")

    visita = Visita(**payload.model_dump())
    db.add(visita)
    db.commit()
    db.refresh(visita)
    return visita


@router.post("/{visita_id}/foto-antes", response_model=VisitaOut)
async def upload_foto_antes(visita_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita not found")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{visita_id}_antes_{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    content = await file.read()
    dest.write_bytes(content)

    visita.foto_antes_url = f"/assets/fotos/{filename}"
    visita.estado = "en_progreso"
    db.commit()
    db.refresh(visita)
    return visita


@router.post("/{visita_id}/foto-despues", response_model=VisitaOut)
async def upload_foto_despues(visita_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita not found")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{visita_id}_despues_{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    content = await file.read()
    dest.write_bytes(content)

    visita.foto_despues_url = f"/assets/fotos/{filename}"
    visita.estado = "completada"
    db.commit()
    db.refresh(visita)
    return visita


@router.post("/{visita_id}/foto", response_model=VisitaOut)
async def upload_foto(visita_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Endpoint legacy — redirige a foto-despues para compatibilidad."""
    visita = db.query(Visita).filter(Visita.id == visita_id).first()
    if not visita:
        raise HTTPException(status_code=404, detail="Visita not found")

    ext = Path(file.filename).suffix if file.filename else ".jpg"
    filename = f"{visita_id}_{uuid.uuid4().hex}{ext}"
    dest = UPLOAD_DIR / filename
    content = await file.read()
    dest.write_bytes(content)

    visita.foto_url = f"/assets/fotos/{filename}"
    visita.foto_despues_url = f"/assets/fotos/{filename}"
    visita.estado = "completada"
    db.commit()
    db.refresh(visita)
    return visita

@router.get("/hoy", response_model=list[VisitaDetail])
def visitas_hoy(fecha: date | None = None, reponedor_id: int | None = None, db: Session = Depends(get_db)):
    target_date = fecha or date.today()
    q = db.query(Visita).filter(Visita.fecha == target_date)
    if reponedor_id:
        q = q.filter(Visita.reponedor_id == reponedor_id)
    return q.all()

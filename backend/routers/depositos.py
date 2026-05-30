from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from models import DepositoPOP
from schemas import DepositoPOPOut

router = APIRouter(prefix="/api/depositos", tags=["Depositos POP"])


@router.get("", response_model=list[DepositoPOPOut])
def list_depositos(db: Session = Depends(get_db)):
    return db.query(DepositoPOP).filter(DepositoPOP.activo == True).all()

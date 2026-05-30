from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile
from sqlalchemy.orm import Session
from pathlib import Path
from typing import Optional
import json, hashlib, shutil, asyncio
from datetime import datetime

from database import get_db
from models import FotoAnalisis, Visita

router = APIRouter(prefix="/api/vision", tags=["vision"])

RESPONSES_PATH = Path(__file__).parent.parent.parent / "assets" / "demo_responses" / "responses.json"
PHOTOS_PATH = Path(__file__).parent.parent.parent / "assets" / "demo_photos"


def get_response_for_photo(filename: str) -> dict:
    responses = json.loads(RESPONSES_PATH.read_text(encoding="utf-8-sig"))
    stem = Path(filename).stem
    return responses.get(stem, responses["default"])


@router.post("/analyze")
async def analyze_photo(
    file: UploadFile = File(...),
    visita_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
):
    if visita_id is not None and not db.query(Visita).filter(Visita.id == visita_id).first():
        raise HTTPException(status_code=404, detail="Visita not found")

    PHOTOS_PATH.mkdir(parents=True, exist_ok=True)
    save_path = PHOTOS_PATH / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    content = save_path.read_bytes()
    sha256 = hashlib.sha256(content).hexdigest()
    await asyncio.sleep(1.5)
    analysis = get_response_for_photo(file.filename)
    ts = datetime.utcnow()

    foto = FotoAnalisis(
        visita_id=visita_id,
        filename=file.filename,
        foto_url=f"/assets/demo_photos/{file.filename}",
        hash_sha256=sha256,
        timestamp=ts,
        analysis=json.dumps(analysis),
    )
    db.add(foto)
    db.commit()

    return {
        "foto_url": f"/assets/demo_photos/{file.filename}",
        "hash_sha256": sha256,
        "timestamp": ts.isoformat() + "Z",
        "analysis": analysis,
    }

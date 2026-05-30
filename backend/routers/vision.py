from fastapi import APIRouter, UploadFile, File
from pathlib import Path
import json, hashlib, shutil, asyncio
from datetime import datetime

router = APIRouter(prefix="/api/vision", tags=["vision"])

RESPONSES_PATH = Path(__file__).parent.parent.parent / "assets" / "demo_responses" / "responses.json"
PHOTOS_PATH = Path(__file__).parent.parent.parent / "assets" / "demo_photos"

def get_response_for_photo(filename: str) -> dict:
    responses = json.loads(RESPONSES_PATH.read_text(encoding="utf-8"))
    stem = Path(filename).stem
    return responses.get(stem, responses["default"])

@router.post("/analyze")
async def analyze_photo(file: UploadFile = File(...)):
    PHOTOS_PATH.mkdir(parents=True, exist_ok=True)
    save_path = PHOTOS_PATH / file.filename
    with open(save_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    content = save_path.read_bytes()
    sha256 = hashlib.sha256(content).hexdigest()
    await asyncio.sleep(1.5)
    analysis = get_response_for_photo(file.filename)
    return {
        "foto_url": f"/assets/demo_photos/{file.filename}",
        "hash_sha256": sha256,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "analysis": analysis
    }
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path

from database import engine
from models import Base
from routers import depositos, optimize, pdvs, reponedores, visitas

Base.metadata.create_all(bind=engine)

app = FastAPI(title="gvenado API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ASSETS_DIR = Path(__file__).parent.parent / "assets"
ASSETS_DIR.mkdir(exist_ok=True)
app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

app.include_router(pdvs.router)
app.include_router(reponedores.router)
app.include_router(visitas.router)
app.include_router(optimize.router)
app.include_router(depositos.router)


@app.get("/health")
def health():
    return {"status": "ok"}

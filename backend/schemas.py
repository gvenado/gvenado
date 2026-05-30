from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# --- Supervisor ---
class SupervisorBase(BaseModel):
    nombre: str


class SupervisorOut(SupervisorBase):
    id: int

    model_config = {"from_attributes": True}


# --- Reponedor ---
class ReponedorBase(BaseModel):
    nombre: str
    supervisor_id: int


class ReponedorOut(ReponedorBase):
    id: int
    supervisor: SupervisorOut

    model_config = {"from_attributes": True}


# --- PDV ---
class PDVOut(BaseModel):
    id: int
    nro: int
    mercado: str
    categoria: str
    codigo: Optional[str]
    cliente: str
    latitud: float
    longitud: float
    supervisor_id: int
    reponedor_id: int
    visita_minutos: int
    lunes: bool
    martes: bool
    miercoles: bool
    jueves: bool
    viernes: bool
    sabado: bool
    semanal: int
    mensual: int

    model_config = {"from_attributes": True}


class PDVDetail(PDVOut):
    supervisor: SupervisorOut
    reponedor: ReponedorOut

    model_config = {"from_attributes": True}


# --- Visita ---
class VisitaCreate(BaseModel):
    pdv_id: int
    reponedor_id: int
    fecha: date
    hora_inicio: Optional[datetime] = None
    hora_fin: Optional[datetime] = None
    notas: Optional[str] = None


class VisitaOut(BaseModel):
    id: int
    pdv_id: int
    reponedor_id: int
    fecha: date
    hora_inicio: Optional[datetime]
    hora_fin: Optional[datetime]
    foto_url: Optional[str]
    estado: str
    notas: Optional[str]

    model_config = {"from_attributes": True}


class VisitaDetail(VisitaOut):
    pdv: PDVOut
    reponedor: ReponedorOut

    model_config = {"from_attributes": True}


# --- Deposito POP ---
class DepositoPOPOut(BaseModel):
    id: int
    nombre: str
    latitud: float
    longitud: float
    descripcion: Optional[str]
    activo: bool

    model_config = {"from_attributes": True}


# --- Optimize ---
class OptimizeRequest(BaseModel):
    reponedor_id: int
    fecha: date
    max_pdvs: Optional[int] = None


class OptimizeResponse(BaseModel):
    reponedor_id: int
    fecha: date
    ruta: list[dict]
    distancia_total_km: float
    tiempo_estimado_min: int


# --- Simulate redistribution ---
class RedistribucionRequest(BaseModel):
    reponedor_ausente_id: int
    fecha: date


class RedistribucionResponse(BaseModel):
    reponedor_ausente_id: int
    fecha: date
    redistribucion: list[dict]
    aviso: str

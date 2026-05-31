from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


# --- Supervisor ---
class SupervisorBase(BaseModel):
    nombre: str


class SupervisorOut(SupervisorBase):
    id: int

    model_config = {"from_attributes": True}


# --- Mobility profile ---
class PerfilMovilidad(BaseModel):
    tipo: str
    velocidad_kmh: float


# --- Reponedor ---
class ReponedorBase(BaseModel):
    nombre: str
    supervisor_id: int


class ReponedorOut(ReponedorBase):
    id: int
    supervisor: SupervisorOut

    model_config = {"from_attributes": True}


class ReponedorWithPerfilOut(BaseModel):
    id: int
    nombre: str
    supervisor_id: int
    supervisor: SupervisorOut
    perfil_movilidad: PerfilMovilidad

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


# --- Mochila / Ruta-hoy ---
class MochilaOut(BaseModel):
    marca_precios: int
    colgantes: int
    cenefas: int


class RutaHoyOut(BaseModel):
    reponedor_id: int
    pdvs: list[PDVOut]
    mochila: MochilaOut
    tiempo_estimado: int


# --- Deposito POP ---
class DepositoPOPOut(BaseModel):
    id: int
    nombre: str
    latitud: float
    longitud: float
    descripcion: Optional[str]
    activo: bool

    model_config = {"from_attributes": True}


class StockOut(BaseModel):
    marca_precios: int
    colgantes: int
    cenefas: int


class DepositoPOPStockOut(BaseModel):
    id: int
    mercado: str
    stock: StockOut
    consumo_promedio_diario: StockOut
    dias_restantes: int
    riesgo_quiebre: str


# --- VRP Optimize (multi-vehicle, all reponedores) ---
class VRPRequest(BaseModel):
    fecha: date
    restricciones: dict = {}


class RutaReponedorOut(BaseModel):
    reponedor_id: int
    reponedor_nombre: str
    pdvs: list[dict]
    total_km: float
    total_tiempo_min: int
    cantidad_pdvs: int


class MetricasGlobalesOut(BaseModel):
    total_km: float
    total_tiempo_min: int
    pdvs_asignados: int
    pdvs_totales_dia: int
    reponedores_usados: int
    max_tiempo_ruta_min: int
    balance_carga: dict


class VRPResponse(BaseModel):
    rutas_por_reponedor: dict[str, RutaReponedorOut]
    metricas_globales: MetricasGlobalesOut
    pdvs_sin_asignar: list[int] = []
    infactible: bool = False
    from_cache: bool = False
    notas: list[str] = []


# --- Simulate redistribution ---
class RedistribucionRequest(BaseModel):
    reponedor_ausente_id: int
    fecha: date


class RedistribucionResponse(BaseModel):
    reponedor_ausente_id: int
    fecha: date
    redistribucion: list[dict]
    aviso: str

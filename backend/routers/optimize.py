"""
Routing engine endpoints using OR-Tools TSP for daily route optimization.
"""
import math
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from sqlalchemy.orm import Session

from database import get_db
from models import PDV, Reponedor
from schemas import OptimizeRequest, OptimizeResponse, RedistribucionRequest, RedistribucionResponse

router = APIRouter(prefix="/api", tags=["Optimize"])


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def build_distance_matrix(coords: list[tuple[float, float]]) -> list[list[int]]:
    n = len(coords)
    mat = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                mat[i][j] = int(haversine_km(*coords[i], *coords[j]) * 1000)
    return mat


def solve_tsp(coords: list[tuple[float, float]]) -> tuple[list[int], float]:
    if len(coords) <= 1:
        return list(range(len(coords))), 0.0

    mat = build_distance_matrix(coords)
    manager = pywrapcp.RoutingIndexManager(len(mat), 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def distance_cb(from_idx, to_idx):
        return mat[manager.IndexToNode(from_idx)][manager.IndexToNode(to_idx)]

    cb_idx = routing.RegisterTransitCallback(distance_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(cb_idx)

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    params.time_limit.seconds = 5

    solution = routing.SolveWithParameters(params)
    if not solution:
        return list(range(len(coords))), 0.0

    order = []
    index = routing.Start(0)
    total_dist = 0
    while not routing.IsEnd(index):
        node = manager.IndexToNode(index)
        order.append(node)
        next_index = solution.Value(routing.NextVar(index))
        total_dist += mat[node][manager.IndexToNode(next_index)]
        index = next_index

    return order, total_dist / 1000.0


@router.post("/optimize", response_model=OptimizeResponse)
def optimize_route(payload: OptimizeRequest, db: Session = Depends(get_db)):
    rep = db.query(Reponedor).filter(Reponedor.id == payload.reponedor_id).first()
    if not rep:
        raise HTTPException(status_code=404, detail="Reponedor not found")

    day_map = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado"}
    day_attr = day_map.get(payload.fecha.weekday())

    q = db.query(PDV).filter(PDV.reponedor_id == payload.reponedor_id)
    if day_attr:
        q = q.filter(getattr(PDV, day_attr) == True)
    pdvs = q.all()

    if payload.max_pdvs:
        pdvs = pdvs[: payload.max_pdvs]

    if not pdvs:
        return OptimizeResponse(
            reponedor_id=payload.reponedor_id,
            fecha=payload.fecha,
            ruta=[],
            distancia_total_km=0.0,
            tiempo_estimado_min=0,
        )

    coords = [(p.latitud, p.longitud) for p in pdvs]
    order, dist_km = solve_tsp(coords)

    ruta = [
        {
            "orden": i + 1,
            "pdv_id": pdvs[idx].id,
            "cliente": pdvs[idx].cliente,
            "mercado": pdvs[idx].mercado,
            "latitud": pdvs[idx].latitud,
            "longitud": pdvs[idx].longitud,
            "visita_minutos": pdvs[idx].visita_minutos,
        }
        for i, idx in enumerate(order)
    ]

    tiempo_total = sum(p.visita_minutos for p in pdvs)

    return OptimizeResponse(
        reponedor_id=payload.reponedor_id,
        fecha=payload.fecha,
        ruta=ruta,
        distancia_total_km=round(dist_km, 2),
        tiempo_estimado_min=tiempo_total,
    )


@router.post("/simulate-redistribution", response_model=RedistribucionResponse)
def simulate_redistribution(payload: RedistribucionRequest, db: Session = Depends(get_db)):
    absent = db.query(Reponedor).filter(Reponedor.id == payload.reponedor_ausente_id).first()
    if not absent:
        raise HTTPException(status_code=404, detail="Reponedor not found")

    day_map = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado"}
    day_attr = day_map.get(payload.fecha.weekday())

    q = db.query(PDV).filter(PDV.reponedor_id == payload.reponedor_ausente_id)
    if day_attr:
        q = q.filter(getattr(PDV, day_attr) == True)
    pdvs_afectados = q.all()

    # Distribute among reponedores of the same supervisor
    team = (
        db.query(Reponedor)
        .filter(
            Reponedor.supervisor_id == absent.supervisor_id,
            Reponedor.id != absent.id,
        )
        .all()
    )

    if not team:
        return RedistribucionResponse(
            reponedor_ausente_id=payload.reponedor_ausente_id,
            fecha=payload.fecha,
            redistribucion=[],
            aviso="No hay reponedores disponibles en el mismo equipo.",
        )

    redistribucion = []
    for i, pdv in enumerate(pdvs_afectados):
        assigned = team[i % len(team)]
        redistribucion.append(
            {
                "pdv_id": pdv.id,
                "cliente": pdv.cliente,
                "mercado": pdv.mercado,
                "reponedor_asignado_id": assigned.id,
                "reponedor_asignado": assigned.nombre,
            }
        )

    return RedistribucionResponse(
        reponedor_ausente_id=payload.reponedor_ausente_id,
        fecha=payload.fecha,
        redistribucion=redistribucion,
        aviso=f"{len(pdvs_afectados)} PDVs redistribuidos entre {len(team)} reponedores del equipo.",
    )

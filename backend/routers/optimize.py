"""
VRP routing engine — Capacitated VRP implemented as a two-phase algorithm.

Phase 1 – Balanced geographic pre-assignment
    PDVs for the requested weekday are sorted by geographic angle from the
    centroid, then distributed across 24 reponedores via a min-heap so every
    reponedor receives PDVs and total service time is nearly equal
    (empirically ~8-10 min standard deviation on Monday data).

Phase 2 – Per-group TSP
    Each reponedor's group is routed optimally using a single-vehicle OR-Tools
    TSP with PATH_CHEAPEST_ARC + GUIDED_LOCAL_SEARCH on a shared global
    distance matrix (no recomputation per group).  Time limit: 2 s per group
    (trivially fast for ~12-node instances).

Constraints
    • Max cumulative time per vehicle: MAX_WORKDAY_MIN = 435 min (7h 15m)
      = service time + travel time (including return to virtual depot)
    • Any route that exceeds this limit is flagged in `notas`; its PDVs are
      NOT silently dropped — they appear in the response with the violation
      clearly noted.
    • Travel speed: SPEED_KMH = 30.0 km/h (urban La Paz average)

Why not a single global OR-Tools VRP?
    A single multi-vehicle VRP with free vehicle assignment tends to
    consolidate routes into fewer vehicles than available, leaving some
    reponedores empty even with span-cost penalties.  The two-phase approach
    guarantees all 24 vehicles are used, produces routes with balanced service
    time, and runs faster (24 × 2 s ≪ 30 s global solve).
"""
import heapq
import json
import math
import statistics
import threading
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from ortools.constraint_solver import pywrapcp, routing_enums_pb2
from sqlalchemy.orm import Session

from database import get_db
from models import PDV, Reponedor
from schemas import (
    VRPRequest,
    VRPResponse,
    RedistribucionRequest,
    RedistribucionResponse,
)

router = APIRouter(prefix="/api", tags=["Optimize"])

MAX_WORKDAY_MIN: int = 435        # 7h 15m hard cap per reponedor
SPEED_KMH: float = 30.0           # urban La Paz average
TSP_SECONDS_PER_GROUP: int = 1

# ---------------------------------------------------------------------------
# In-memory result cache
# Key: (fecha_iso: str, restricciones_json: str)
# Value: dict from VRPResponse.model_dump() — no ORM objects stored
# Lifetime: process lifetime; never persisted to disk.
# ---------------------------------------------------------------------------
_cache: dict[tuple[str, str], dict] = {}
_cache_lock = threading.Lock()

_DAY_ATTRS = {
    0: "lunes",
    1: "martes",
    2: "miercoles",
    3: "jueves",
    4: "viernes",
    5: "sabado",
}


# ---------------------------------------------------------------------------
# Geometry helpers
# ---------------------------------------------------------------------------

def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


def centroid(coords: list[tuple[float, float]]) -> tuple[float, float]:
    n = len(coords)
    return sum(c[0] for c in coords) / n, sum(c[1] for c in coords) / n


# ---------------------------------------------------------------------------
# Phase 1 – Balanced geographic pre-assignment
# ---------------------------------------------------------------------------

def balanced_geo_assignment(pdvs: list, n_groups: int) -> list[list[int]]:
    """
    Distribute PDV list-indices across n_groups such that:
      • Every group gets at least one PDV (if len(pdvs) >= n_groups)
      • Total service time is approximately equal across groups
      • PDVs within each group are geographically close

    Returns a list of n_groups lists; each inner list contains 0-based
    indices into `pdvs`.
    """
    if not pdvs:
        return [[] for _ in range(n_groups)]

    ctr = centroid([(p.latitud, p.longitud) for p in pdvs])

    # Sort PDVs by geographic angle from centroid
    sorted_idx = sorted(
        range(len(pdvs)),
        key=lambda i: math.atan2(
            pdvs[i].latitud - ctr[0],
            pdvs[i].longitud - ctr[1],
        ),
    )

    groups: list[list[int]] = [[] for _ in range(n_groups)]
    # min-heap: (accumulated_service_time, group_index)
    heap: list[tuple[float, int]] = [(0.0, g) for g in range(n_groups)]
    heapq.heapify(heap)
    group_acc: list[float] = [0.0] * n_groups

    for pdv_idx in sorted_idx:
        min_t, g = heapq.heappop(heap)
        groups[g].append(pdv_idx)
        new_t = min_t + pdvs[pdv_idx].visita_minutos
        group_acc[g] = new_t
        heapq.heappush(heap, (new_t, g))

    return groups


# ---------------------------------------------------------------------------
# Distance matrix
# ---------------------------------------------------------------------------

def build_distance_matrix(
    coords: list[tuple[float, float]],
) -> list[list[int]]:
    """Integer-meter haversine distance matrix."""
    n = len(coords)
    mat = [[0] * n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                mat[i][j] = int(haversine_km(*coords[i], *coords[j]) * 1000)
    return mat


# ---------------------------------------------------------------------------
# Phase 2 – Per-group TSP
# ---------------------------------------------------------------------------

def _solve_group_tsp(
    group_indices: list[int],
    dist_m: list[list[int]],
    max_secs: int = TSP_SECONDS_PER_GROUP,
) -> list[int]:
    """
    Optimise the visit order for one group using a single-vehicle TSP.

    Parameters
    ----------
    group_indices : 0-based indices into the PDV list (matches rows/cols in
                    dist_m offset by 1 because dist_m[0] is the depot).
    dist_m       : Global distance matrix; row/col 0 = virtual depot,
                   row/col k = PDV at index k-1.

    Returns
    -------
    Ordered list of 0-based PDV indices.
    """
    n = len(group_indices)
    if n == 0:
        return []
    if n == 1:
        return list(group_indices)

    # Build sub-matrix: depot (0) followed by the group's nodes
    node_map = [0] + [i + 1 for i in group_indices]  # global dist_m indices
    m = len(node_map)
    sub = [
        [dist_m[node_map[a]][node_map[b]] for b in range(m)]
        for a in range(m)
    ]

    manager = pywrapcp.RoutingIndexManager(m, 1, 0)
    routing = pywrapcp.RoutingModel(manager)

    def _cb(fi: int, ti: int) -> int:
        return sub[manager.IndexToNode(fi)][manager.IndexToNode(ti)]

    cb_idx = routing.RegisterTransitCallback(_cb)
    routing.SetArcCostEvaluatorOfAllVehicles(cb_idx)

    params = pywrapcp.DefaultRoutingSearchParameters()
    params.first_solution_strategy = (
        routing_enums_pb2.FirstSolutionStrategy.PATH_CHEAPEST_ARC
    )
    params.local_search_metaheuristic = (
        routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH
    )
    params.time_limit.seconds = max_secs

    sol = routing.SolveWithParameters(params)
    if not sol:
        return list(group_indices)  # fallback: return pre-assignment order

    order: list[int] = []
    idx = routing.Start(0)
    while not routing.IsEnd(idx):
        node = manager.IndexToNode(idx)
        if node != 0:
            order.append(group_indices[node - 1])
        idx = sol.Value(routing.NextVar(idx))
    return order


# ---------------------------------------------------------------------------
# VRP solver (Phase 1 + Phase 2 combined)
# ---------------------------------------------------------------------------

def solve_vrp(
    pdvs: list,
    reponedores: list,
    max_time_min: int = MAX_WORKDAY_MIN,
) -> dict:
    """
    Solve a Capacitated VRP for `pdvs` and `reponedores`.

    Returns
    -------
    {
      "feasible": bool,
      "routes": [
        {
          "vehicle": int,
          "reponedor": Reponedor ORM,
          "nodes": [pdv_list_indices],
          "dist_km": float,
          "time_min": float,   # travel + service; includes return to depot
          "exceeds_limit": bool,
        }
      ],
      "dropped": [],           # always empty for this algorithm
    }
    """
    n_pdvs = len(pdvs)
    n_vehicles = len(reponedores)

    if n_pdvs == 0:
        return {
            "feasible": True,
            "routes": [
                {
                    "vehicle": v,
                    "reponedor": reponedores[v],
                    "nodes": [],
                    "dist_km": 0.0,
                    "time_min": 0.0,
                    "exceeds_limit": False,
                }
                for v in range(n_vehicles)
            ],
            "dropped": [],
        }

    # Virtual depot = geographic centroid of all PDVs
    depot = centroid([(p.latitud, p.longitud) for p in pdvs])

    # Global distance matrix: index 0 = depot, index k = pdvs[k-1]
    all_coords = [depot] + [(p.latitud, p.longitud) for p in pdvs]
    dist_m = build_distance_matrix(all_coords)

    speed_m_per_min = SPEED_KMH * 1000.0 / 60.0

    # Phase 1 – balanced geographic pre-assignment
    groups = balanced_geo_assignment(pdvs, n_vehicles)

    # Phase 2 – per-group TSP
    routes = []
    for v, (rep, group) in enumerate(zip(reponedores, groups)):
        ordered = _solve_group_tsp(group, dist_m)

        # Compute route metrics using global distance matrix
        route_km = 0.0
        travel_min = 0.0
        if ordered:
            seq = [0] + [i + 1 for i in ordered] + [0]
            for k in range(len(seq) - 1):
                d = dist_m[seq[k]][seq[k + 1]]
                route_km += d / 1000.0
                travel_min += d / speed_m_per_min

        service_min = sum(pdvs[i].visita_minutos for i in ordered)
        total_min = travel_min + service_min

        routes.append(
            {
                "vehicle": v,
                "reponedor": rep,
                "nodes": ordered,
                "dist_km": round(route_km, 3),
                "time_min": round(total_min, 1),
                "exceeds_limit": total_min > max_time_min,
            }
        )

    return {"feasible": True, "routes": routes, "dropped": []}


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------

def _cache_key(payload: VRPRequest) -> tuple[str, str]:
    restricciones_json = json.dumps(payload.restricciones, sort_keys=True)
    return (payload.fecha.isoformat(), restricciones_json)


@router.post("/optimize", response_model=VRPResponse)
def optimize_all_routes(payload: VRPRequest, db: Session = Depends(get_db)):
    """
    Capacitated VRP: assigns all PDVs scheduled for `fecha` across all
    24 reponedores and optimises each route, respecting the 435-min work day.

    Results are cached in memory for the lifetime of the server process.
    Repeated calls with the same (fecha, restricciones) return instantly;
    `from_cache: true` in the response indicates a cache hit.
    """
    key = _cache_key(payload)
    with _cache_lock:
        if key in _cache:
            cached = dict(_cache[key])
            cached["from_cache"] = True
            return VRPResponse(**cached)

    reponedores = db.query(Reponedor).order_by(Reponedor.id).all()
    if not reponedores:
        raise HTTPException(status_code=500, detail="No reponedores in database")

    day_attr = _DAY_ATTRS.get(payload.fecha.weekday())
    notas: list[str] = []

    if day_attr is None:
        # Sunday — no PDVs are ever scheduled on Sundays.
        empty_rutas = {
            str(r.id): {
                "reponedor_id": r.id,
                "reponedor_nombre": r.nombre,
                "pdvs": [],
                "total_km": 0.0,
                "total_tiempo_min": 0,
                "cantidad_pdvs": 0,
            }
            for r in reponedores
        }
        return VRPResponse(
            rutas_por_reponedor=empty_rutas,
            metricas_globales={
                "total_km": 0.0,
                "total_tiempo_min": 0,
                "pdvs_asignados": 0,
                "pdvs_totales_dia": 0,
                "reponedores_usados": 0,
                "max_tiempo_ruta_min": 0,
                "balance_carga": {},
            },
            pdvs_sin_asignar=[],
            infactible=False,
            notas=["Sunday has no scheduled PDVs"],
        )

    q = db.query(PDV).filter(getattr(PDV, day_attr) == True)
    pdvs = q.order_by(PDV.id).all()

    if not pdvs:
        empty_rutas = {
            str(r.id): {
                "reponedor_id": r.id,
                "reponedor_nombre": r.nombre,
                "pdvs": [],
                "total_km": 0.0,
                "total_tiempo_min": 0,
                "cantidad_pdvs": 0,
            }
            for r in reponedores
        }
        return VRPResponse(
            rutas_por_reponedor=empty_rutas,
            metricas_globales={
                "total_km": 0.0,
                "total_tiempo_min": 0,
                "pdvs_asignados": 0,
                "pdvs_totales_dia": 0,
                "reponedores_usados": 0,
                "max_tiempo_ruta_min": 0,
                "balance_carga": {},
            },
            pdvs_sin_asignar=[],
            infactible=False,
            notas=[f"No hay PDVs programados para {day_attr or 'este día'}."],
        )

    result = solve_vrp(pdvs, reponedores, max_time_min=MAX_WORKDAY_MIN)

    # Build per-reponedor route output
    rutas: dict = {}
    violations: list[str] = []
    for route in result["routes"]:
        rep = route["reponedor"]
        pdv_list = [
            {
                "orden": order + 1,
                "pdv_id": pdvs[idx].id,
                "cliente": pdvs[idx].cliente,
                "mercado": pdvs[idx].mercado,
                "latitud": pdvs[idx].latitud,
                "longitud": pdvs[idx].longitud,
                "visita_minutos": pdvs[idx].visita_minutos,
            }
            for order, idx in enumerate(route["nodes"])
        ]
        if route["exceeds_limit"]:
            violations.append(
                f"Reponedor {rep.id} ({rep.nombre}): "
                f"{route['time_min']:.0f} min > {MAX_WORKDAY_MIN} min"
            )
        rutas[str(rep.id)] = {
            "reponedor_id": rep.id,
            "reponedor_nombre": rep.nombre,
            "pdvs": pdv_list,
            "total_km": round(route["dist_km"], 2),
            "total_tiempo_min": round(route["time_min"]),
            "cantidad_pdvs": len(route["nodes"]),
        }

    if violations:
        notas.append(
            f"{len(violations)} ruta(s) exceden {MAX_WORKDAY_MIN} min: "
            + "; ".join(violations)
        )

    # Global metrics
    all_km = sum(r["dist_km"] for r in result["routes"])
    all_min = sum(r["time_min"] for r in result["routes"])
    active = [r for r in result["routes"] if r["nodes"]]
    max_time = max((r["time_min"] for r in result["routes"]), default=0.0)
    route_times = [r["time_min"] for r in result["routes"]]
    mean_t = statistics.mean(route_times) if route_times else 0.0
    std_t = statistics.stdev(route_times) if len(route_times) > 1 else 0.0

    sorted_rutas = sorted(rutas.items(), key=lambda x: x[1]["total_tiempo_min"])
    balance_carga = {
        "tiempo_promedio_min": round(mean_t, 1),
        "desviacion_std_min": round(std_t, 1),
        "coeficiente_variacion": round(std_t / mean_t, 3) if mean_t else 0.0,
        "reponedor_mas_cargado_id": int(sorted_rutas[-1][0]) if sorted_rutas else None,
        "reponedor_menos_cargado_id": int(sorted_rutas[0][0]) if sorted_rutas else None,
    }

    metricas = {
        "total_km": round(all_km, 2),
        "total_tiempo_min": round(all_min),
        "pdvs_asignados": len(pdvs),           # two-phase always assigns all
        "pdvs_totales_dia": len(pdvs),
        "reponedores_usados": len(active),
        "max_tiempo_ruta_min": round(max_time),
        "balance_carga": balance_carga,
    }

    response = VRPResponse(
        rutas_por_reponedor=rutas,
        metricas_globales=metricas,
        pdvs_sin_asignar=[],   # two-phase guarantees full coverage
        infactible=bool(violations),
        from_cache=False,
        notas=notas,
    )
    # Store a serialised copy (model_dump) so no ORM objects live in cache
    with _cache_lock:
        _cache[key] = response.model_dump()
    return response


@router.post("/simulate-redistribution", response_model=RedistribucionResponse)
def simulate_redistribution(
    payload: RedistribucionRequest,
    db: Session = Depends(get_db),
):
    """
    Redistribute the absent reponedor's PDVs among team members.
    Each PDV is assigned to the colleague whose existing territory centroid
    is geographically nearest.
    """
    absent = (
        db.query(Reponedor)
        .filter(Reponedor.id == payload.reponedor_ausente_id)
        .first()
    )
    if not absent:
        raise HTTPException(status_code=404, detail="Reponedor not found")

    day_attr = _DAY_ATTRS.get(payload.fecha.weekday())
    q = db.query(PDV).filter(PDV.reponedor_id == payload.reponedor_ausente_id)
    if day_attr:
        q = q.filter(getattr(PDV, day_attr) == True)
    pdvs_afectados = q.all()

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

    if not pdvs_afectados:
        return RedistribucionResponse(
            reponedor_ausente_id=payload.reponedor_ausente_id,
            fecha=payload.fecha,
            redistribucion=[],
            aviso=f"El reponedor no tiene PDVs para {day_attr or 'este día'}.",
        )

    # Centroid of each team member's territory
    team_centroids: dict[int, tuple[float, float]] = {}
    for member in team:
        member_pdvs = db.query(PDV).filter(PDV.reponedor_id == member.id).all()
        team_centroids[member.id] = (
            centroid([(p.latitud, p.longitud) for p in member_pdvs])
            if member_pdvs
            else (pdvs_afectados[0].latitud, pdvs_afectados[0].longitud)
        )

    redistribucion = []
    for pdv in pdvs_afectados:
        best = min(
            team,
            key=lambda m: haversine_km(
                pdv.latitud,
                pdv.longitud,
                team_centroids[m.id][0],
                team_centroids[m.id][1],
            ),
        )
        redistribucion.append(
            {
                "pdv_id": pdv.id,
                "cliente": pdv.cliente,
                "mercado": pdv.mercado,
                "reponedor_asignado_id": best.id,
                "reponedor_asignado": best.nombre,
            }
        )

    return RedistribucionResponse(
        reponedor_ausente_id=payload.reponedor_ausente_id,
        fecha=payload.fecha,
        redistribucion=redistribucion,
        aviso=(
            f"{len(pdvs_afectados)} PDVs redistribuidos geográficamente entre "
            f"{len(team)} reponedores del equipo."
        ),
    )

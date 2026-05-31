"""
Lightweight validation script for POST /api/optimize (VRP).

Checks:
1. HTTP 200 and correct top-level keys
2. All PDVs scheduled for the day are considered (none silently dropped)
3. No PDV assigned to more than one reponedor
4. No route exceeds MAX_WORKDAY_MIN = 435 minutes
5. Every assigned PDV exists in SQLite
6. Summary printed for review

Usage:
    cd backend
    source venv/bin/activate
    python scripts/validate_vrp.py [fecha]   # fecha defaults to today
"""
import json
import sys
from datetime import date, datetime

# --------------------------------------------------------------------------
# Config
# --------------------------------------------------------------------------
BASE_URL = "http://127.0.0.1:8000"
MAX_WORKDAY_MIN = 435
DEFAULT_DATE = date.today().isoformat()

try:
    import requests
except ImportError:
    print("requests not installed; falling back to urllib")
    requests = None  # type: ignore


def call_optimize(fecha: str) -> dict:
    body = {"fecha": fecha, "restricciones": {}}
    if requests:
        r = requests.post(f"{BASE_URL}/api/optimize", json=body, timeout=120)
        r.raise_for_status()
        return r.json()
    # urllib fallback
    import urllib.request, urllib.error
    data = json.dumps(body).encode()
    req = urllib.request.Request(
        f"{BASE_URL}/api/optimize",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as resp:
        return json.loads(resp.read())


def call_pdvs() -> list:
    if requests:
        r = requests.get(f"{BASE_URL}/api/pdvs", timeout=10)
        r.raise_for_status()
        return r.json()
    import urllib.request
    with urllib.request.urlopen(f"{BASE_URL}/api/pdvs", timeout=10) as resp:
        return json.loads(resp.read())


def validate(fecha: str) -> None:
    print(f"\n{'='*60}")
    print(f"  ASTA VRP Validation — fecha: {fecha}")
    print(f"{'='*60}\n")

    # 1. Call /api/optimize
    print("→ POST /api/optimize ...")
    try:
        data = call_optimize(fecha)
    except Exception as e:
        print(f"  FAIL: {e}")
        sys.exit(1)
    print("  OK: HTTP 200\n")

    # 2. Top-level keys
    required_keys = {"rutas_por_reponedor", "metricas_globales", "pdvs_sin_asignar", "infactible"}
    missing = required_keys - data.keys()
    assert not missing, f"Missing keys: {missing}"
    print("→ Top-level keys: PASS")

    rutas = data["rutas_por_reponedor"]
    metricas = data["metricas_globales"]
    sin_asignar = data["pdvs_sin_asignar"]

    # 3. Fetch all PDVs to get day totals
    print("→ GET /api/pdvs ...")
    all_pdvs = call_pdvs()
    pdv_by_id = {p["id"]: p for p in all_pdvs}
    print(f"  Total PDVs in DB: {len(all_pdvs)}")

    # Day of week
    d = datetime.strptime(fecha, "%Y-%m-%d").date()
    day_names = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
    day_attr = day_names[d.weekday()] if d.weekday() < 6 else None
    if day_attr:
        expected_pdvs = [p for p in all_pdvs if p.get(day_attr, False)]
        print(f"  PDVs scheduled for {day_attr}: {len(expected_pdvs)}")
    else:
        expected_pdvs = all_pdvs
        print(f"  Sunday: all {len(expected_pdvs)} PDVs considered")
    print()

    # 4. Collect all assigned PDV IDs
    assigned_ids: list[int] = []
    for rep_id, ruta in rutas.items():
        for p in ruta["pdvs"]:
            assigned_ids.append(p["pdv_id"])

    assigned_set = set(assigned_ids)
    expected_set = {p["id"] for p in expected_pdvs}
    sin_asignar_set = set(sin_asignar)

    # Check coverage: assigned + dropped = total scheduled
    covered = assigned_set | sin_asignar_set
    not_covered = expected_set - covered
    assert not not_covered, (
        f"FAIL: {len(not_covered)} PDVs neither assigned nor reported as dropped: {sorted(not_covered)[:10]}"
    )
    print(f"→ Coverage check: {len(assigned_set)} assigned + {len(sin_asignar_set)} dropped "
          f"= {len(covered)} / {len(expected_set)} scheduled — PASS")

    # 5. No PDV assigned twice
    duplicates = [pid for pid in assigned_ids if assigned_ids.count(pid) > 1]
    assert not duplicates, f"FAIL: PDVs assigned more than once: {set(duplicates)}"
    print("→ No duplicate assignments: PASS")

    # 6. All assigned PDVs exist in SQLite
    unknown = assigned_set - set(pdv_by_id.keys())
    assert not unknown, f"FAIL: Assigned PDV IDs not in DB: {unknown}"
    print("→ All assigned PDVs exist in DB: PASS")

    # 7. Route time constraints
    violations = []
    for rep_id, ruta in rutas.items():
        t = ruta["total_tiempo_min"]
        if t > MAX_WORKDAY_MIN:
            violations.append((rep_id, ruta["reponedor_nombre"], t))
    if violations:
        print(f"→ Time constraint VIOLATIONS ({len(violations)} routes exceed {MAX_WORKDAY_MIN} min):")
        for rep_id, nombre, t in violations[:5]:
            print(f"    Reponedor {rep_id} ({nombre}): {t} min")
    else:
        print(f"→ All routes ≤ {MAX_WORKDAY_MIN} min: PASS")

    # 8. Summary
    print(f"\n{'─'*60}")
    print("  GLOBAL METRICS")
    print(f"{'─'*60}")
    for k, v in metricas.items():
        if k != "balance_carga":
            print(f"  {k:<30} {v}")
    bc = metricas.get("balance_carga", {})
    print(f"\n  Balance de carga:")
    for k, v in bc.items():
        print(f"    {k:<36} {v}")

    print(f"\n  Routes with PDVs: {sum(1 for r in rutas.values() if r['cantidad_pdvs'] > 0)}")
    if data.get("notas"):
        print(f"\n  Notas:")
        for n in data["notas"]:
            print(f"    • {n}")

    if sin_asignar:
        print(f"\n  ⚠  PDVs sin asignar ({len(sin_asignar)}): {sin_asignar[:10]}{'…' if len(sin_asignar) > 10 else ''}")

    print(f"\n  infactible: {data['infactible']}")
    print(f"\n{'='*60}")
    print("  ALL CHECKS PASSED" if not not_covered and not duplicates and not unknown else "  SOME CHECKS FAILED")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    fecha = sys.argv[1] if len(sys.argv) > 1 else DEFAULT_DATE
    validate(fecha)

"""
Seed script: loads 474 real PDVs from the Excel file into SQLite.
Idempotent — safe to run multiple times.
Use --reset to clear and reload all PDV data.
"""
import argparse
import sys
from pathlib import Path

import pandas as pd

# Add backend root to path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent))

from database import SessionLocal, engine
from models import Base, DepositoPOP, PDV, Reponedor, Supervisor, Visita

EXCEL_PATH = Path(__file__).parent.parent.parent / "docs" / "INFORMACION DE DATOS TRADICIONAL LA PAZ rev..xlsx"
SHEET_NAME = "CLIENT. TRADE LP"
EXPECTED_PDV_COUNT = 474

DAY_MAP = {
    "LUNES": "lunes",
    "MARTES": "martes",
    "MIÉRCOLES": "miercoles",
    "JUEVES": "jueves",
    "VIERNES": "viernes",
    "SÁBADO": "sabado",
}


def load_excel() -> pd.DataFrame:
    df = pd.read_excel(EXCEL_PATH, sheet_name=SHEET_NAME, header=1)
    df.columns = df.columns.str.strip()
    if len(df) != EXPECTED_PDV_COUNT:
        raise ValueError(f"Expected {EXPECTED_PDV_COUNT} PDVs in Excel, found {len(df)}")
    return df


def seed(reset: bool = False) -> None:
    Base.metadata.create_all(bind=engine)

    df = load_excel()
    db = SessionLocal()

    try:
        if reset:
            print("--reset: clearing all data...")
            db.query(Visita).delete()
            db.query(PDV).delete()
            db.query(Reponedor).delete()
            db.query(Supervisor).delete()
            db.query(DepositoPOP).delete()
            db.commit()
            print("  Cleared.")

        # --- Supervisores ---
        supervisor_names = sorted(df["SUPERVISOR"].unique())
        supervisor_map: dict[str, int] = {}
        for name in supervisor_names:
            existing = db.query(Supervisor).filter(Supervisor.nombre == name).first()
            if existing:
                supervisor_map[name] = existing.id
            else:
                sup = Supervisor(nombre=name)
                db.add(sup)
                db.flush()
                supervisor_map[name] = sup.id
        db.commit()
        print(f"Supervisores: {len(supervisor_map)} upserted ({', '.join(supervisor_map.keys())})")

        # --- Reponedores ---
        reponedor_map: dict[str, int] = {}
        for _, row in df.iterrows():
            nombre = row["REPONEDOR"]
            supervisor_nombre = row["SUPERVISOR"]
            if nombre in reponedor_map:
                continue
            existing = db.query(Reponedor).filter(Reponedor.nombre == nombre).first()
            if existing:
                reponedor_map[nombre] = existing.id
            else:
                rep = Reponedor(nombre=nombre, supervisor_id=supervisor_map[supervisor_nombre])
                db.add(rep)
                db.flush()
                reponedor_map[nombre] = rep.id
        db.commit()
        print(f"Reponedores: {len(reponedor_map)} upserted")

        # --- PDVs ---
        inserted = 0
        skipped = 0
        for _, row in df.iterrows():
            cliente = str(row["CLIENTE"]).strip()
            existing = db.query(PDV).filter(PDV.cliente == cliente).first()
            if existing:
                skipped += 1
                continue

            day_flags = {
                col_db: bool(row[col_excel] == 1 or row[col_excel] == 1.0)
                for col_excel, col_db in DAY_MAP.items()
            }

            raw_codigo = str(row["CODIGO"]).strip() if row["CODIGO"] is not None else None

            pdv = PDV(
                nro=int(row["Nro"]),
                mercado=str(row["MERCADO"]).strip(),
                categoria=str(row["CATEGORIA"]).strip(),
                codigo=raw_codigo,
                cliente=cliente,
                latitud=float(row["LATITUD"]),
                longitud=float(row["LONGITUD"]),
                supervisor_id=supervisor_map[row["SUPERVISOR"]],
                reponedor_id=reponedor_map[row["REPONEDOR"]],
                visita_minutos=int(row["VISITA EN MINUTOS"]),
                semanal=int(row["SEMANAL"]),
                mensual=int(row["MENSUAL"]),
                **day_flags,
            )
            db.add(pdv)
            inserted += 1

        db.commit()
        print(f"PDVs: {inserted} inserted, {skipped} skipped (already exist)")

        # --- Validation ---
        total = db.query(PDV).count()
        print(f"\nValidation: {total} PDVs in database", end="")
        if total == EXPECTED_PDV_COUNT:
            print(f" ✓  (expected {EXPECTED_PDV_COUNT})")
        else:
            print(f" ✗  (expected {EXPECTED_PDV_COUNT})")
            sys.exit(1)

        # --- Seed one default deposito POP if none exist ---
        if db.query(DepositoPOP).count() == 0:
            deposito = DepositoPOP(
                nombre="Deposito Central La Paz",
                latitud=-16.500000,
                longitud=-68.119293,
                descripcion="Deposito principal de materiales POP",
            )
            db.add(deposito)
            db.commit()
            print("DepositoPOP: 1 default record inserted")

    finally:
        db.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Seed PDV data into SQLite")
    parser.add_argument("--reset", action="store_true", help="Clear all data before seeding")
    args = parser.parse_args()

    seed(reset=args.reset)
    print("\nSeed completed successfully.")

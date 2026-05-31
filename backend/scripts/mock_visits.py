"""
Generates 4 weeks of mock historical visits linked to real PDVs and reponedores.
Idempotent: skips dates that already have visits.
"""
import random
import sys
from datetime import date, datetime, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from database import SessionLocal, engine
from models import Base, PDV, Reponedor, Visita

WEEKS_BACK = 4
random.seed(42)

DAY_ATTRS = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
WEEKDAY_TO_ATTR = {0: "lunes", 1: "martes", 2: "miercoles", 3: "jueves", 4: "viernes", 5: "sabado"}
ESTADOS = ["completada", "completada", "completada", "no_visitado", "completada"]


def generate_mock_visits() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        pdvs = db.query(PDV).all()
        if not pdvs:
            print("No PDVs found. Run seed.py first.")
            sys.exit(1)

        today = date.today()
        start_date = today - timedelta(weeks=WEEKS_BACK)

        # Collect dates already covered to keep idempotency cheap
        existing_keys: set[tuple[int, date]] = set(
            (v.pdv_id, v.fecha) for v in db.query(Visita.pdv_id, Visita.fecha).all()
        )

        inserted = 0
        skipped = 0

        current = start_date
        while current < today:
            weekday = current.weekday()  # 0=Mon … 5=Sat, 6=Sun
            day_attr = WEEKDAY_TO_ATTR.get(weekday)

            if day_attr is None:
                current += timedelta(days=1)
                continue

            for pdv in pdvs:
                if not getattr(pdv, day_attr):
                    continue

                key = (pdv.id, current)
                if key in existing_keys:
                    skipped += 1
                    continue

                base_hour = 8 + random.randint(0, 3)
                hora_inicio = datetime(current.year, current.month, current.day, base_hour, random.randint(0, 59))
                hora_fin = hora_inicio + timedelta(minutes=pdv.visita_minutos + random.randint(-5, 10))
                estado = random.choice(ESTADOS)

                visita = Visita(
                    pdv_id=pdv.id,
                    reponedor_id=pdv.reponedor_id,
                    fecha=current,
                    hora_inicio=hora_inicio,
                    hora_fin=hora_fin,
                    estado=estado,
                    notas="Mock histórico" if estado == "completada" else None,
                )
                db.add(visita)
                existing_keys.add(key)
                inserted += 1

            if inserted % 500 == 0 and inserted > 0:
                db.commit()

            current += timedelta(days=1)

        db.commit()
        total = db.query(Visita).count()
        print(f"Mock visits: {inserted} inserted, {skipped} skipped")
        print(f"Total visits in DB: {total}")

    finally:
        db.close()


if __name__ == "__main__":
    generate_mock_visits()
    print("Mock visits generation completed.")

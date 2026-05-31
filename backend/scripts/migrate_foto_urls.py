"""
Migración: agregar foto_antes_url y foto_despues_url a la tabla visitas.
Ejecutar una sola vez: python scripts/migrate_foto_urls.py
"""
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "gvenado.db"

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

existing = [row[1] for row in cursor.execute("PRAGMA table_info(visitas)")]

if "foto_antes_url" not in existing:
    cursor.execute("ALTER TABLE visitas ADD COLUMN foto_antes_url VARCHAR(500)")
    print("✅ Columna foto_antes_url agregada")
else:
    print("ℹ️  foto_antes_url ya existe")

if "foto_despues_url" not in existing:
    cursor.execute("ALTER TABLE visitas ADD COLUMN foto_despues_url VARCHAR(500)")
    print("✅ Columna foto_despues_url agregada")
else:
    print("ℹ️  foto_despues_url ya existe")

conn.commit()
conn.close()
print("Migración completada.")
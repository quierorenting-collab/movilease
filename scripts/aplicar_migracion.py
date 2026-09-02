# -*- coding: utf-8 -*-
"""Aplica un fichero de migración contra la base de datos de Supabase.

El proyecto no tiene CLI de Supabase y hasta ahora las migraciones se pegaban
a mano en el editor SQL del panel. Eso tiene dos problemas: es trabajo manual
en cada despliegue de esquema, y sobre todo **no es atómico** — si el fichero
falla por la mitad, la base se queda medio migrada y hay que deshacerlo a ojo.

Aquí todo el fichero va dentro de una única transacción. O entra entero o no
entra nada. Si la comprobación del final de la migración lanza una excepción,
el rollback se lleva también las tablas que sí se habían creado.

    python scripts/aplicar_migracion.py supabase/migrations/0005_asesor_ia.sql

Requiere una línea nueva en .env.local (que está en .gitignore y nunca se
sube):

    SUPABASE_DB_URL=postgresql://postgres.<ref>:<password>@<host>:5432/postgres

Se saca del panel de Supabase, en Project Settings → Database → Connection
string. Conviene coger la del **Session pooler**: la conexión directa de
Supabase es solo IPv6 y muchas conexiones domésticas no la alcanzan. El
pooler en modo transacción (puerto 6543) NO sirve para DDL; tiene que ser
sesión, puerto 5432.
"""
import os
import sys

import psycopg2

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def leer_env():
    ruta = os.path.join(RAIZ, ".env.local")
    if not os.path.exists(ruta):
        raise SystemExit("No encuentro .env.local")
    env = {}
    for linea in open(ruta, encoding="utf-8"):
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            env[k.strip()] = v.strip().strip('"').strip("'")
    return env


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/aplicar_migracion.py <fichero.sql>")

    fichero = sys.argv[1]
    if not os.path.isabs(fichero):
        fichero = os.path.join(RAIZ, fichero)
    if not os.path.exists(fichero):
        raise SystemExit(f"No existe {fichero}")

    env = leer_env()
    url = env.get("SUPABASE_DB_URL")
    if not url:
        raise SystemExit(
            "Falta SUPABASE_DB_URL en .env.local.\n"
            "Panel de Supabase → Project Settings → Database → Connection string,\n"
            "pestaña Session pooler (puerto 5432, no 6543)."
        )

    sql = open(fichero, encoding="utf-8").read()
    print(f"Aplicando {os.path.basename(fichero)} ({len(sql):,} caracteres)…")

    conn = psycopg2.connect(url)
    try:
        # autocommit desactivado a propósito: es lo que hace que el fichero
        # entero sea atómico y que un fallo al final no deje medio esquema.
        conn.autocommit = False
        with conn.cursor() as cur:
            cur.execute(sql)
        conn.commit()
        print("\nOK. Migración aplicada y confirmada.")
    except Exception as e:  # noqa: BLE001 — se informa y se sale, no se traga
        conn.rollback()
        print("\nFALLO. Se ha deshecho todo, la base queda como estaba.\n")
        print(f"  {type(e).__name__}: {e}")
        raise SystemExit(1)
    finally:
        # Los NOTICE llevan lo que la migración quiso contar (por ejemplo el
        # "aplicada correctamente" del bloque de comprobación), y se pierden
        # si no se leen explícitamente.
        for aviso in conn.notices:
            print("  " + aviso.strip())
        conn.close()


if __name__ == "__main__":
    main()

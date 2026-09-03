# -*- coding: utf-8 -*-
"""Siembra la base de conocimientos del asesor con lo que la web YA responde.

Regla de este fichero: **ni una sola respuesta inventada**. Todas salen
literalmente de FAQ_ITEMS en src/app/(public)/page.tsx, que es texto ya
publicado en movilease.es y por tanto ya aprobado por Adrián. Si el asesor
tiene que responder algo que no esté aquí, la respuesta correcta es decir que
lo consulta con un asesor humano, no improvisar.

Se puede reejecutar sin miedo: corrige el texto de una entrada existente en
vez de duplicarla.

Ese "se puede reejecutar" era MENTIRA hasta el 03/09/2026. El docstring decía
upsert pero el código hacía un POST plano, sin `on_conflict` y sin
`Prefer: resolution=merge-duplicates`, y la tabla no tiene UNIQUE sobre
(category, question). Resultado: cada ejecución DUPLICABA las seis entradas, y
el asesor podía servir la versión antigua de una respuesta ya corregida.

Ahora el upsert se hace aquí, leyendo primero lo que ya existe: lo que
coincide por (category, question) se PATCHea y solo lo nuevo se inserta. Se
resuelve en el script y no con una migración porque añadir el UNIQUE es DDL, y
en este proyecto las migraciones se pegan a mano en el editor SQL.

    python scripts/sembrar_conocimiento.py
"""
import json
import os
import sys
import urllib.request

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env = {}
for linea in open(os.path.join(RAIZ, ".env.local"), encoding="utf-8"):
    linea = linea.strip()
    if linea and not linea.startswith("#") and "=" in linea:
        k, v = linea.split("=", 1)
        env[k.strip()] = v.strip().strip('"')
URL = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
KEY = env["SUPABASE_SERVICE_ROLE_KEY"]
H = {"apikey": KEY, "Authorization": f"Bearer {KEY}", "Content-Type": "application/json",
     "Prefer": "return=minimal"}

# Copiadas literalmente de FAQ_ITEMS. No tocar el texto sin cambiarlo también
# en la home: si la web dice una cosa y el asesor otra, el cliente se queda con
# la discrepancia y con razón.
ENTRADAS = [
    ("renting_general", "¿Qué incluye la cuota mensual?",
     "Coche nuevo, seguro a todo riesgo, mantenimiento y revisiones en talleres oficiales, "
     "averías, cambio de neumáticos, asistencia en carretera 24 h, impuesto de circulación y "
     "matriculación. Una cuota fija con IVA incluido, sin entrada y sin sorpresas.", 1),
    ("renting_general", "¿Necesito dar una entrada?",
     "No. Todos los coches del catálogo se ofrecen sin entrada inicial. 0 € de desembolso al comenzar.", 2),
    ("renting_general", "¿A cuántos kilómetros al año?",
     "Las cuotas publicadas se calculan sobre 10.000 km al año, y el kilometraje se "
     "adapta a tu uso real. El plazo va de 36 a 60 meses y la cuota cambia según el "
     "que elijas: cada coche tiene su tabla completa.", 3),
    ("proceso", "¿Cuánto tarda la aprobación?",
     "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta.", 1),
    ("proceso", "¿Puedo cancelar antes de tiempo?",
     "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso.", 2),
    ("perfiles", "¿Es solo para particulares?",
     "No. Particulares, autónomos y empresas contratan igual, con el mismo proceso y "
     "las mismas condiciones. Lo único que cambia es la documentación que hay que "
     "aportar, y te acompañamos con ella.", 1),
]


def _existentes():
    """Lo que ya hay en la base, indexado por (category, question)."""
    req = urllib.request.Request(
        f"{URL}/rest/v1/knowledge_entries?select=id,category,question",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    return {(e["category"], e["question"]): e["id"]
            for e in json.load(urllib.request.urlopen(req))}


def main():
    ya = _existentes()
    nuevas, corregidas = [], 0

    for c, q, a, o in ENTRADAS:
        fila = {"category": c, "question": q, "answer": a, "sort_order": o, "is_active": True}
        ident = ya.get((c, q))
        if ident is None:
            nuevas.append(fila)
            continue
        # Ya estaba: se corrige su texto en vez de crear una segunda copia.
        req = urllib.request.Request(
            f"{URL}/rest/v1/knowledge_entries?id=eq.{ident}", method="PATCH",
            headers=H, data=json.dumps(fila).encode())
        urllib.request.urlopen(req)
        corregidas += 1

    if nuevas:
        req = urllib.request.Request(
            f"{URL}/rest/v1/knowledge_entries", method="POST",
            headers=H, data=json.dumps(nuevas).encode())
        urllib.request.urlopen(req)

    print(f"corregidas: {corregidas}   nuevas: {len(nuevas)}")

    ver = urllib.request.Request(
        f"{URL}/rest/v1/knowledge_entries?select=category,question&order=category,sort_order",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    entradas = json.load(urllib.request.urlopen(ver))
    print(f"entradas en la base de conocimientos: {len(entradas)}")
    for e in entradas:
        print(f"  {e['category']:16s} {e['question']}")


if __name__ == "__main__":
    main()

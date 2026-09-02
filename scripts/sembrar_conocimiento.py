# -*- coding: utf-8 -*-
"""Siembra la base de conocimientos del asesor con lo que la web YA responde.

Regla de este fichero: **ni una sola respuesta inventada**. Todas salen
literalmente de FAQ_ITEMS en src/app/(public)/page.tsx, que es texto ya
publicado en movilease.es y por tanto ya aprobado por Adrián. Si el asesor
tiene que responder algo que no esté aquí, la respuesta correcta es decir que
lo consulta con un asesor humano, no improvisar.

Se puede reejecutar: hace upsert por (category, question), así que corrige el
texto de una entrada existente en vez de duplicarla.

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
     "Los precios se calculan para contratos de 36 meses y 10.000 km/año. "
     "Adaptamos el kilometraje a tu uso real.", 3),
    ("proceso", "¿Cuánto tarda la aprobación?",
     "En menos de 48 horas laborables tramitamos tu solicitud y te damos respuesta.", 1),
    ("proceso", "¿Puedo cancelar antes de tiempo?",
     "Cada caso se estudia de forma individual. Contáctanos por WhatsApp y te asesoramos sin compromiso.", 2),
    ("perfiles", "¿Es solo para particulares?",
     "Principalmente sí, aunque también tramitamos renting para autónomos y pequeñas empresas.", 1),
]


def main():
    filas = [{"category": c, "question": q, "answer": a, "sort_order": o, "is_active": True}
             for c, q, a, o in ENTRADAS]

    req = urllib.request.Request(
        f"{URL}/rest/v1/knowledge_entries", method="POST",
        headers=H, data=json.dumps(filas).encode())
    urllib.request.urlopen(req)

    ver = urllib.request.Request(
        f"{URL}/rest/v1/knowledge_entries?select=category,question&order=category,sort_order",
        headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    entradas = json.load(urllib.request.urlopen(ver))
    print(f"entradas en la base de conocimientos: {len(entradas)}")
    for e in entradas:
        print(f"  {e['category']:16s} {e['question']}")


if __name__ == "__main__":
    main()

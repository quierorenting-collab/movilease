# -*- coding: utf-8 -*-
"""Crea las landings de categoria y ciudad en la tabla landing_pages.

La web tenia el mecanismo entero construido —tabla, capa de datos, plantilla
en [slug] con su hero, su rejilla de coches y su FAQ con JSON-LD— y cero filas.
Eran dieciocho paginas indexables sin escribir una linea de codigo.

    python scripts/crear_landings.py

Se puede volver a ejecutar: hace upsert por slug, asi que corrige el texto de
una landing existente en vez de duplicarla.

Regla del contenido: NI UN PRECIO en el texto. Las cuotas salen de la rejilla
de coches, que las lee de la base de datos. Escribirlas en el texto es
garantizar que se queden desfasadas, que es exactamente el agujero que tenia
quierorenting.es: tres juegos de precios distintos en la misma web.
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
     "Prefer": "resolution=merge-duplicates,return=minimal"}

FAQ_COMUN = [
    {"question": "¿Qué incluye la cuota mensual?",
     "answer": "Seguro a todo riesgo, mantenimiento y revisiones, neumáticos, asistencia en carretera 24 h, ITV, impuestos y gestión de multas. Tú solo pones el combustible."},
    {"question": "¿Hay que pagar entrada?",
     "answer": "No. El renting de MoviLease es sin entrada ni pago inicial: empiezas pagando la primera cuota mensual."},
    {"question": "¿Quién puede contratar un renting?",
     "answer": "Particulares, autónomos y empresas. Cuéntanos tu caso y te decimos qué documentación hace falta en cada uno."},
]

CATEGORIAS = [
    ("renting-suv", {"category": "suv"},
     "Renting de SUV sin entrada",
     "Renting de SUV para particulares, autónomos y empresas",
     "Los SUV son la carrocería más pedida en renting: posición de conducción alta, más espacio para la familia y maletero de sobra. Aquí están los que hay disponibles ahora mismo, con la cuota cerrada y todo incluido.",
     "SUV en renting sin entrada, con seguro a todo riesgo, mantenimiento e impuestos incluidos. Disponibilidad real y respuesta en 48 horas.",
     [{"question": "¿Qué SUV hay disponibles?",
       "answer": "Los que ves en esta página son los que tienen disponibilidad confirmada. El catálogo se actualiza con el stock real: si aparece aquí, se puede contratar."}]),
    ("renting-hibrido", {"fuel_type": "hibrido"},
     "Renting de coches híbridos",
     "Renting de coches híbridos, con etiqueta ECO",
     "Un híbrido baja el consumo en ciudad y, con la etiqueta ECO, entra en las zonas de bajas emisiones sin restricciones. Estos son los híbridos disponibles hoy, con la misma cuota cerrada que el resto del catálogo.",
     "Coches híbridos en renting sin entrada, con etiqueta ECO, seguro a todo riesgo y mantenimiento incluidos. Stock real y respuesta en 48 horas.",
     [{"question": "¿Un híbrido tiene etiqueta ECO?",
       "answer": "Los híbridos de este catálogo llevan etiqueta ECO, que permite circular por las zonas de bajas emisiones incluso en episodios de alta contaminación. La etiqueta concreta de cada coche aparece en su ficha."}]),
    ("renting-automatico", {"transmission": "automatico"},
     "Renting de coches automáticos",
     "Renting de coches con cambio automático",
     "El cambio automático se ha vuelto lo normal en ciudad, y en renting no penaliza como al comprar. Estos son los automáticos que tenemos disponibles.",
     "Coches automáticos en renting sin entrada, con seguro, mantenimiento e impuestos incluidos. Disponibilidad real y respuesta en 48 horas.",
     [{"question": "¿El automático sale más caro en renting?",
       "answer": "En renting pagas por el uso, no el precio del coche, así que la diferencia entre manual y automático es mucho menor que en una compra. Compara las cuotas de esta misma página."}]),
    ("renting-furgoneta", {"category": "furgoneta"},
     "Renting de furgonetas",
     "Renting de furgonetas para autónomos y empresas",
     "Para un autónomo o una empresa la furgoneta es una herramienta de trabajo: lo que importa es que esté disponible y que no dé sustos. Con el renting, el mantenimiento, el seguro y las averías van dentro de la cuota.",
     "Furgonetas en renting sin entrada para autónomos y empresas, con seguro a todo riesgo, mantenimiento y averías incluidos.",
     [{"question": "¿Puedo deducir el renting de una furgoneta?",
       "answer": "El tratamiento fiscal depende del uso que le des y de tu situación como autónomo o empresa. Consúltalo con tu gestoría: nosotros te damos la factura con el desglose que necesites."}]),
    ("renting-diesel", {"fuel_type": "diesel"},
     "Renting de coches diésel",
     "Renting de coches diésel para quien hace muchos kilómetros",
     "El diésel sigue teniendo sentido para quien hace muchos kilómetros al año, sobre todo en carretera. Si es tu caso, mira también el kilometraje que contratas: cada ficha tiene su cuota para cada plazo y cada kilometraje.",
     "Coches diésel en renting sin entrada, con seguro a todo riesgo, mantenimiento e impuestos incluidos. Cuotas para cada plazo y kilometraje.",
     [{"question": "¿Cuántos kilómetros al año puedo contratar?",
       "answer": "Cada coche tiene su tabla de cuotas por plazo y kilometraje, desde 10.000 km al año en adelante. Si te pasas hay un precio por kilómetro de exceso, y si te quedas corto se te reembolsa."}]),
    ("renting-barato", None,
     "Renting barato sin entrada",
     "Renting barato: las cuotas más bajas del catálogo",
     "Aquí tienes el catálogo ordenado de la cuota más baja a la más alta. Todas llevan lo mismo dentro: seguro a todo riesgo, mantenimiento, impuestos y asistencia. Sin entrada y sin sorpresas a final de mes.",
     "Renting barato sin entrada, ordenado por cuota. Seguro, mantenimiento, ITV e impuestos incluidos. Disponibilidad real y respuesta en 48 horas.",
     [{"question": "¿Por qué el renting puede salir más barato que comprar?",
       "answer": "Porque en la cuota ya van el seguro a todo riesgo, el mantenimiento, los neumáticos y los impuestos. Si sumas todo eso por tu cuenta, más lo que pierde el coche de valor, la comparación cambia bastante."}]),
]

CIUDADES = [("madrid", "Madrid"), ("barcelona", "Barcelona"), ("valencia", "Valencia"),
            ("sevilla", "Sevilla"), ("zaragoza", "Zaragoza"), ("malaga", "Málaga"),
            ("murcia", "Murcia"), ("palma", "Palma"), ("las-palmas", "Las Palmas"),
            ("bilbao", "Bilbao"), ("alicante", "Alicante"), ("valladolid", "Valladolid")]


def main():
    filas = []
    for slug, filtro, titulo, h1, intro, desc, faq in CATEGORIAS:
        filas.append({"type": "category", "slug": slug, "title": titulo, "h1": h1,
                      "intro_content": intro, "meta_description": desc,
                      "faq": FAQ_COMUN + faq, "filter_json": filtro, "is_active": True})
    for s, nombre in CIUDADES:
        filas.append({
            "type": "city", "slug": f"renting-coches-{s}",
            "title": f"Renting de coches en {nombre}",
            "h1": f"Renting de coches en {nombre}, sin entrada",
            "intro_content": (f"Gestionamos el renting en {nombre} igual que en el resto de España: "
                              "eliges el coche, nos cuentas tu caso y te damos respuesta en menos de "
                              "48 horas laborables. La entrega se coordina donde tú digas."),
            "meta_description": (f"Renting de coches en {nombre} sin entrada, con seguro a todo riesgo, "
                                 "mantenimiento e impuestos incluidos. Respuesta en 48 horas."),
            "faq": FAQ_COMUN + [{"question": f"¿Entregáis el coche en {nombre}?",
                                 "answer": f"Sí. Entregamos en toda España y coordinamos la entrega en {nombre} "
                                           "en la dirección que nos indiques, sin que tengas que desplazarte."}],
            "filter_json": None, "is_active": True})

    req = urllib.request.Request(f"{URL}/rest/v1/landing_pages?on_conflict=slug",
                                 method="POST", headers=H, data=json.dumps(filas).encode())
    urllib.request.urlopen(req)
    print(f"landings creadas o actualizadas: {len(filas)}")

    ver = urllib.request.Request(f"{URL}/rest/v1/landing_pages?select=slug,type,title&order=type,slug",
                                 headers={"apikey": KEY, "Authorization": f"Bearer {KEY}"})
    for l in json.load(urllib.request.urlopen(ver)):
        print(f"  {l['type']:9s} /{l['slug']:26s} {l['title']}")


if __name__ == "__main__":
    main()

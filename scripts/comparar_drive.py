# -*- coding: utf-8 -*-
"""Compara el Drive con lo publicado en las dos webs y canta las diferencias.

El Drive es la lista de stock: lo que no tiene carpeta no se puede entregar, y
lo que está en FUERA DE STOCK hay que quitarlo el mismo día. Comprobarlo a mano
son un par de horas porque hay tres proveedores, subcarpetas por financiera y
dos webs con sistemas distintos. Esto lo deja en dos minutos.

    python scripts/comparar_drive.py

No publica nada ni toca ninguna base de datos: solo mira e informa. Publicar
sigue siendo una decisión con lámina delante.

Lo que SÍ puede comprobar:
  - qué coches están en el Drive y no en la web, y al revés
  - qué coches siguen anunciados estando en FUERA DE STOCK / SIN STOCK
  - qué láminas se han tocado después de la última publicación del coche
  - si movilease.es y quierorenting.es anuncian precios distintos del mismo coche

Lo que NO puede: leer el precio de una lámina. Son imágenes (PNG), así que la
cifra hay que sacarla mirándola. Por eso el informe marca las láminas nuevas o
modificadas: son las que hay que abrir, y solo esas.
"""
import json
import os
import re
import sys
import unicodedata
import urllib.request
from datetime import datetime, timezone

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

RAIZ_DRIVE = os.environ.get("MOVILEASE_DRIVE", r"G:\Unidades compartidas\MoviLease")
PROVEEDORES = ("QUADIS", "M AUTOMOCION", "MOVENTO")
# Carpetas que no son catálogo: datos de clientes, marca, y los dos cajones de bajas.
IGNORAR = {"CLIENTES", "LOGO MOVILEASE", "desktop.ini"}
SIN_STOCK = {"FUERA DE STOCK", "SIN STOCK"}

# Las carpetas del Drive las nombra una persona, así que ni llevan siempre la
# marca ni escriben el modelo como la base de datos. Este mapa es la traducción,
# y es lo único que hay que tocar cuando entra un coche nuevo: una línea.
ALIAS = {
    "AUDI A1": ("Audi", "A1"),
    # Carpetas nuevas del 02/09. "JAECCO" con doble C es una errata de la
    # carpeta, no del coche: sus hermanas son JAECOO 7 y JAECOO 8.
    "JAECCO 5 EXCLUSIVE": ("Jaecoo", "5"),
    "MAZDA 2": ("Mazda", "2"),
    "MAZDA 3": ("Mazda", "3"),
    "SEAT ARONA": ("Seat", "Arona"),
    "CUPRA FORMENTOR": ("Cupra", "Formentor"),
    "EBRO S400": ("Ebro", "S400"),
    "EBRO S700": ("Ebro", "s700"),
    "GLC COUPE": ("Mercedes-Benz", "GLC Coupé"),
    "GLE 300D 4MATIC COUPE ECO": ("Mercedes-Benz", "GLE Coupé"),
    "HONDA CR V": ("Honda", "CR-V"),
    "HYUNDAI KONA": ("Hyundai", "Kona"),
    "HYUNDAI TUCSON 239CV ECO": ("Hyundai", "Tucson"),
    "JAECCO 5": ("Jaecoo", "5"),
    "KIA NIRO": ("Kia", "Niro"),
    "MAZDA CX 30": ("Mazda", "CX-30"),
    "MAZDA CX60": ("Mazda", "CX-60"),
    "MERCEDES CITAN CARGA": ("Mercedes-Benz", "Citan"),
    "MG HS": ("MG", "HS"),
    "MG ZS": ("MG", "ZS"),
    "NISSAN INTERSTAR FURGON L2H2": ("Nissan", "Interstar"),
    "NISSAN JUKE": ("Nissan", "Juke"),
    "NISSAN QASHQAI ARVAL": ("Nissan", "Qashqai"),
    "NISSAN QASHQAI AYVENS": ("Nissan", "Qashqai"),
    "OPEL CORSA": ("Opel", "Corsa"),
    "OPEL CORSA GS": ("Opel", "Corsa"),
    "OPEL MOKKA": ("Opel", "Mokka"),
    "PEUGEOT 208": ("Peugeot", "208"),
    "PEUGEOT BOXER L2H2": ("Peugeot", "Boxer"),
    "POLO": ("Volkswagen", "Polo"),
    "SEAT IBIZA 80CV": ("SEAT", "Ibiza"),
    "SEAT IBIZA 80cv": ("SEAT", "Ibiza"),
    "SEAT IBIZA 95cv": ("SEAT", "Ibiza"),
    "SEAT LEON AUTOMATICO": ("SEAT", "León"),
    "SEAT IBIZA 115CV": ("SEAT", "Ibiza"),
    "SEAT LEON": ("SEAT", "León"),
    "SEAT LEON FR": ("SEAT", "León"),
    "SKODA FABIA": ("Škoda", "Fabia"),
    "TAIGO": ("Volkswagen", "Taigo"),
    "TIGUAN": ("Volkswagen", "Tiguan"),
    "TOYOTA CHR": ("Toyota", "C-HR"),
    "TOYOTA YARIS": ("Toyota", "Yaris"),
    "TOYOTA YARIS CROSS": ("Toyota", "Yaris Cross"),
}


def clave(marca, modelo):
    """Marca y modelo a una clave comparable: sin acentos, sin signos, en minúscula."""
    txt = f"{marca} {modelo}"
    txt = unicodedata.normalize("NFD", txt)
    txt = "".join(c for c in txt if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "-", txt.lower()).strip("-")


def es_hoja(ruta):
    """Una carpeta de coche es la que tiene láminas dentro.

    Antes exigía además NO tener subcarpetas, y eso dejaba fuera a
    MOVENTO/SEAT LEON FR, que tiene sus cuatro láminas propias Y cuatro
    subcarpetas de color a la vez. Sus precios no se miraban nunca: si Adrián
    los cambiaba ahí, nadie se enteraba. Ahora basta con que tenga láminas.

    Las subcarpetas de color (NEGRO, GRIS MAGNETIC, ROJO METALIZADO...) también
    pasan este filtro, y no pasa nada: recorrer_drive() sube por las carpetas
    padre buscando un nombre conocido, así que una carpeta "NEGRO" acaba
    contando como una lámina más de su modelo, no como un coche nuevo. Lo que
    NUNCA se puede hacer es usar el nombre de la carpeta final como clave:
    "GRIS MAGNETIC" existe bajo dos modelos distintos.
    """
    try:
        hijos = os.listdir(ruta)
    except OSError:
        return False
    ficheros = [h for h in hijos if h != "desktop.ini" and os.path.isfile(os.path.join(ruta, h))]
    return bool(ficheros)



def recorrer_drive():
    """Devuelve {clave: info}. Baja por las subcarpetas de financiera sin asumir
    profundidad fija: QUADIS ya está repartido en ALPHABET/ARVAL/AYVENS y el resto
    todavía no, así que la estructura no es la misma en los tres proveedores."""
    coches, desconocidas = {}, []
    for prov in PROVEEDORES:
        base = os.path.join(RAIZ_DRIVE, prov)
        if not os.path.isdir(base):
            continue
        for actual, subdirs, _ in os.walk(base):
            rel = os.path.relpath(actual, base)
            fuera = any(p in SIN_STOCK for p in rel.split(os.sep))
            if os.path.basename(actual) in IGNORAR:
                continue
            if not es_hoja(actual):
                continue
            # Desde el 01/09 algunos modelos cuelgan de una subcarpeta de color
            # ("MG HS/ARTIC BLUE"), asi que si la hoja no se reconoce se prueba con
            # su carpeta padre antes de darla por desconocida. Sin esto, un coche
            # que sigue a la venta aparece como retirado.
            partes = [os.path.basename(actual)] + rel.split(os.sep)[::-1]
            nombre = next((n for n in partes if n in ALIAS), None)
            if nombre is None:
                desconocidas.append(os.path.join(prov, rel))
                continue
            marca, modelo = ALIAS[nombre]
            k = clave(marca, modelo)
            ficheros = [os.path.join(actual, f) for f in os.listdir(actual) if f != "desktop.ini"]
            tocado = max((os.path.getmtime(f) for f in ficheros), default=0)
            info = coches.setdefault(k, {"marca": marca, "modelo": modelo, "carpetas": [],
                                         "fuera_stock": True, "tocado": 0})
            info["carpetas"].append(os.path.join(prov, rel).replace(os.sep, "/"))
            info["tocado"] = max(info["tocado"], tocado)
            # Un coche solo está fuera de stock si TODAS sus carpetas lo están:
            # basta que una financiera lo mantenga para que siga vendiéndose.
            if not fuera:
                info["fuera_stock"] = False
    return coches, desconocidas


def leer_movilease():
    """Catálogo activo de movilease.es, leído de Supabase."""
    env = {}
    ruta = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env.local")
    for linea in open(ruta, encoding="utf-8"):
        linea = linea.strip()
        if linea and not linea.startswith("#") and "=" in linea:
            k, v = linea.split("=", 1)
            env[k.strip()] = v.strip().strip('"')
    url = env["NEXT_PUBLIC_SUPABASE_URL"].rstrip("/")
    key = env["SUPABASE_SERVICE_ROLE_KEY"]

    def get(path):
        req = urllib.request.Request(f"{url}/rest/v1/{path}",
                                     headers={"apikey": key, "Authorization": f"Bearer {key}"})
        return json.load(urllib.request.urlopen(req))

    marcas = {b["id"]: b["name"] for b in get("brands?select=id,name&limit=200")}
    modelos = {m["id"]: m for m in get("models?select=id,name,slug,brand_id&limit=500")}
    salida = {}
    for v in get("vehicles?select=model_id,version,monthly_price_cents,is_active&limit=500"):
        if not v["is_active"]:
            continue
        m = modelos[v["model_id"]]
        k = clave(marcas[m["brand_id"]], m["name"])
        precio = round(v["monthly_price_cents"] / 100)
        d = salida.setdefault(k, {"marca": marcas[m["brand_id"]], "modelo": m["name"],
                                  "slug": m["slug"], "precio": precio, "versiones": 0})
        d["precio"] = min(d["precio"], precio)
        d["versiones"] += 1
    return salida


def leer_quierorenting():
    """Catálogo de quierorenting.es. No hay base de datos ni repositorio: el
    catálogo es un array CARS escrito a mano dentro del index.html, así que se
    lee del propio dominio, que es lo que ve el cliente."""
    try:
        with urllib.request.urlopen("https://quierorenting.es/", timeout=30) as r:
            html = r.read().decode("utf-8", "replace")
    except Exception as e:  # la web puede estar caída; no es motivo para no informar del resto
        print(f"  (no se ha podido leer quierorenting.es: {e})")
        return None
    bloque = re.search(r"const CARS = \[(.*?)\n\];", html, re.S)
    if not bloque:
        print("  (no se ha encontrado el array CARS en quierorenting.es)")
        return None
    salida = {}
    for b, m, p in re.findall(r"\{b:'([^']*)',m:'([^']*)'.*?p:(\d+)", bloque.group(1)):
        k = clave(b, m)
        d = salida.setdefault(k, {"marca": b, "modelo": m, "precio": int(p)})
        d["precio"] = min(d["precio"], int(p))
    return salida


def main():
    drive, desconocidas = recorrer_drive()
    ml = leer_movilease()
    qr = leer_quierorenting()

    en_venta = {k: v for k, v in drive.items() if not v["fuera_stock"]}
    fuera = {k: v for k, v in drive.items() if v["fuera_stock"]}

    print(f"Drive: {len(en_venta)} modelos en stock, {len(fuera)} fuera de stock")
    print(f"movilease.es: {len(ml)} modelos activos")
    print(f"quierorenting.es: {len(qr)} modelos publicados" if qr else "quierorenting.es: sin datos")

    def bloque(titulo, filas, pista=""):
        print(f"\n{'='*72}\n{titulo}  ({len(filas)})")
        if pista and filas:
            print(f"  {pista}")
        for f in sorted(filas):
            print(f"   {f}")

    bloque("ANUNCIADOS ESTANDO FUERA DE STOCK — retirar hoy",
           [f"{v['marca']} {v['modelo']}  (movilease.es a {ml[k]['precio']} €)"
            for k, v in fuera.items() if k in ml],
           "El Drive los ha movido a FUERA DE STOCK / SIN STOCK y siguen a la venta.")

    bloque("EN EL DRIVE Y SIN PUBLICAR EN MOVILEASE — hay que dar de alta",
           [f"{v['marca']} {v['modelo']}  <- {', '.join(v['carpetas'])}"
            for k, v in en_venta.items() if k not in ml],
           "Hay que abrir su lámina para sacar las cuotas.")

    bloque("PUBLICADOS EN MOVILEASE Y SIN CARPETA EN EL DRIVE — revisar",
           [f"{v['marca']} {v['modelo']}  ({v['precio']} €)  /{v['slug']}"
            for k, v in ml.items() if k not in drive])

    if qr is not None:
        bloque("EN MOVILEASE Y NO EN QUIERORENTING",
               [f"{v['marca']} {v['modelo']} ({v['precio']} €)" for k, v in ml.items() if k not in qr])
        bloque("EN QUIERORENTING Y NO EN MOVILEASE",
               [f"{v['marca']} {v['modelo']} ({v['precio']} €)" for k, v in qr.items() if k not in ml])
        bloque("MISMO COCHE CON PRECIO DISTINTO EN CADA WEB",
               [f"{ml[k]['marca']} {ml[k]['modelo']}:  movilease {ml[k]['precio']} €  vs  "
                f"quierorenting {qr[k]['precio']} €"
                for k in ml if k in qr and ml[k]["precio"] != qr[k]["precio"]],
               "Las dos webs se actualizan juntas: esto no debería salir nunca.")

    # Las láminas son imágenes y su precio no se puede leer solo. Lo que sí se
    # puede es avisar de cuáles se han tocado hace poco: son las que merece la
    # pena volver a abrir.
    recientes = sorted(((v["tocado"], k, v) for k, v in en_venta.items()), reverse=True)[:8]
    print(f"\n{'='*72}\nLÁMINAS TOCADAS MÁS RECIENTEMENTE  (abrir estas para comprobar precio)")
    for ts, _, v in recientes:
        cuando = datetime.fromtimestamp(ts, timezone.utc).astimezone().strftime("%d/%m %H:%M")
        print(f"   {cuando}  {v['marca']} {v['modelo']}")

    if desconocidas:
        print(f"\n{'='*72}\nCARPETAS QUE NO SÉ A QUÉ COCHE CORRESPONDEN  ({len(desconocidas)})")
        print("  Añade una línea al mapa ALIAS de este script y volverán a contar.")
        for d in sorted(desconocidas):
            print(f"   {d}")


if __name__ == "__main__":
    main()

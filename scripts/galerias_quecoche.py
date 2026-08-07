# -*- coding: utf-8 -*-
"""Rellena la galería de los coches del catálogo que no tienen lámina en el Drive.

Los 19 de QUADIS y M AUTOMOCION llevan fotos de estudio propias. El resto del
catálogo tenía una sola foto, así que la ficha se veía pobre. Estas salen de
quecochemecompro.com, que es la fuente que ya usábamos.

El emparejado es lo delicado: publicar las fotos de otro coche es peor que no
publicar ninguna. Por eso:

  - Sólo se aceptan fotos de la carpeta del propio modelo en el CDN
    (fotos.quecochemecompro.com/<modelo>/...). Las páginas enlazan además
    coches rivales y de ahí venían casi todos los falsos positivos.
  - El candidato se elige por parecido de slug, y con el combustible como
    desempate: /precios/nissan-juke-hibrido/ y /precios/nissan-juke/ son
    coches distintos.
  - Por debajo del listón de parecido no se toca el coche. Es preferible
    quedarse con la foto suelta que arriesgarse.

    python scripts/galerias_quecoche.py           # sólo informa
    python scripts/galerias_quecoche.py --aplicar # escribe en la base
"""
import re
import sys
import time
import unicodedata
import urllib.request

import requests
from _env import SUPABASE_URL, SERVICE_KEY

H = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}", "Content-Type": "application/json"}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"}
BASE = "https://www.quecochemecompro.com"

MAX_FOTOS = 6
MIN_PARECIDO = 0.72

# Casos que ninguna heurística razonable puede resolver, resueltos a mano
# después de comprobar en la web que las fotos son del coche correcto:
#
#   - KGM se llamaba SsangYong hasta 2023 y quecochemecompro sigue listando
#     Korando, Musso, Rexton y Tívoli con el nombre antiguo. /precios/kgm/ está
#     vacío, así que por marca no había forma de llegar.
#   - El A3 Sportback: el parecido de texto lo dejaba en 0,57 contra "audi-a3"
#     porque el sufijo de carrocería descuadra la comparación, y el candidato
#     mejor puntuado era el A3 Sedán.
#   - El Tunland que se vende aquí es el G7; la ficha nuestra pone sólo
#     "Tunland".
FORZADOS = {
    ("KGM", "Korando"): "ssangyong-korando",
    ("KGM", "Musso"): "ssangyong-musso",
    ("KGM", "Rexton"): "ssangyong-rexton",
    ("KGM", "Tívoli"): "ssangyong-tivoli",
    ("Audi", "A3 Sportback"): "audi-a3",
    ("Foton", "Tunland"): "foton-tunland-g7",
}

# Sufijos que quecochemecompro añade según la mecánica.
SUFIJO_COMBUSTIBLE = {
    "hibrido": "hibrido",
    "phev": "hibrido-enchufable",
    "electrico": "electrico",
}


def slug(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode("ascii").lower()
    return re.sub(r"[^a-z0-9]+", "-", t).strip("-")


_cache = {}


def baja(url):
    if url in _cache:
        return _cache[url]
    try:
        html = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=45).read()
        _cache[url] = html.decode("utf-8", "replace")
    except Exception:
        _cache[url] = ""
    time.sleep(0.35)  # no martillear el sitio ajeno
    return _cache[url]


def parecido(a, b):
    """Dados dos slugs, cuánto se parecen (0..1). Bigramas, sin dependencias."""
    if a == b:
        return 1.0
    pa = {a[i:i + 2] for i in range(len(a) - 1)}
    pb = {b[i:i + 2] for i in range(len(b) - 1)}
    if not pa or not pb:
        return 0.0
    return 2 * len(pa & pb) / (len(pa) + len(pb))


def candidatos(marca_slug):
    """Modelos que quecochemecompro lista para esa marca."""
    html = baja(f"{BASE}/precios/{marca_slug}/")
    return sorted(set(re.findall(r'href="/precios/([a-z0-9-]+)/"', html)))


def numeros(s):
    """Trozos del slug que llevan alguna cifra: 'a3', '2008', 's800', 'cx-5'->'5'."""
    return {t for t in s.split("-") if any(c.isdigit() for c in t)}


def elige(marca, modelo, combustible, lista):
    """El candidato más parecido, con el combustible como desempate."""
    objetivo = slug(f"{marca} {modelo}")
    sufijo = SUFIJO_COMBUSTIBLE.get(combustible)
    # El parecido de bigramas solo no basta para las gamas numeradas: daba 0,88
    # entre "audi-a3-sportback" y "audi-a5-sportback", y 0,93 entre el
    # "MAXUS Deliver 9" y un Deliver 7. Son coches distintos y habrían salido
    # con las fotos del otro. Los trozos con cifra tienen que coincidir
    # exactamente, y así además CX-5 no puede cazar un CX-50.
    cifras_modelo = numeros(slug(modelo))
    mejor, mejor_p = None, 0.0
    for c in lista:
        if numeros(c) != cifras_modelo:
            continue
        p = max(parecido(objetivo, c), parecido(slug(modelo), c))
        # El sufijo de mecánica sólo suma si el nombre ya encaja: si no, un
        # "-hibrido" cualquiera se colaría por delante del modelo correcto.
        if sufijo and c.endswith("-" + sufijo) and p > MIN_PARECIDO * 0.9:
            p += 0.08
        if p > mejor_p:
            mejor, mejor_p = c, p
    return mejor, mejor_p


def fotos_de(modelo_slug):
    html = baja(f"{BASE}/precios/{modelo_slug}/")
    urls = re.findall(
        rf"https://fotos\.quecochemecompro\.com/{re.escape(modelo_slug)}/[A-Za-z0-9\-_.]+\.(?:jpg|jpeg|png|webp)",
        html,
    )
    vistas = []
    for u in urls:
        if u not in vistas:
            vistas.append(u)
    return vistas[:MAX_FOTOS]


def main():
    aplicar = "--aplicar" in sys.argv

    vehiculos = requests.get(
        f"{SUPABASE_URL}/rest/v1/vehicles"
        "?select=id,fuel_type,models(name,brands(name,slug))&is_active=eq.true",
        headers=H,
    ).json()
    con_galeria = {
        i["vehicle_id"]
        for i in requests.get(f"{SUPABASE_URL}/rest/v1/vehicle_images?select=vehicle_id&limit=3000", headers=H).json()
    }
    pendientes = [v for v in vehiculos if v["id"] not in con_galeria]

    por_marca = {}
    hechos, fallos = 0, []

    for v in sorted(pendientes, key=lambda a: (a["models"]["brands"]["name"], a["models"]["name"])):
        marca = v["models"]["brands"]["name"]
        modelo = v["models"]["name"]
        ms = v["models"]["brands"]["slug"] or slug(marca)
        if ms not in por_marca:
            por_marca[ms] = candidatos(ms)

        forzado = FORZADOS.get((marca, modelo))
        elegido, p = (forzado, 1.0) if forzado else elige(marca, modelo, v["fuel_type"], por_marca[ms])
        if not elegido or p < MIN_PARECIDO:
            fallos.append((marca, modelo, elegido, round(p, 2), "no encaja"))
            continue

        fotos = fotos_de(elegido)
        if len(fotos) < 2:
            fallos.append((marca, modelo, elegido, round(p, 2), f"{len(fotos)} fotos"))
            continue

        print(f"  {marca} {modelo:20} -> {elegido:34} {p:.2f}  {len(fotos)} fotos")
        hechos += 1

        if aplicar:
            filas = [
                {
                    "vehicle_id": v["id"],
                    "storage_path": u + "?size=1200x800",
                    "alt_text": f"{marca} {modelo} en renting",
                    "sort_order": i,
                    "is_primary": i == 0,
                }
                for i, u in enumerate(fotos)
            ]
            r = requests.post(
                f"{SUPABASE_URL}/rest/v1/vehicle_images",
                headers={**H, "Prefer": "return=minimal"},
                json=filas,
            )
            if not r.ok:
                raise SystemExit(f"Error insertando {marca} {modelo}: {r.text}")

    print(f"\ncon galeria nueva: {hechos}   sin resolver: {len(fallos)}")
    for f in fallos:
        print(f"   - {f[0]} {f[1]:20} mejor='{f[2]}' {f[3]}  ({f[4]})")
    if not aplicar:
        print("\n(en seco; con --aplicar se escribe en la base)")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Trocea hojas de fotos del Drive que NO encajan en la plantilla regular.

`trocear_hoja_fotos.py` busca calles rectas por brillo y sirve para las hojas
en rejilla. Estas otras son mosaicos por bloques —una foto grande arriba a la
izquierda y bloques de distinto tamaño alrededor—, y ahí ese método no
encuentra las calles y se niega a cortar. Hace bien: mejor no tocar nada que
generar recortes mal hechos.

Aquí los rectángulos se dan a mano, en fracciones del ancho y el alto, para no
depender de la resolución de la hoja. Añadir un coche es añadir su lista.

    python scripts/trocear_mosaico.py mazda-2
    python scripts/trocear_mosaico.py seat-arona
"""
import os
import sys

from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "public", "coches-nuevos")
DRIVE = os.environ.get("MOVILEASE_DRIVE", r"G:\Unidades compartidas\MoviLease")

# Cada entrada: hoja del Drive + los recortes en (x0, y0, x1, y1) como fracción.
# El orden es el de la galería, y el primero es la portada.
MOSAICOS = {
    "mazda-2": {
        "hoja": r"M AUTOMOCION\AYVENS\MAZDA 2\FOTO COCHE BLANCO.png",
        # El gris cuesta 5 EUR/mes mas en TODAS las cuotas (lo dice el nombre
        # del fichero del Drive), asi que la ficha va con el blanco, que es el
        # precio publicado.
        "recortes": [
            (0.000, 0.000, 0.583, 0.505),   # 3/4 delantero — portada
            (0.588, 0.000, 1.000, 0.332),   # 3/4 trasero
            (0.588, 0.337, 1.000, 0.552),   # perfil
            (0.000, 0.512, 0.216, 0.775),   # frontal
            (0.222, 0.512, 0.455, 0.775),   # trasera
            (0.460, 0.512, 0.700, 0.775),   # salpicadero
            (0.705, 0.555, 1.000, 0.775),   # asientos
        ],
    },
    "seat-arona": {
        "hoja": r"MOVENTO\SEAT ARONA\FOTOS COCHE.png",
        # OJO: la foto grande de esta hoja lleva el logo de MoviLease y
        # "SEAT ARONA 1.0 TSI 115 CV" INCRUSTADOS en la imagen. Como portada
        # duplicaria el titular de la ficha y se leeria como una captura, asi
        # que se descarta y la portada pasa a ser el perfil, que esta limpio.
        # Es la unica hoja donde se rompe la norma de "la -01 es el 3/4
        # delantero", y se rompe por esto.
        "recortes": [
            (0.652, 0.348, 1.000, 0.534),   # perfil — portada (limpio)
            (0.000, 0.543, 0.208, 0.762),   # frontal
            (0.652, 0.000, 1.000, 0.330),   # 3/4 trasero
            (0.212, 0.543, 0.423, 0.762),   # trasera
            (0.427, 0.543, 0.695, 0.762),   # salpicadero
            (0.700, 0.543, 1.000, 0.762),   # asientos
        ],
    },
}


def trocear(clave):
    cfg = MOSAICOS[clave]
    origen = os.path.join(DRIVE, cfg["hoja"])
    if not os.path.isfile(origen):
        raise SystemExit(f"No encuentro la hoja: {origen}")

    im = Image.open(origen).convert("RGB")
    W, H = im.size
    os.makedirs(DESTINO, exist_ok=True)

    escritos = []
    for i, (x0, y0, x1, y1) in enumerate(cfg["recortes"], start=1):
        caja = (round(x0 * W), round(y0 * H), round(x1 * W), round(y1 * H))
        trozo = im.crop(caja)
        # Un recorte diminuto casi siempre significa que las fracciones estan
        # mal; antes que publicar una miniatura borrosa, se avisa.
        if trozo.width < 240 or trozo.height < 160:
            raise SystemExit(f"Recorte {i} demasiado pequeno ({trozo.width}x{trozo.height}): revisa las fracciones")
        salida = os.path.join(DESTINO, f"{clave}-0{i}.webp")
        trozo.save(salida, "WEBP", quality=86, method=6)
        escritos.append((f"{clave}-0{i}.webp", trozo.width, trozo.height, os.path.getsize(salida) // 1024))

    print(f"{clave}: hoja {W}x{H}")
    for n, w, h, kb in escritos:
        print(f"  {n:22} {w:4}x{h:<4} {kb:4} KB")
    return escritos


if __name__ == "__main__":
    if len(sys.argv) != 2 or sys.argv[1] not in MOSAICOS:
        raise SystemExit("Uso: python scripts/trocear_mosaico.py <" + "|".join(MOSAICOS) + ">")
    trocear(sys.argv[1])

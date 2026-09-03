# -*- coding: utf-8 -*-
"""Trocea las hojas de contacto del Drive en las fotos sueltas del catálogo.

Las hojas son la mejor fuente de fotos que tenemos: estudio con fondo gris
neutro, matrícula MoviLease y el color real que se contrata. Todas siguen la
misma plantilla — un 3/4 delantero grande, dos vistas a la derecha y cuatro
abajo — pero las medidas no son idénticas de una hoja a otra, así que aquí no
hay coordenadas fijas: se localizan las calles.

    python scripts/trocear_hoja_fotos.py "<hoja.png>" <prefijo>
    python scripts/trocear_hoja_fotos.py --todas        # las del mapa HOJAS

Sale <prefijo>-01..07.webp en public/coches-nuevos/, con la 01 siendo siempre
el 3/4 delantero, que es la que se usa de foto principal.

Por qué no vale slice-photo-sheet.mjs: aquel busca una rejilla regular y esta
plantilla es un mosaico irregular, así que devolvía dos recortes sin sentido.

Dos detalles que costaron encontrar:

  - Las calles son blancas y finas, pero cruzan fotos de interior casi negras,
    así que buscarlas por "columna toda blanca" falla. Se buscan por máximo
    local de brillo dentro de cada banda, que sí aguanta.
  - En la fila de abajo las calles se buscan como tramos claros seguidos y no
    por máximo local: entre dos fotos de interior casi negras el salto de
    brillo no da para un máximo, pero el tramo claro sigue estando.
  - El pie de la hoja es una franja de color plano, pero no se puede detectar
    por color: en el Qashqai el pie es azul y el coche también. Se detecta por
    desviación: una franja plana tiene desviación baja y la mantiene varias
    filas, y una foto no. Subir desde abajo tampoco vale, porque el texto del
    pie rompe la uniformidad; hay que bajar y quedarse con el primer tramo que
    aguanta.

Si una hoja no encaja en la plantilla, se avisa y no se escribe nada: es
preferible quedarse sin fotos que publicar recortes cortados.
"""
import os
import sys

import numpy as np
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DESTINO = os.path.join(RAIZ, "public", "coches-nuevos")
DRIVE = os.environ.get("MOVILEASE_DRIVE", r"G:\Unidades compartidas\MoviLease")

# Hoja del Drive -> prefijo de las fotos. Añadir un coche es una línea.
HOJAS = {
    "kia-niro": r"QUADIS\AYVENS\KIA NIRO\FOTOS KIA NIRO.png",
    "mazda-3": r"M AUTOMOCION\AYVENS\MAZDA 3\FOTOS COCHE.png"  # OJO: mosaico irregular, el troceador se niega; pendiente a mano,
    "mercedes-citan": r"QUADIS\ARVAL\MERCEDES\MERCEDES CITAN CARGA\FOTOS MERCEDES CITAN CARGA.png",
    "nissan-interstar": r"QUADIS\ARVAL\NISSAN INTERSTAR FURGON L2H2\FOTOS NISSAN INSTERSTAR FURGÓN L2H2.png",
    "opel-mokka": r"QUADIS\AYVENS\OPEL MOKKA\FOTOS DEL COCHE.png",
    "peugeot-boxer": r"QUADIS\ARVAL\PEUGEOT BOXER L2H2\FOTOS PEUGEOT BOXER L2H2.png",
    "audi-a1": r"QUADIS\ARVAL\AUDI A1\FOTOS AUDI.png",
    "ebro-s400": r"M AUTOMOCION\EBRO S400\FOTOS EBRO S400.png",
    "honda-crv": r"QUADIS\HONDA CR V\FOTOS HONDA.png",
    "hyundai-tucson": r"M AUTOMOCION\HYUNDAI TUCSON 239CV ECO\FOTOS TUCSON.png",
    "jaecoo-5": r"M AUTOMOCION\JAECCO 5\FOTOS JAECCO 5.png",
    "mercedes-glc-coupe": r"QUADIS\ARVAL\MERCEDES\GLC COUPE\FOTOS GLC.png",
    "mercedes-gle-coupe": r"QUADIS\ARVAL\MERCEDES\GLE 300D 4MATIC COUPE ECO\FOTOS.png",
    "nissan-juke": r"QUADIS\AYVENS\NISSAN JUKE\FOTOS NISSAN JUKE.png",
    "nissan-qashqai": r"QUADIS\AYVENS\NISSAN QASHQAI AYVENS\FOTOS QASHQAI.png",
    "peugeot-208": r"QUADIS\ARVAL\PEUGEOT 208\FOTOS PEUGEOT 208.png",
    "seat-ibiza-115": r"M AUTOMOCION\SEAT IBIZA 115CV\FOTOS SEAT IBIZA.png",
    "seat-ibiza-80": r"M AUTOMOCION\SEAT IBIZA 80CV\FOTOS IBIZA 80CV.png",
    "seat-leon-fr": r"MOVENTO\SEAT LEON FR\FOTOS DEL SEAT LEON FR",
    "skoda-fabia": r"QUADIS\ARVAL\SKODA FABIA\FOTOS FABIA.png",
    "toyota-chr": r"M AUTOMOCION\TOYOTA CHR\FOTOS TOYOTA CHR.png",
    "toyota-yaris": r"M AUTOMOCION\TOYOTA YARIS\FOTOS TOYOTA YARIS.png",
    "toyota-yaris-cross": r"M AUTOMOCION\TOYOTA YARIS CROSS\FOTOS TOYOTA YARIS CROSS.png",
    "vw-polo": r"M AUTOMOCION\POLO\FOTOS POLO.png",
    "vw-taigo": r"M AUTOMOCION\TAIGO\FOTOS TAIGO.png",
    "vw-tiguan": r"M AUTOMOCION\TIGUAN\FOTOS TIGUAN.png",
}


def picos(perfil, desde, hasta, alto=185, margen=10):
    """Calles: máximos locales claros del perfil de brillo.

    La separación con la que se compara no puede ser fija: las calles miden
    entre 6 y 14 px según la hoja, y comparando a ±6 en una calle ancha se
    acaba comparando el blanco consigo mismo, así que no sale ningún máximo.
    Se prueba de estrecha a ancha y se devuelve el primer ancho que encuentra
    algo."""
    for sep in (6, 10, 14, 18):
        out = []
        for i in range(desde + sep, hasta - sep):
            if perfil[i] > alto and perfil[i] >= perfil[i - sep] + margen and perfil[i] >= perfil[i + sep] + margen:
                if not out or i - out[-1] > 20:
                    out.append(i)
        if out:
            return out
    return []


def calles_claras(perfil, largo, minancho=3):
    """Calles como tramos claros seguidos, devolviendo su centro.

    Para la fila de abajo el máximo local no basta: entre dos fotos de
    interior, casi negras, la calle es estrecha y el salto de brillo no llega
    al margen que se le pide. Buscar tramos claros seguidos sí la encuentra.
    Se descartan los de los bordes, que son el marco de la hoja."""
    tramos, actual = [], []
    for i in range(largo):
        if perfil[i] > 200:
            actual.append(i)
        elif actual:
            tramos.append(actual)
            actual = []
    if actual:
        tramos.append(actual)
    return [ (t[0] + t[-1]) // 2 for t in tramos
             if len(t) >= minancho and t[0] > largo * 0.05 and t[-1] < largo * 0.95 ]


def borde_del_pie(gris, alto):
    """Primera fila del pie: donde la desviación se hunde y aguanta cinco filas."""
    desv = gris.std(axis=1)
    for y in range(int(alto * 0.78), alto - 6):
        if desv[y : y + 5].max() < 22:
            return y
    return alto


def trocear(origen, prefijo, escribir=True):
    im = Image.open(origen).convert("RGB")
    gris = np.array(im.convert("L")).astype(float)
    alto, ancho = gris.shape

    corte_h = picos(gris.mean(axis=1), 0, alto)
    corte_h = [y for y in corte_h if alto * 0.5 < y < alto * 0.8]
    calle_sup = picos(gris[: int(alto * 0.65), :].mean(axis=0), 0, ancho)
    calle_sup = [x for x in calle_sup if ancho * 0.5 < x < ancho * 0.85]
    if not corte_h or not calle_sup:
        return None, "no encuentro las calles principales"
    gy, gx = corte_h[0], calle_sup[0]

    der = picos(gris[:gy, gx:].mean(axis=1), 0, gy)
    der = [y for y in der if gy * 0.35 < y < gy * 0.8]
    if not der:
        return None, "no encuentro la calle de la columna derecha"
    gy_der = der[0]

    pie = borde_del_pie(gris, alto)
    # Ninguno de los dos métodos acierta en todas las hojas: el máximo local
    # se pierde entre fotos oscuras y el tramo claro se confunde con un coche
    # blanco sobre fondo claro. Se prueban los dos y vale el que dé las tres.
    perfil_inf = gris[gy + 10 : pie - 10, :].mean(axis=0)
    inf = picos(perfil_inf, 0, ancho)
    if len(inf) != 3:
        inf = calles_claras(perfil_inf, ancho)
    if len(inf) != 3:
        return None, f"esperaba 3 calles abajo y encuentro {len(inf)}"

    m = 4
    cortes = [
        (m, m, gx - m, gy - m),
        (gx + m, m, ancho - m, gy_der - m),
        (gx + m, gy_der + m, ancho - m, gy - m),
        (m, gy + m, inf[0] - m, pie - m),
        (inf[0] + m, gy + m, inf[1] - m, pie - m),
        (inf[1] + m, gy + m, inf[2] - m, pie - m),
        (inf[2] + m, gy + m, ancho - m, pie - m),
    ]
    for x0, y0, x1, y1 in cortes:
        an, al = x1 - x0, y1 - y0
        if an < 200 or al < 150 or not 0.7 < an / al < 3.2:
            return None, f"recorte con medidas raras ({an}x{al})"

    salida = []
    for i, c in enumerate(cortes, 1):
        rec = im.crop(c)
        ruta = os.path.join(DESTINO, f"{prefijo}-{i:02d}.webp")
        if escribir:
            rec.save(ruta, "WEBP", quality=88, method=6)
        salida.append((os.path.basename(ruta), rec.size))
    return salida, None


def main():
    if "--todas" in sys.argv:
        ok = fallos = 0
        for prefijo, rel in sorted(HOJAS.items()):
            origen = os.path.join(DRIVE, rel)
            if not os.path.exists(origen):
                print(f"  -- {prefijo:20s} no está la hoja en el Drive")
                fallos += 1
                continue
            res, error = trocear(origen, prefijo)
            if error:
                print(f"  !! {prefijo:20s} {error}")
                fallos += 1
            else:
                print(f"  ok {prefijo:20s} {res[0][1][0]}x{res[0][1][1]} + {len(res)-1} vistas")
                ok += 1
        print(f"\nhojas troceadas: {ok}   sin tocar: {fallos}")
        return
    if len(sys.argv) != 3:
        raise SystemExit('Uso: python scripts/trocear_hoja_fotos.py "<hoja.png>" <prefijo>   |   --todas')
    res, error = trocear(sys.argv[1], sys.argv[2])
    if error:
        raise SystemExit(f"No se ha tocado nada: {error}")
    for nombre, (an, al) in res:
        print(f"  {nombre}  {an}x{al}")


if __name__ == "__main__":
    main()

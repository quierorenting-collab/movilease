# -*- coding: utf-8 -*-
"""Pone nombres predecibles a las hojas del Drive.

EL PROBLEMA QUE RESUELVE. Cada carpeta de coche del Drive tiene las mismas tres
hojas —precio, equipamiento y fotos— pero cada una se llama distinto: habia 26
formas de escribir "EQUIPAMIENTO", nueve de "FOTOS COCHE", ocho ficheros SIN
EXTENSION y dos con nombre de UUID. Eso obliga a que cualquier script que lea el
Drive lleve una tabla de apodos escrita a mano, y esa tabla se rompe cada vez
que alguien sube una hoja nueva con un nombre inventado. Con nombres fijos, leer
el Drive deja de ser adivinar.

EL CONVENIO, tres nombres y nada mas:

    PRECIO.png         la lamina con la tabla de cuotas
    EQUIPAMIENTO.png   la hoja de equipamiento
    FOTOS.png          la hoja de contacto de fotos

Y matices SOLO cuando la hoja los lleva de verdad, porque son informacion de
negocio que se perderia al normalizar:

    PRECIO SIN IVA.png                              la lamina no lleva IVA
    PRECIO (SOLO EMPRESAS Y AUTONOMOS).png          la oferta esta restringida
    FOTOS BLANCO.png / FOTOS NEGRO.png              hay varios colores
    FOTOS GRIS (+5 EUR MES EN TODAS LAS CUOTAS).png el color cuesta mas

Ese ultimo es el caso que justifica la regla: el nombre del fichero del Mazda 2
es lo UNICO que dice que el gris sube 5 EUR todas las cuotas. Aplastarlo a
"FOTOS GRIS.png" habria borrado un dato de precio.

NADA SE DEDUCE A OJO. Los dos ficheros con nombre de UUID, los ocho sin
extension y las laminas con el IVA sin marcar se abrieron uno a uno antes de
decidir su nombre. Un caso salio al reves de lo que decia su nombre: la del Leon
FR llamada "EQUIPAMIENTO SEAT LEON FR" es en realidad una lamina de PRECIO.

    python scripts/renombrar_drive.py            # solo enseña lo que haria
    python scripts/renombrar_drive.py --aplicar  # lo hace y guarda el mapa
"""
import json
import os
import sys

DRIVE = os.environ.get("MOVILEASE_DRIVE", r"G:\Unidades compartidas\MoviLease")
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MAPA = os.path.join(RAIZ, "scripts", "renombrado_drive.json")

# (ruta relativa del fichero, nombre nuevo). Se listan de una en una a
# proposito: una regla automatica del tipo "todo lo que empiece por FOTOS" se
# habria llevado por delante los matices de color y de IVA.
FICHEROS = [
    # --- M AUTOMOCION / ARVAL ---
    ("M AUTOMOCION/ARVAL/JAECCO 5 EXCLUSIVE/FOTOS JAECCO 5.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/JAECCO 5 EXCLUSIVE/PRECIO (1).png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/JAECOO 7 PHEV BUSINESS/FOTOS COCHE.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/JAECOO 7 PHEV BUSINESS/Precio.png", "PRECIO.png"),
    # Esta carpeta no tenia hoja de equipamiento: el UUID ERA la hoja.
    ("M AUTOMOCION/ARVAL/OMODA 5 HEV BUSINESS/bd183937-143f-4300-9fd4-a1f3fceb8cea.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/OMODA 5 HEV BUSINESS/FOTO COCHE.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/OMODA 7 MATE PREMIUM/EQUIPACION OMODA 7.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/OMODA 7 MATE PREMIUM/FOTOS OMODA 7.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/OMODA 7 MATE PREMIUM/OMODA 7 MATE PREMIUM.png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 115CV/EQUIPAMIENTO SEAT IBIZA 115.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 115CV/FOTOS SEAT IBIZA.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 115CV/SEAT IBIZA 115CV.png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 80CV/EQUIPAMIENTO IBIZA.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 80CV/FOTOS IBIZA 80CV.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/SEAT IBIZA 80CV/SEAT IBIZA.png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA CHR/FOTOS TOYOTA CHR.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA HILUX/FOTOS TOYOTA HILUX.png", "FOTOS.png"),
    # "HYLUX" estaba mal escrito y ademas era la lamina de precio.
    ("M AUTOMOCION/ARVAL/TOYOTA HILUX/TOYOTA HYLUX.png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS CROSS/EQUIPAMIENTO YARIS CROSS.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS CROSS/FOTOS TOYOTA YARIS CROSS.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS CROSS/PRECIO YARIS CROSS.png", "PRECIO.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS/EQUIPAMIENTO TOYOTA YARIS.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS/FOTOS TOYOTA YARIS.png", "FOTOS.png"),
    ("M AUTOMOCION/ARVAL/TOYOTA YARIS/TOYOTA YARIS.png", "PRECIO.png"),

    # --- M AUTOMOCION / AYVENS ---
    # El UUID del Ebro no es una hoja: es una foto de ambiente (atardecer).
    ("M AUTOMOCION/AYVENS/EBRO S400/b266f9a8-07fb-4a4d-9bbd-a592f12c8520.png", "AMBIENTE.png"),
    ("M AUTOMOCION/AYVENS/EBRO S400/FOTOS EBRO S400.png", "FOTOS.png"),
    ("M AUTOMOCION/AYVENS/HYUNDAI TUCSON 239CV ECO/EQUIPAMIENTO TUCSON.png", "EQUIPAMIENTO.png"),
    ("M AUTOMOCION/AYVENS/HYUNDAI TUCSON 239CV ECO/FOTOS TUCSON.png", "FOTOS.png"),
    ("M AUTOMOCION/AYVENS/HYUNDAI TUCSON 239CV ECO/TUCSON 239CV.png", "PRECIO.png"),
    ("M AUTOMOCION/AYVENS/MAZDA 2/FOTO COCHE BLANCO.png", "FOTOS BLANCO.png"),
    # El "+5 EUR" del nombre es el UNICO sitio donde consta ese sobreprecio.
    ("M AUTOMOCION/AYVENS/MAZDA 2/FOTO COCHE GRIS +5\u20ac  MES EN TODAS LAS CUOTAS.png",
     "FOTOS GRIS (+5 EUR MES EN TODAS LAS CUOTAS).png"),
    ("M AUTOMOCION/AYVENS/MAZDA 3/FOTOS COCHE.png", "FOTOS.png"),
    ("M AUTOMOCION/AYVENS/POLO/FOTOS POLO.png", "FOTOS.png"),
    ("M AUTOMOCION/AYVENS/TIGUAN/FOTOS TIGUAN.png", "FOTOS.png"),

    # --- M AUTOMOCION / resto ---
    ("M AUTOMOCION/FUERA DE STOCK/AUDI A1/AUDI A1.png", "PRECIO.png"),
    ("M AUTOMOCION/FUERA DE STOCK/AUDI A1/FOTOS A1.png", "FOTOS.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/T ROC/VOLKSWAGEN T ROC.png", "PRECIO.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/T ROC/BLANCO/FOTOS T-ROC BLANCO.png", "FOTOS.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/T ROC/GRIS LOBO/FOTOS T-ROC GRIS.png", "FOTOS.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/TAIGO/FOTOS TAIGO.png", "FOTOS.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/TIGUAN/FOTOS TIGUAN.png", "FOTOS.png"),
    ("M AUTOMOCION/VOLKSWAGEN FINANCE/TIGUAN/VOLKSWAGEN TIGUAN.png", "PRECIO.png"),

    # --- MOVENTO ---
    ("MOVENTO/ARVAL/SEAT ARONA/FOTOS COCHE.png", "FOTOS.png"),
    ("MOVENTO/MAZDA RENITNG/MAZDA CX 30/FOTO COCHE.png", "FOTOS.png"),
    ("MOVENTO/MAZDA RENITNG/MAZDA CX 30/FOTO PRECIO.png", "PRECIO.png"),
    ("MOVENTO/MAZDA RENITNG/MAZDA CX60/FOTOS COCHE.png", "FOTOS.png"),
    ("MOVENTO/SANTANDER/MG HS/ARTIC BLUE/COLOR.png", "FOTOS.png"),
    ("MOVENTO/SANTANDER/MG HS/WHITE PEARL/FOTOS DEL COCHE.png", "FOTOS.png"),

    # Los cinco de SIN STOCK no tenian extension: son PNG, comprobado por
    # cabecera. Sin extension el visor de Drive no los previsualiza.
    ("MOVENTO/SIN STOCK/AUDI A1/AUDI A1", "PRECIO.png"),
    ("MOVENTO/SIN STOCK/EBRO S400/EBRO S400", "PRECIO.png"),
    ("MOVENTO/SIN STOCK/EBRO S700/EBRO S700", "PRECIO.png"),
    ("MOVENTO/SIN STOCK/HYUNDAI KONA/HYUNDAI KONA", "PRECIO.png"),
    ("MOVENTO/SIN STOCK/SKODA FABIA/FOTOS SKODA FABIA", "FOTOS.png"),

    ("MOVENTO/VOLKWAGUEN FINANCE/CUPRA FORMENTOR/CUPRA FORMENTOR.png", "PRECIO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/CUPRA FORMENTOR/FOTOS CUPRA.png", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT IBIZA 95cv/FOTOS COCHE.png", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON AUTOMATICO/BLANCO Y GRIS/FOTO GRIS +2 EUROS AL MES.png",
     "FOTOS GRIS (+2 EUR MES).png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON AUTOMATICO/BLANCO Y GRIS/FOTO PRECIO.png", "PRECIO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON AUTOMATICO/BLANCO Y GRIS/FOTOS COCHE.png", "FOTOS.png"),

    # SEAT LEON FR. Ojo aqui: el fichero llamado "EQUIPAMIENTO SEAT LEON FR" NO
    # es equipamiento, es una lamina de precio (358 EUR, restringida a empresas
    # y autonomos), distinta de la otra lamina del mismo nivel (359 EUR con
    # tabla). Se abrieron las dos para no dejar dos "PRECIO.png" indistinguibles.
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/SEAT LEON FR", "PRECIO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/EQUIPAMIENTO SEAT LEON FR",
     "PRECIO (SOLO EMPRESAS Y AUTONOMOS).png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/EQUIPAMIENTO VALIDO PARA TODOS LOS COLORES.png",
     "EQUIPAMIENTO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/FOTOS DEL SEAT LEON FR", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/GRIS GRAFENNE/EQUIPAMIENTO VALIDO PARA TODOS LOS COLORES.png", "EQUIPAMIENTO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/GRIS GRAFENNE/FOTOS COCHE.png", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/GRIS MAGNETIC/EQUIPAMIENTO VALIDO PARA TODOS LOS COLORES.png", "EQUIPAMIENTO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/GRIS MAGNETIC/FOTO COCHE.png", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/NEGRO/EQUIPAMIENTO VALIDO PARA TODOS LOS COLORES.png", "EQUIPAMIENTO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/NEGRO/FOTO COCHE.png", "FOTOS.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/ROJO METALIZADO/EQUIPAMIENTO VALIDO PARA TODOS LOS COLORES.png", "EQUIPAMIENTO.png"),
    ("MOVENTO/VOLKWAGUEN FINANCE/SEAT LEON FR/ROJO METALIZADO/FOTO COCHE.png", "FOTOS.png"),

    # --- QUADIS ---
    ("QUADIS/ALPHABET/OPEL CORSA GS/FOTOS CORSA BLANCO.png", "FOTOS BLANCO.png"),
    ("QUADIS/ALPHABET/OPEL CORSA GS/OPEL CORSA CON IVA.png", "PRECIO.png"),
    ("QUADIS/ARVAL/AUDI A1/FOTOS AUDI.png", "FOTOS.png"),
    ("QUADIS/ARVAL/MERCEDES/GLC COUPE/EQUIPAMIENTO GLC.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/MERCEDES/GLC COUPE/FOTOS GLC.png", "FOTOS.png"),
    ("QUADIS/ARVAL/MERCEDES/GLC COUPE/GLC COUPE.png", "PRECIO.png"),
    # La del GLE sin marcar SI lleva IVA: se abrio y pone "21% de IVA incluido".
    ("QUADIS/ARVAL/MERCEDES/GLE 300D 4MATIC COUPE ECO/GLE 300D 4MATIC COUPE ECO.png", "PRECIO.png"),
    ("QUADIS/ARVAL/MERCEDES/GLE 300D 4MATIC COUPE ECO/GLE 300D SIN IVA.png", "PRECIO SIN IVA.png"),
    ("QUADIS/ARVAL/MERCEDES/MERCEDES CITAN CARGA/EQUIPAMIENTO MERCEDES CITAN.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/MERCEDES/MERCEDES CITAN CARGA/FOTOS MERCEDES CITAN CARGA.png", "FOTOS.png"),
    ("QUADIS/ARVAL/MERCEDES/MERCEDES CITAN CARGA/MERCEDES CITAN CARGA.png", "PRECIO.png"),
    ("QUADIS/ARVAL/NISSAN INTERSTAR FURGON L2H2/EQUIPAMIENTO NISSAN INSTERSTAR FURG\u00d3N L2H2.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/NISSAN INTERSTAR FURGON L2H2/FOTOS NISSAN INSTERSTAR FURG\u00d3N L2H2.png", "FOTOS.png"),
    ("QUADIS/ARVAL/NISSAN INTERSTAR FURGON L2H2/NISSAN INSTERSTAR FURG\u00d3N L2H2.png", "PRECIO.png"),
    ("QUADIS/ARVAL/NISSAN QASHQAI ARVAL/FOTO COCHE.png", "FOTOS.png"),
    ("QUADIS/ARVAL/OPEL CORSA/COLOR NEGRO.png", "FOTOS NEGRO.png"),
    ("QUADIS/ARVAL/OPEL CORSA/EQUIPAMIENTO OPEL CORSA.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/OPEL CORSA/GRIS/COLOR GRIS CORSA.png", "FOTOS.png"),
    ("QUADIS/ARVAL/PEUGEOT 208/EQUIPAMIENTO PEUGEOT 208.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/PEUGEOT 208/FOTOS PEUGEOT 208.png", "FOTOS.png"),
    ("QUADIS/ARVAL/PEUGEOT BOXER L2H2/EQUIPAMIENTO PEUGEOT BOXER L2H2.png", "EQUIPAMIENTO.png"),
    ("QUADIS/ARVAL/PEUGEOT BOXER L2H2/FOTOS PEUGEOT BOXER L2H2.png", "FOTOS.png"),
    ("QUADIS/ARVAL/PEUGEOT BOXER L2H2/PEUGEOT BOXER L2H2.png", "PRECIO.png"),
    ("QUADIS/ARVAL/SKODA FABIA/FOTOS FABIA.png", "FOTOS.png"),
    ("QUADIS/ARVAL/SKODA FABIA/SKODA FABIA CON IVA.png", "PRECIO.png"),
    ("QUADIS/ARVAL/SKODA FABIA/SKODA FABIA SIN IVA.png", "PRECIO SIN IVA.png"),
    ("QUADIS/AYVENS/HONDA CR V/EQUIPAMIENTO HONDA.png", "EQUIPAMIENTO.png"),
    ("QUADIS/AYVENS/HONDA CR V/FOTOS HONDA.png", "FOTOS.png"),
    ("QUADIS/AYVENS/HONDA CR V/HONDA CR V.png", "PRECIO.png"),
    ("QUADIS/AYVENS/KIA NIRO/FOTOS KIA NIRO.png", "FOTOS.png"),
    ("QUADIS/AYVENS/KIA NIRO/KIA NIRO PRECIO.png", "PRECIO.png"),
    ("QUADIS/AYVENS/MERCEDES GLA 200D/FOTOS COCHE.png", "FOTOS.png"),
    ("QUADIS/AYVENS/NISSAN JUKE/EQUIPAMIENTO NISSAN JUKE.png", "EQUIPAMIENTO.png"),
    ("QUADIS/AYVENS/NISSAN JUKE/FOTOS NISSAN JUKE.png", "FOTOS.png"),
    ("QUADIS/AYVENS/NISSAN JUKE/NISSAN JUKE 145CV.png", "PRECIO.png"),
    ("QUADIS/AYVENS/NISSAN QASHQAI AYVENS/FOTOS COCHE.png", "FOTOS.png"),
    ("QUADIS/AYVENS/NISSAN QASHQAI AYVENS/NISSAN QASHQAI SIN IVA.png", "PRECIO SIN IVA.png"),
    ("QUADIS/AYVENS/NISSAN QASHQAI AYVENS/PRECIO CON IVA.png", "PRECIO.png"),
    ("QUADIS/AYVENS/OPEL MOKKA/FOTOS DEL COCHE.png", "FOTOS.png"),
    ("QUADIS/FUERA DE STOCK/MG ZS/EQUIPAMIENTO MG ZS.png", "EQUIPAMIENTO.png"),
    ("QUADIS/FUERA DE STOCK/MG ZS/FOTOS DEL MG ZS.png", "FOTOS.png"),
    ("QUADIS/FUERA DE STOCK/MG ZS/MG ZS.png", "PRECIO.png"),
]

# Erratas de carpeta. Van DESPUES de los ficheros: si se renombrase la carpeta
# antes, todas las rutas de arriba dejarian de existir a media ejecucion.
# "VOLKWAGUEN" convivia con el "VOLKSWAGEN" bien escrito de M AUTOMOCION, que es
# justo lo que hace que un script tenga que llevar tabla de apodos.
CARPETAS = [
    ("M AUTOMOCION/ARVAL/JAECCO 5 EXCLUSIVE", "JAECOO 5 EXCLUSIVE"),
    ("MOVENTO/MAZDA RENITNG", "MAZDA RENTING"),
    ("MOVENTO/VOLKWAGUEN FINANCE", "VOLKSWAGEN FINANCE"),
]

# La carpeta LOGO MOVILEASE se queda como esta: no son hojas de coche, y sus
# ficheros pueden estar enlazados desde firmas de correo ya enviadas.


def es_mismo_fichero(a, b):
    """¿a y b son el MISMO fichero visto con otro nombre?

    Pasa con los cambios que solo tocan mayusculas ("Precio.png" ->
    "PRECIO.png"): Windows los considera el mismo nombre, asi que sin esta
    comprobacion el renombrado se descartaria creyendo que hay colision.
    """
    try:
        return os.path.samefile(a, b)
    except OSError:
        return False


def renombrar(origen, destino):
    """Renombra, dando un rodeo cuando solo cambian las mayusculas.

    os.rename directo entre dos formas del mismo nombre no falla pero tampoco
    cambia nada en algunos sistemas: hay que pasar por un nombre intermedio.
    """
    if os.path.exists(destino) and es_mismo_fichero(origen, destino):
        puente = origen + ".renombrando"
        os.rename(origen, puente)
        os.rename(puente, destino)
    else:
        os.rename(origen, destino)


def planificar():
    """Devuelve (movimientos, avisos) sin tocar el disco."""
    movs, avisos = [], []
    for rel, nuevo in FICHEROS:
        origen = os.path.join(DRIVE, rel.replace("/", os.sep))
        destino = os.path.join(os.path.dirname(origen), nuevo)
        if not os.path.isfile(origen):
            if os.path.isfile(destino):
                continue  # ya renombrado en una pasada anterior
            avisos.append(f"NO EXISTE  {rel}")
            continue
        if os.path.exists(destino) and not es_mismo_fichero(origen, destino):
            # Nunca se machaca: dos hojas distintas con el mismo nombre nuevo
            # significa que el convenio se queda corto para esa carpeta.
            avisos.append(f"YA OCUPADO {rel}  ->  {nuevo}")
            continue
        movs.append((origen, destino, rel, nuevo))
    return movs, avisos


def planificar_carpetas():
    movs, avisos = [], []
    for rel, nuevo in CARPETAS:
        origen = os.path.join(DRIVE, rel.replace("/", os.sep))
        destino = os.path.join(os.path.dirname(origen), nuevo)
        if not os.path.isdir(origen):
            if os.path.isdir(destino):
                continue
            avisos.append(f"NO EXISTE  {rel}/")
            continue
        if os.path.exists(destino):
            avisos.append(f"YA OCUPADO {rel}/  ->  {nuevo}/")
            continue
        movs.append((origen, destino, rel, nuevo))
    return movs, avisos


def main():
    aplicar = "--aplicar" in sys.argv
    movs, avisos = planificar()
    cmovs, cavisos = planificar_carpetas()

    for o, d, rel, nuevo in movs:
        print(f"  {rel}\n      -> {nuevo}")
    for o, d, rel, nuevo in cmovs:
        print(f"  CARPETA {rel}/\n      -> {nuevo}/")

    for a in avisos + cavisos:
        print(f"  !! {a}")

    print(f"\n  {len(movs)} ficheros y {len(cmovs)} carpetas por renombrar"
          f"{'' if aplicar else '  (simulacion: añade --aplicar)'}")
    if not aplicar:
        return

    hechos = []
    for o, d, rel, nuevo in movs + cmovs:
        renombrar(o, d)
        hechos.append({"antes": rel, "despues": nuevo})
    with open(MAPA, "w", encoding="utf-8") as f:
        json.dump(hechos, f, ensure_ascii=False, indent=2)
    print(f"  hecho. Mapa reversible en {os.path.relpath(MAPA, RAIZ)}")


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""Genera las fichas JSON de los coches del Drive (QUADIS + M AUTOMOCION).

Los datos salen de las láminas del Drive: cuota, plazo, kilometraje, potencia,
etiqueta, colores y equipamiento. Es la única fuente válida — si la web dice
otra cosa, manda la lámina.

Las cuotas se escriben tal cual vienen en la tabla de la lámina. Donde la
lámina pone 0 € (kilometrajes que ese coche no ofrece) no se escribe fila:
publicar un 0 sería anunciar un renting gratis.

    python scripts/_fichas_drive.py        # escribe scripts/fichas/*.json
"""
import io
import json
import os
import subprocess

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)
FICHAS = os.path.join(AQUI, "fichas")

SERVICIOS = [
    "Seguro a todo riesgo",
    "Mantenimiento y revisiones",
    "Neumáticos incluidos",
    "Asistencia 24h",
    "Averías y reparaciones",
    "ITV e impuestos",
    "Gestión de multas",
    "Entrega a domicilio",
    "Cambio de neumáticos",
]

KM = [10000, 15000, 20000, 25000, 30000]


def cuotas(tabla):
    """tabla = {meses: [precio por cada km de KM]}. None u 0 = no se ofrece."""
    filas = []
    for meses, fila in sorted(tabla.items()):
        for km, eur in zip(KM, fila):
            if not eur:
                continue
            filas.append(
                {"contract_months": meses, "annual_km": km, "monthly_price_cents": round(eur * 100)}
            )
    return filas


# ── Coches nuevos y coches cuya ficha del Drive corrige lo publicado ─────────
NUEVAS = {
    "peugeot-208-allure-100": {
        "prefijo": "peugeot-208",
        "brand": "Peugeot", "model": "208", "version": "Allure Gasolina 100 S&S 6 Vel. MAN",
        "category": "turismo", "fuel_type": "gasolina", "transmission": "manual",
        "horsepower": 100, "consumption_value": 5.2, "consumption_unit": "l/100km",
        "seats": 5, "doors": 5, "environmental_label": "c",
        "colors": ["Blanco", "Negro", "Gris"], "body_type": "Hatchback",
        "badge_text": "Etiqueta C",
        "short_description": "Motor PureTech 100 CV con cambio manual de 6 velocidades",
        "description": (
            "El PureTech de 100 CV es de los motores de gasolina más eficientes de su clase: "
            "5,2 litros a los cien y respuesta de sobra para ciudad y carretera.\n"
            "Interior i-Cockpit con cuadro digital y pantalla táctil de 10 pulgadas, con Apple "
            "CarPlay y Android Auto sin cables.\n"
            "Sin entrada y con seguro, mantenimiento e impuestos dentro de la cuota."
        ),
        "equipment": [
            "Faros LED delanteros", "Luces diurnas LED", "Llantas de aleación de 16\"",
            "Retrovisores eléctricos y calefactables", "Aire acondicionado",
            "Pantalla táctil de 10\"", "Apple CarPlay y Android Auto inalámbricos",
            "Bluetooth y USB", "Cuadro de instrumentos digital", "Mandos en el volante",
            "Frenada automática de emergencia", "Aviso de cambio involuntario de carril",
            "Reconocimiento de señales de tráfico", "Control de crucero con limitador",
            "Sensor de presión de neumáticos", "ESP y asistente de arranque en pendiente",
        ],
        "cuotas": {
            36: [311, 328, 350, 376, 399],
            48: [296, 316, 345, 371, 398],
            60: [296, 316, 345, 371, 398],
        },
        "principal": (60, 10000),
    },
    "nissan-juke-hybrid-145": {
        "prefijo": "nissan-juke",
        "brand": "Nissan", "model": "Juke", "version": "1.6 Hybrid 145CV N-Connecta",
        "category": "hibrido", "fuel_type": "hibrido", "transmission": "automatico",
        "horsepower": 143, "consumption_value": 4.8, "consumption_unit": "l/100km",
        "seats": 5, "doors": 5, "environmental_label": "eco",
        "colors": ["Blanco", "Negro", "Gris"], "body_type": "SUV",
        "badge_text": "Etiqueta ECO",
        "short_description": "Híbrido autorrecargable de 143 CV con cambio automático",
        "description": (
            "Híbrido autorrecargable: no hay que enchufarlo nunca y en ciudad circula en "
            "eléctrico buena parte del tiempo. 4,8 litros a los cien y etiqueta ECO, que "
            "significa aparcar y entrar donde otros no pueden.\n"
            "Pantalla NissanConnect de 12,3 pulgadas y cuadro digital del mismo tamaño, con "
            "CarPlay y Android Auto sin cables.\n"
            "Maletero de 422 litros, de los mayores de su categoría."
        ),
        "equipment": [
            "Pantalla táctil NissanConnect de 12,3\"", "Cuadro de instrumentos digital de 12,3\"",
            "Apple CarPlay y Android Auto inalámbricos", "Cámara de visión trasera",
            "Cargador inalámbrico para smartphone", "Bluetooth y USB",
            "Climatizador automático", "Acceso y arranque sin llave (Intelligent Key)",
            "Retrovisores eléctricos, plegables y calefactables", "Sensor de lluvia",
            "Sensor de luces automáticas", "Cristales traseros oscurecidos",
            "Control de crucero inteligente", "Asistente de mantenimiento de carril",
            "Frenada automática de emergencia con detección de peatones y ciclistas",
            "Reconocimiento de señales de tráfico", "Detector de fatiga del conductor",
            "Sensores de aparcamiento delanteros y traseros",
        ],
        "cuotas": {
            36: [388, 409, 431, 461, 491],
            48: [388, 408, 427, 456, 488],
            60: [386, 404, 421, 451, 480],
        },
        "principal": (60, 10000),
    },
    "mercedes-glc-coupe-200": {
        "prefijo": "mercedes-glc-coupe",
        "brand": "Mercedes-Benz", "model": "GLC Coupé", "version": "200 4MATIC",
        "category": "suv", "fuel_type": "gasolina", "transmission": "automatico",
        "horsepower": 204, "seats": 5, "doors": 5, "environmental_label": "eco",
        "colors": ["Gris Grafito", "Plata Iridio", "Negro Obsidiana"], "body_type": "SUV Coupé",
        "badge_text": "Solo empresas",
        "short_description": "SUV coupé de 204 CV con tracción total 4MATIC y etiqueta ECO",
        "description": (
            "El GLC Coupé es el Mercedes que más se mira por la calle: silueta de coupé sobre "
            "un SUV, tracción total 4MATIC y 204 CV con etiqueta ECO.\n"
            "Dentro, MBUX con Extras Digitales, cámara de 360°, asientos calefactados y "
            "climatización THERMATIC.\n"
            "Disponible solo para empresas y autónomos."
        ),
        "equipment": [
            "Llantas de aleación AMG de 48,3 cm (19\")", "Símil de cuero ARTICO/microfibra",
            "Asientos calefactados delanteros", "Climatización automática THERMATIC",
            "Iluminación de ambiente", "Paquete de confort KEYLESS-GO",
            "MBUX con pantalla multimedia",
            "Integración de smartphone (Apple CarPlay y Android Auto)",
            "Sistema inalámbrico de carga para móviles", "Paquete Premium con Extras Digitales",
            "Paquete de aparcamiento con cámara 360°",
            "Sistema de frenos con discos de mayores dimensiones",
            "Asistente para señales de tráfico", "Control de ángulo muerto",
            "Control de crucero", "Sistema de asistencia a la conducción",
        ],
        "cuotas": {
            48: [1125, 1174, 1233, 1298, 1425],
            60: [1048, 1101, 1169, 1240, 1362],
        },
        "principal": (60, 10000),
        "is_offer": True, "is_featured": True,
    },
    "honda-crv-phev-elegance": {
        "prefijo": "honda-crv",
        "brand": "Honda", "model": "CR-V", "version": "2.0 i-MMD PHEV 4X2 Elegance Tech",
        "category": "suv", "fuel_type": "phev", "transmission": "automatico",
        "horsepower": 184, "seats": 5, "doors": 5, "environmental_label": "0",
        "colors": ["Negro Cristal", "Diamond Dust"], "body_type": "SUV",
        "badge_text": "Etiqueta CERO",
        "short_description": "Híbrido enchufable de 184 CV con etiqueta CERO",
        "description": (
            "Etiqueta CERO: aparcamiento sin límite en zona regulada y entrada a cualquier "
            "zona de bajas emisiones del país, también los días de restricción.\n"
            "184 CV en un híbrido enchufable que se mueve en eléctrico en el día a día y "
            "recurre al gasolina solo cuando hace falta.\n"
            "Honda SENSING de serie —crucero adaptativo, frenada de emergencia, carril— y "
            "el maletero más aprovechable de su clase.\n"
            "Disponible solo para empresas y autónomos."
        ),
        "equipment": [
            "Climatizador automático bizona", "Asientos delanteros calefactables",
            "Volante multifunción en cuero", "Retrovisores exteriores abatibles eléctricamente",
            "Cristales traseros tintados", "Pantalla táctil de 9\"",
            "Cuadro de instrumentos digital de 10,2\"", "Honda CONNECT con navegación",
            "Apple CarPlay y Android Auto inalámbricos", "Cargador inalámbrico",
            "2 puertos USB delanteros y 2 traseros",
            "Honda SENSING: asistente de conducción", "Frenada de emergencia (CMBS)",
            "Control de crucero adaptativo (ACC)",
            "Asistente de mantenimiento de carril (LKAS)",
            "Reconocimiento de señales de tráfico", "Cámara trasera con guías dinámicas",
            "Sensores de aparcamiento delanteros y traseros",
            "Control de estabilidad (VSA)", "Asistente de arranque en pendiente (HSA)",
            "Sistema de 7 airbags (frontales, laterales, de cortina y de rodilla)",
        ],
        "cuotas": {
            36: [540, 574, 606, 640, 674],
            48: [558, 588, 618, 647, 678],
            60: [561, 588, 615, 641, 668],
        },
        "principal": (36, 10000),
        "is_offer": True, "is_featured": True,
    },
    "mg-zs-hybrid-business": {
        "prefijo": "mg-zs",
        "update": "9904f33f-173b-4121-9630-778ffb4004cd",
        "brand": "MG", "model": "ZS", "version": "HEV 1.5T 197CV Automático",
        "category": "hibrido", "fuel_type": "hibrido", "transmission": "automatico",
        "horsepower": 197, "seats": 5, "doors": 5, "environmental_label": "eco",
        "colors": ["Plata"], "body_type": "SUV",
        "badge_text": "Solo empresas",
        "short_description": "Híbrido de 197 CV, acabado Hybrid+ Business, etiqueta ECO",
        "description": (
            "197 CV en un híbrido que no se enchufa y con etiqueta ECO, por menos de lo que "
            "cuesta un compacto de gasolina de la mitad de potencia.\n"
            "El acabado Hybrid+ Business viene lleno de serie: pantalla de 10,1 pulgadas, "
            "cuadro digital, climatizador automático y todos los asistentes.\n"
            "Disponible solo para empresas y autónomos."
        ),
        "equipment": [
            "Climatizador automático", "Volante multifunción en cuero", "Asientos de tela",
            "Ajuste manual de asiento del conductor",
            "Retrovisores exteriores eléctricos y calefactables",
            "Pantalla táctil de 10,1\"", "Cuadro de instrumentos digital de 7\"",
            "Conexión Bluetooth", "Apple CarPlay y Android Auto", "2 puertos USB",
            "Frenado autónomo de emergencia (AEB)",
            "Asistente de mantenimiento y cambio de carril (LKA)", "Control de crucero",
            "Reconocimiento de señales de tráfico", "Cámara de visión trasera",
            "Sensores de aparcamiento traseros", "Control de estabilidad (ESP)",
            "Asistente de arranque en pendiente (HHC)", "6 airbags",
        ],
        # La lámina marca 0 € en 25.000 y 30.000 km: ese coche no se ofrece a
        # esos kilometrajes, así que esas filas no existen.
        "cuotas": {
            48: [373, 402, 434, 0, 0],
            60: [369, 398, 445, 0, 0],
        },
        "principal": (60, 10000),
    },
    "toyota-yaris-120h-active": {
        "prefijo": "toyota-yaris",
        "update": "ff173aaa-1e62-4813-8f24-814c39f4991b",
        "brand": "Toyota", "model": "Yaris", "version": "120H 116CV ACTIVE",
        "category": "hibrido", "fuel_type": "hibrido", "transmission": "automatico",
        "horsepower": 116, "seats": 5, "doors": 5, "environmental_label": "eco",
        "colors": ["Blanco"], "body_type": "Hatchback",
        "badge_text": "Etiqueta ECO",
        "short_description": "Híbrido autorrecargable de 116 CV con cambio automático",
        "description": (
            "El híbrido de Toyota que lleva veinte años puliéndose: no se enchufa, en ciudad "
            "va en eléctrico la mayor parte del trayecto y gasta lo que no está escrito.\n"
            "Etiqueta ECO y cambio automático, así que en atasco se conduce solo.\n"
            "Toyota Safety Sense de serie: frenada con detección de peatones, carril y "
            "reconocimiento de señales."
        ),
        "equipment": [
            "Pantalla táctil de infoentretenimiento",
            "Conectividad Apple CarPlay y Android Auto", "Radio digital DAB+", "4 altavoces",
            "Puerto USB tipo C", "Toyota Safety Sense",
            "Sistema de pre-colisión con detección de peatones",
            "Reconocimiento de señales de tráfico", "Asistente de mantenimiento de carril",
            "Cámara trasera", "Climatizador automático", "Volante multifunción",
            "Asientos cómodos y espaciosos", "Llantas de aleación",
        ],
        "cuotas": {
            48: [346.71, 371.29, 393.82, 431.65, 456.78],
            60: [342.57, 362.31, 400.38, 439.09, 465.75],
            72: [326.64, 0, 0, 0, 0],
        },
        "principal": (72, 10000),
    },
    "toyota-yaris-cross-130h": {
        "prefijo": "toyota-yaris-cross",
        "update": "c6c5fd69-c7ce-45c4-9ce4-a162051f3cfe",
        "brand": "Toyota", "model": "Yaris Cross", "version": "130H e-CVT 5P ACTIVE",
        "category": "hibrido", "fuel_type": "hibrido", "transmission": "automatico",
        "horsepower": 130, "seats": 5, "doors": 5, "environmental_label": "eco",
        "colors": ["Gris Grafito"], "body_type": "SUV",
        "badge_text": "Etiqueta ECO",
        "short_description": "SUV híbrido de 130 CV con cambio automático e-CVT",
        "description": (
            "El Yaris con altura de SUV: se entra y se sale sin agacharse, se ve más carretera "
            "y cabe más detrás, con el mismo híbrido que no hay que enchufar.\n"
            "130 CV y cambio e-CVT, suave y sin tirones.\n"
            "Etiqueta ECO y Toyota Safety Sense de serie."
        ),
        "equipment": [
            "Pantalla multimedia de 26,7 cm (10,5\")", "Pantalla multiinformación TFT de 7\"",
            "Bluetooth manos libres", "Puerto USB tipo C",
            "Sistema de entrada y arranque sin llave (SME)", "Climatizador automático",
            "Toyota Safety Sense", "Sistema pre-colisión con detección de peatones",
            "Asistente de mantenimiento de carril", "Reconocimiento de señales de tráfico",
            "Cámara trasera", "Faros con función \"Follow me home\"",
            "Faros delanteros con apagado automático",
            "Retrovisores plegables automáticamente", "Guías de aparcamiento estáticas",
        ],
        "cuotas": {
            36: [432.91, 462.39, 485.64, 511.76, 553.62],
            48: [420.84, 448.39, 477.22, 517.61, 549.87],
            60: [412.91, 438.26, 479.75, 522.19, 556.39],
        },
        "principal": (60, 10000),
    },
}

# Fichas ya publicadas cuyos precios coinciden con el Drive: sólo se les cambia
# la galería, que pasa de fotos de banco a las láminas del Drive.
SOLO_FOTOS = {
    "audi-a1-adrenalin-30tfsi": ("audi-a1", "Audi A1"),
    "ebro-s400-1.5-dhe-hev-excellence": ("ebro-s400", "Ebro S400"),
    "hyundai-tucson-239cv": ("hyundai-tucson", "Hyundai Tucson"),
    "jaecoo-5-hev-224cv": ("jaecoo-5", "Jaecoo 5"),
    "mercedes-gle-coupe-300d": ("mercedes-gle-coupe", "Mercedes-Benz GLE Coupé"),
    "opel-corsa-gs": ("opel-corsa", "Opel Corsa"),
    "seat-ibiza-115cv": ("seat-ibiza-115", "SEAT Ibiza"),
    "seat-ibiza-80cv": ("seat-ibiza-80", "SEAT Ibiza"),
    "toyota-chr-140cv": ("toyota-chr", "Toyota C-HR"),
    "vw-polo-match-1.0-tsi-95cv": ("vw-polo", "Volkswagen Polo"),
    "vw-taigo-mas-95cv": ("vw-taigo", "Volkswagen Taigo"),
    "vw-tiguan-mas-1.5-etsi-150cv": ("vw-tiguan", "Volkswagen Tiguan"),
}

# El montaje de esta lámina dejó dos vistas en una sola viñeta y no hay calle
# que las separe: se descarta en vez de publicar una foto partida.
DESCARTES = {"seat-ibiza-115": ["seat-ibiza-115-04.webp"]}


def galeria(prefijo, nombre):
    excluir = json.dumps(DESCARTES.get(prefijo, []))
    salida = subprocess.run(
        ["node", "-e",
         "import('./scripts/build-galleries.mjs').then(async m=>"
         f"console.log(JSON.stringify(await m.galeria({json.dumps(prefijo)},"
         f"{json.dumps(nombre)},{excluir}))))"],
        cwd=RAIZ, capture_output=True, text=True, encoding="utf-8",
    )
    if salida.returncode != 0:
        raise SystemExit(f"galeria {prefijo}: {salida.stderr}")
    return json.loads(salida.stdout.strip())


def main():
    escritas = []

    for slug, d in NUEVAS.items():
        filas = cuotas(d["cuotas"])
        meses, km = d["principal"]
        principal = next(
            f for f in filas if f["contract_months"] == meses and f["annual_km"] == km
        )
        ficha = {
            "brand": d["brand"], "model": d["model"], "version": d["version"],
            "category": d["category"], "fuel_type": d["fuel_type"],
            "transmission": d["transmission"],
            "monthly_price_cents": principal["monthly_price_cents"],
            "contract_months": meses, "annual_km": km,
            "horsepower": d.get("horsepower"), "seats": d.get("seats"), "doors": d.get("doors"),
            "environmental_label": d.get("environmental_label"),
            "colors": d.get("colors"), "body_type": d.get("body_type"),
            "badge_text": d.get("badge_text"),
            "short_description": d.get("short_description"),
            "description": d.get("description"),
            "equipment": d.get("equipment", []),
            "included_services": SERVICIOS,
            "images": galeria(d["prefijo"], f'{d["brand"]} {d["model"]}'),
            "pricing": filas,
        }
        if d.get("consumption_value"):
            ficha["consumption_value"] = d["consumption_value"]
            ficha["consumption_unit"] = d["consumption_unit"]
        if d.get("update"):
            ficha = {"update_vehicle_id": d["update"], **ficha}
        if d.get("is_offer"):
            ficha["is_offer"] = True
        if d.get("is_featured"):
            ficha["is_featured"] = True

        destino = os.path.join(FICHAS, slug + ".json")
        io.open(destino, "w", encoding="utf-8").write(
            json.dumps(ficha, ensure_ascii=False, indent=2) + "\n"
        )
        escritas.append((slug, len(ficha["images"]), len(filas)))

    for slug, (prefijo, nombre) in SOLO_FOTOS.items():
        ruta = os.path.join(FICHAS, slug + ".json")
        ficha = json.load(io.open(ruta, encoding="utf-8"))
        ficha["images"] = galeria(prefijo, nombre)
        io.open(ruta, "w", encoding="utf-8").write(
            json.dumps(ficha, ensure_ascii=False, indent=2) + "\n"
        )
        escritas.append((slug, len(ficha["images"]), len(ficha.get("pricing", []))))

    for slug, fotos, precios in escritas:
        print(f"  {slug:36} {fotos} fotos  {precios} cuotas")
    print(f"\n{len(escritas)} fichas escritas")


if __name__ == "__main__":
    main()

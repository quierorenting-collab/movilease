#!/usr/bin/env python3
"""
Siembra la base de datos Supabase de movilease con el catálogo real
de quierorenting.es (80 coches, 28 marcas, 68 modelos).

Uso:
    python scripts/seed_db.py

Requisitos:
    pip install requests
"""

import sys
import requests
from _env import SUPABASE_URL, SERVICE_KEY

BASE_HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


def get(table, params=None):
    r = requests.get(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers=BASE_HEADERS,
        params={"select": "*", **(params or {})}
    )
    r.raise_for_status()
    return r.json()


def upsert(table, rows):
    if not rows:
        return []
    r = requests.post(
        f"{SUPABASE_URL}/rest/v1/{table}",
        headers={**BASE_HEADERS, "Prefer": "return=representation,resolution=ignore-duplicates"},
        json=rows,
    )
    if r.status_code not in (200, 201):
        print(f"  ⚠️  Error en {table}: {r.status_code} {r.text[:300]}")
    return r.json() if r.ok else []


# ─── COMPROBAR SCHEMA ─────────────────────────────────────────────────────────
print("🔍  Comprobando conexión con Supabase…")
try:
    get("brands", {"limit": "1"})
    print("  ✓  Conexión OK\n")
except Exception as e:
    print(f"\n❌  No se puede conectar o el schema no está aplicado.")
    print(f"   Error: {e}")
    print(f"\n   → Abre el SQL Editor en Supabase y aplica:")
    print(f"     supabase/migrations/0001_init.sql")
    print(f"     supabase/migrations/0002_grants.sql")
    sys.exit(1)


# ─── MARCAS ───────────────────────────────────────────────────────────────────
BRANDS = [
    ("Alfa Romeo",  "alfa-romeo"),
    ("Audi",        "audi"),
    ("Citroën",     "citroen"),
    ("Cupra",       "cupra"),
    ("Dacia",       "dacia"),
    ("Ebro",        "ebro"),
    ("Fiat",        "fiat"),
    ("Ford",        "ford"),
    ("Foton",       "foton"),
    ("Hyundai",     "hyundai"),
    ("Jaecoo",      "jaecoo"),
    ("Jeep",        "jeep"),
    ("KGM",         "kgm"),
    ("Kia",         "kia"),
    ("MAXUS",       "maxus"),
    ("MG",          "mg"),
    ("Mazda",       "mazda"),
    ("Mitsubishi",  "mitsubishi"),
    ("Nissan",      "nissan"),
    ("Omoda",       "omoda"),
    ("Opel",        "opel"),
    ("Peugeot",     "peugeot"),
    ("Renault",     "renault"),
    ("SEAT",        "seat"),
    ("Subaru",      "subaru"),
    ("Toyota",      "toyota"),
    ("Volkswagen",  "volkswagen"),
    ("Škoda",       "skoda"),
]

print("📦  Insertando marcas…")
upsert("brands", [{"name": n, "slug": s} for n, s in BRANDS])
brand_by_slug = {b["slug"]: b["id"] for b in get("brands")}
print(f"  ✓  {len(brand_by_slug)} marcas\n")


# ─── MODELOS ──────────────────────────────────────────────────────────────────
MODELS = [
    ("seat",        "Ibiza",         "renting-seat-ibiza"),
    ("opel",        "Corsa",         "renting-opel-corsa"),
    ("volkswagen",  "Polo",          "renting-volkswagen-polo"),
    ("dacia",       "Sandero",       "renting-dacia-sandero"),
    ("renault",     "Captur",        "renting-renault-captur"),
    ("toyota",      "Yaris",         "renting-toyota-yaris"),
    ("volkswagen",  "T-Cross",       "renting-volkswagen-t-cross"),
    ("mazda",       "CX-30",         "renting-mazda-cx-30"),
    ("volkswagen",  "Taigo",         "renting-volkswagen-taigo"),
    ("ford",        "Puma",          "renting-ford-puma"),
    ("kia",         "Stonic",        "renting-kia-stonic"),
    ("opel",        "Combo",         "renting-opel-combo"),
    ("hyundai",     "Tucson",        "renting-hyundai-tucson"),
    ("renault",     "Symbioz",       "renting-renault-symbioz"),
    ("citroen",     "C4",            "renting-citroen-c4"),
    ("kgm",         "Tívoli",        "renting-kgm-tivoli"),
    ("peugeot",     "Partner",       "renting-peugeot-partner"),
    ("ebro",        "S400",          "renting-ebro-s400"),
    ("toyota",      "Yaris Cross",   "renting-toyota-yaris-cross"),
    ("jeep",        "Avenger",       "renting-jeep-avenger"),
    ("skoda",       "Octavia",       "renting-skoda-octavia"),
    ("volkswagen",  "T-Roc",         "renting-volkswagen-t-roc"),
    ("audi",        "A3 Sportback",  "renting-audi-a3-sportback"),
    ("mazda",       "CX-5",          "renting-mazda-cx-5"),
    ("kgm",         "Korando",       "renting-kgm-korando"),
    ("volkswagen",  "Tiguan",        "renting-volkswagen-tiguan"),
    ("alfa-romeo",  "Junior",        "renting-alfa-romeo-junior"),
    ("nissan",      "Qashqai",       "renting-nissan-qashqai"),
    ("renault",     "Austral",       "renting-renault-austral"),
    ("skoda",       "Karoq",         "renting-skoda-karoq"),
    ("skoda",       "Elroq",         "renting-skoda-elroq"),
    ("mazda",       "6e",            "renting-mazda-6e"),
    ("nissan",      "Interstar",     "renting-nissan-interstar"),
    ("fiat",        "Ducato",        "renting-fiat-ducato"),
    ("nissan",      "X-Trail",       "renting-nissan-x-trail"),
    ("foton",       "Tunland",       "renting-foton-tunland"),
    ("renault",     "Rafale",        "renting-renault-rafale"),
    ("renault",     "Espace",        "renting-renault-espace"),
    ("kgm",         "Musso",         "renting-kgm-musso"),
    ("subaru",      "Crosstrek",     "renting-subaru-crosstrek"),
    ("subaru",      "Forester",      "renting-subaru-forester"),
    ("maxus",       "T60 Max",       "renting-maxus-t60-max"),
    ("mitsubishi",  "Outlander",     "renting-mitsubishi-outlander"),
    ("omoda",       "9",             "renting-omoda-9"),
    ("subaru",      "Outback",       "renting-subaru-outback"),
    ("kgm",         "Rexton",        "renting-kgm-rexton"),
    ("seat",        "Arona",         "renting-seat-arona"),
    ("toyota",      "Proace",        "renting-toyota-proace"),
    ("mazda",       "3",             "renting-mazda-3"),
    ("mg",          "ZS",            "renting-mg-zs"),
    ("volkswagen",  "Golf",          "renting-volkswagen-golf"),
    ("ebro",        "s700",          "renting-ebro-s700"),
    ("ebro",        "s800 PHEV",     "renting-ebro-s800-phev"),
    ("maxus",       "Deliver 9",     "renting-maxus-deliver-9"),
    ("opel",        "Combo Cargo",   "renting-opel-combo-cargo"),
    ("peugeot",     "Rifter",        "renting-peugeot-rifter"),
    ("omoda",       "5",             "renting-omoda-5"),
    ("peugeot",     "2008",          "renting-peugeot-2008"),
    ("jaecoo",      "5",             "renting-jaecoo-5"),
    ("peugeot",     "3008",          "renting-peugeot-3008"),
    ("ford",        "Kuga",          "renting-ford-kuga"),
    ("toyota",      "C-HR",          "renting-toyota-c-hr"),
    ("jeep",        "Compass",       "renting-jeep-compass"),
    ("mazda",       "CX-60",         "renting-mazda-cx-60"),
    ("jaecoo",      "7",             "renting-jaecoo-7"),
    ("toyota",      "Hilux",         "renting-toyota-hilux"),
    ("omoda",       "7",             "renting-omoda-7"),
    ("cupra",       "Formentor",     "renting-cupra-formentor"),
]

print("🚗  Insertando modelos…")
models_payload = [
    {"brand_id": brand_by_slug[bs], "name": n, "slug": s}
    for bs, n, s in MODELS
    if bs in brand_by_slug
]
upsert("models", models_payload)
model_by_slug = {m["slug"]: m["id"] for m in get("models")}
print(f"  ✓  {len(model_by_slug)} modelos\n")


# ─── VEHÍCULOS ────────────────────────────────────────────────────────────────
# (model_slug, version, version_slug, category, fuel_type, transmission,
#  price_cents, hp, cons_val, cons_unit, seats, is_featured, is_offer, badge)
VEHICLES = [
    ("renting-seat-ibiza",         "1.0 MPI 70kW 80CV",                       "1-0-mpi-70kw-80cv",                   "turismo",   "gasolina", "manual",    26400,  80,  5.5,  "l/100km",   5, False, False, None),
    ("renting-opel-corsa",         "1.2T 100cv GS-Line AT",                   "1-2t-100cv-gs-line-at",               "turismo",   "gasolina", "automatico",34500, 100,  5.5,  "l/100km",   5, False, False, None),
    ("renting-volkswagen-polo",    "MATCH 1.0 TSI 95CV",                      "match-1-0-tsi-95cv",                  "turismo",   "gasolina", "manual",    30700,  95,  5.1,  "l/100km",   5, True,  False, None),
    ("renting-volkswagen-polo",    "Style 1.0 TSI 95CV DSG",                  "style-1-0-tsi-95cv-dsg",              "turismo",   "gasolina", "automatico",30700,  95,  5.3,  "l/100km",   5, False, False, None),
    ("renting-dacia-sandero",      "TCe 90 Comfort",                          "tce-90-comfort",                      "turismo",   "gasolina", "manual",    32000,  90,  5.5,  "l/100km",   5, False, False, None),
    ("renting-renault-captur",     "TCe 90 Equilibre",                        "tce-90-equilibre",                    "suv",       "gasolina", "manual",    31300,  90,  5.8,  "l/100km",   5, False, False, None),
    ("renting-renault-captur",     "E-Tech Full Hybrid Techno 160CV",         "e-tech-full-hybrid-techno-160cv",     "hibrido",   "hibrido",  "automatico",40900, 160,  4.4,  "l/100km",   5, False, True,  "Híbrido"),
    ("renting-toyota-yaris",       "120H 116CV ACTIVE",                       "120h-116cv-active",                   "hibrido",   "hibrido",  "automatico",34300, 116,  3.9,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-volkswagen-t-cross", "1.0 TSI 81kW",                            "1-0-tsi-81kw",                        "suv",       "gasolina", "automatico",42000, 110,  5.4,  "l/100km",   5, False, False, "SUV"),
    ("renting-mazda-cx-30",        "e-SKYACTIV G MHEV 140CV MT",              "e-skyactiv-g-mhev-140cv-mt",          "hibrido",   "hibrido",  "manual",    35000, 140,  5.2,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-volkswagen-taigo",   "1.0 TSI 70kW 95CV",                       "1-0-tsi-70kw-95cv",                   "suv",       "gasolina", "manual",    35100,  95,  5.4,  "l/100km",   5, False, False, "SUV"),
    ("renting-volkswagen-taigo",   "TSI 116CV DSG",                           "tsi-116cv-dsg",                       "suv",       "gasolina", "automatico",35600, 116,  5.3,  "l/100km",   5, True,  False, "SUV"),
    ("renting-ford-puma",          "Trend 1.0 Ecoboost Mhev 95CV",            "trend-1-0-ecoboost-mhev-95cv",        "hibrido",   "hibrido",  "manual",    39900,  95,  5.0,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-ford-puma",          "ST Line 1.0 Ecoboost Mhev 125CV",         "st-line-1-0-ecoboost-mhev-125cv",     "hibrido",   "hibrido",  "manual",    39900, 125,  5.3,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-kia-stonic",         "Concept 1.0 T-GDI MHEV 85kW",            "concept-1-0-t-gdi-mhev-85kw",         "suv",       "hibrido",  "manual",    34000, 115,  5.3,  "l/100km",   5, False, True,  "SUV"),
    ("renting-opel-combo",         "L 650Kg 1.5 S&S MT",                      "l-650kg-1-5-s-s-mt",                  "furgoneta", "diesel",   "manual",    33900, 100,  5.6,  "l/100km",   6, False, False, None),
    ("renting-hyundai-tucson",     "1.6 TGDi Essential 150CV",                "1-6-tgdi-essential-150cv",            "suv",       "gasolina", "manual",    36600, 150,  7.5,  "l/100km",   5, False, True,  "SUV"),
    ("renting-hyundai-tucson",     "1.6 TGDi Klass 150CV",                   "1-6-tgdi-klass-150cv",                "suv",       "gasolina", "manual",    36600, 150,  7.5,  "l/100km",   5, False, False, "SUV"),
    ("renting-hyundai-tucson",     "1.6 HEV AT Klass 239CV",                 "1-6-hev-at-klass-239cv",              "hibrido",   "hibrido",  "automatico",53000, 239,  5.6,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-renault-symbioz",    "E-Tech Full Hybrid 145CV Techno",         "e-tech-full-hybrid-145cv-techno",     "hibrido",   "hibrido",  "automatico",40600, 145,  4.6,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-renault-symbioz",    "Evolution MHEV 103kW",                    "evolution-mhev-103kw",                "hibrido",   "hibrido",  "automatico",40600, 140,  5.6,  "l/100km",   5, True,  False, "Híbrido"),
    ("renting-citroen-c4",         "PureTech 130 S&S EAT8 Max",               "puretech-130-s-s-eat8-max",           "suv",       "gasolina", "automatico",37200, 130,  6.2,  "l/100km",   5, False, False, None),
    ("renting-citroen-c4",         "Hybrid 145 ë-DCS6 Max",                  "hybrid-145-e-dcs6-max",               "hibrido",   "hibrido",  "automatico",40900, 145,  4.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-citroen-c4",         "1.2 Hybrid MHEV 145 Business",           "1-2-hybrid-mhev-145-business",        "hibrido",   "hibrido",  "automatico",37200, 145,  5.5,  "l/100km",   5, True,  True,  "EXCLUSIVO"),
    ("renting-kgm-tivoli",         "G15 Urban Plus 4x2",                      "g15-urban-plus-4x2",                  "suv",       "gasolina", "manual",    41000, 135,  7.0,  "l/100km",   5, False, False, None),
    ("renting-peugeot-partner",    "1.5 BlueHDi S&S Standard",                "1-5-bluehdi-s-s-standard",            "furgoneta", "diesel",   "manual",    42900, 100,  5.6,  "l/100km",   6, False, False, None),
    ("renting-ebro-s400",          "1.5 DHE HEV Excellence CVT",              "1-5-dhe-hev-excellence-cvt",          "hibrido",   "hibrido",  "automatico",43000, 211,  5.3,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-toyota-yaris-cross", "130H e-CVT 5P ACTIVE",                    "130h-e-cvt-5p-active",                "hibrido",   "hibrido",  "automatico",43100, 130,  4.2,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-jeep-avenger",       "1.2 Altitude 74kW 100CV",                 "1-2-altitude-74kw-100cv",             "suv",       "gasolina", "manual",    43900, 100,  5.8,  "l/100km",   5, False, False, None),
    ("renting-skoda-octavia",      "2.0 TDI 110kW Limo Selection",            "2-0-tdi-110kw-limo-selection",        "turismo",   "diesel",   "automatico",42600, 150,  5.4,  "l/100km",   5, False, False, "Diesel"),
    ("renting-volkswagen-t-roc",   "1.5 eTSI 85kW 116CV DSG",                "1-5-etsi-85kw-116cv-dsg",             "hibrido",   "hibrido",  "automatico",42800, 116,  5.7,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-audi-a3-sportback",  "TFSI S tronic",                           "tfsi-s-tronic",                       "turismo",   "gasolina", "automatico",45900, 116,  5.5,  "l/100km",   5, False, False, None),
    ("renting-mazda-cx-5",         "2.5 e-SKYACTIV-G MHEV Centre-line",      "2-5-e-skyactiv-g-mhev-centre-line",  "hibrido",   "hibrido",  "automatico",49500, 141,  7.5,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-mazda-cx-5",         "2.5t e-SkyActiv-G MHEV Homura",          "2-5t-e-skyactiv-g-mhev-homura",      "hibrido",   "hibrido",  "automatico",49500, 194,  6.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-kgm-korando",        "G15 4x2 Urban Plus 109kW",                "g15-4x2-urban-plus-109kw",            "suv",       "gasolina", "manual",    47500, 128,  7.5,  "l/100km",   5, False, False, None),
    ("renting-volkswagen-tiguan",  "MÁS 1.5 eTSI 150CV DSG",                 "mas-1-5-etsi-150cv-dsg",              "hibrido",   "hibrido",  "automatico",48300, 150,  6.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-volkswagen-tiguan",  "1.5 eTSI 130CV DSG",                     "1-5-etsi-130cv-dsg",                  "hibrido",   "hibrido",  "automatico",48300, 130,  6.6,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-alfa-romeo-junior",  "Ibrida 1.2 Core 145cv eDCT6",            "ibrida-1-2-core-145cv-edct6",         "hibrido",   "hibrido",  "automatico",48500, 145,  4.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-nissan-qashqai",     "Acenta e-Power 190cv",                    "acenta-e-power-190cv",                "hibrido",   "hibrido",  "automatico",49500, 190,  4.4,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-renault-austral",    "Techno Mild Hybrid 160cv",                "techno-mild-hybrid-160cv",            "hibrido",   "hibrido",  "automatico",49900, 150,  6.4,  "l/100km",   5, True,  False, "Híbrido"),
    ("renting-skoda-karoq",        "2.0 TDI DSG",                             "2-0-tdi-dsg",                         "suv",       "diesel",   "automatico",49900, 150,  5.4,  "l/100km",   5, False, False, "Diesel"),
    ("renting-skoda-elroq",        "82kWh Batterie 210KW",                    "82kwh-batterie-210kw",                "hibrido",   "electrico","automatico",53800, 286, 15.2,  "kwh/100km", 5, False, False, "EV"),
    ("renting-mazda-6e",           "RW Takumi 245kW Gran Autonomía",          "rw-takumi-245kw-gran-autonomia",      "hibrido",   "electrico","automatico",58200, 250, 16.6,  "kwh/100km", 5, False, False, "EV"),
    ("renting-nissan-interstar",   "L2H2 2.3D 135CV",                         "l2h2-2-3d-135cv",                     "furgoneta", "diesel",   "manual",    54600, 135,  8.2,  "l/100km",   3, False, False, None),
    ("renting-fiat-ducato",        "35 L2H2 Bluehdi",                         "35-l2h2-bluehdi",                     "furgoneta", "diesel",   "manual",    49900, 140,  6.3,  "l/100km",   3, False, False, None),
    ("renting-nissan-x-trail",     "MY25 1.5 E-Power 204CV Acenta",           "my25-1-5-e-power-204cv-acenta",       "hibrido",   "hibrido",  "automatico",56500, 204,  5.7,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-foton-tunland",      "2.4D 4WD AT",                             "2-4d-4wd-at",                         "4x4",       "diesel",   "automatico",59900, 162,  8.5,  "l/100km",   5, False, False, None),
    ("renting-renault-rafale",     "Techno E-Tech Full Hybrid 200CV",         "techno-e-tech-full-hybrid-200cv",     "hibrido",   "hibrido",  "automatico",58900, 200,  4.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-renault-espace",     "Techno E-Tech Full Hybrid 200CV",         "techno-e-tech-full-hybrid-200cv-e",   "hibrido",   "hibrido",  "automatico",59000, 200,  4.9,  "l/100km",   7, False, False, "Híbrido"),
    ("renting-kgm-musso",          "Sports D22 DTR 4X4 PRO",                  "sports-d22-dtr-4x4-pro",              "4x4",       "diesel",   "manual",    49500, 202,  8.7,  "l/100km",   5, False, False, None),
    ("renting-subaru-crosstrek",   "2.0i Hybrid Field CVT",                   "2-0i-hybrid-field-cvt",               "hibrido",   "hibrido",  "automatico",62500, 145,  7.7,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-subaru-forester",    "2.0i Hybrid Field CVT",                   "2-0i-hybrid-field-cvt-f",             "hibrido",   "hibrido",  "automatico",71900, 152,  8.1,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-maxus-t60-max",      "2.0D 4WD AT",                             "2-0d-4wd-at",                         "4x4",       "diesel",   "automatico",70500, 215,  9.1,  "l/100km",   5, False, False, None),
    ("renting-mitsubishi-outlander","PHEV Híbrido Enchufable 4WD",            "phev-hibrido-enchufable-4wd",         "hibrido",   "phev",     "automatico",69900, 306,  2.6,  "l/100km",   5, False, False, "PHEV"),
    ("renting-omoda-9",            "Híbrido 1.5 TGDI Premium",                "hibrido-1-5-tgdi-premium",            "hibrido",   "hibrido",  "automatico",77900, 195,  6.5,  "l/100km",   7, False, False, "Híbrido"),
    ("renting-subaru-outback",     "2.5 Touring Lineatronic",                 "2-5-touring-lineatronic",             "suv",       "gasolina", "automatico",79900, 169,  8.6,  "l/100km",   5, False, False, None),
    ("renting-kgm-rexton",         "D22 DTR Pro 4x4",                         "d22-dtr-pro-4x4",                     "suv",       "diesel",   "automatico",82900, 202,  8.4,  "l/100km",   7, False, False, "Diesel"),
    ("renting-seat-arona",         "1.0 TSI St&Sp Style Plus",                "1-0-tsi-st-sp-style-plus",            "turismo",   "gasolina", "manual",    28900, 110,  5.3,  "l/100km",   5, False, False, None),
    ("renting-toyota-proace",      "CITY VAN 50kWh EV L1 GX",                 "city-van-50kwh-ev-l1-gx",             "hibrido",   "electrico","automatico",34600, 136, 17.3,  "kwh/100km", 3, False, False, "EV"),
    ("renting-mazda-3",            "2.5 e-Skyactiv-G Centre-line",            "2-5-e-skyactiv-g-centre-line",        "hibrido",   "hibrido",  "manual",    42400, 186,  6.4,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-mg-zs",              "1.5 Hybrid",                              "1-5-hybrid",                          "hibrido",   "hibrido",  "automatico",45100, 196,  5.4,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-mg-zs",              "HEV 1.5T 197CV Automático",               "hev-1-5t-197cv-automatico",           "hibrido",   "hibrido",  "automatico",36900, 197,  6.5,  "l/100km",   5, True,  True,  "ECO · Oferta"),
    ("renting-volkswagen-golf",    "Match EHYBRID",                           "match-ehybrid",                       "hibrido",   "hibrido",  "automatico",49300, 204,  1.0,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-ebro-s700",          "1.6 TGDI Luxury 7 DCT",                  "1-6-tgdi-luxury-7-dct",               "suv",       "gasolina", "automatico",49900, 197,  8.0,  "l/100km",   5, False, False, None),
    ("renting-ebro-s800-phev",     "1.5 TGDI 1DHT 2WD [2025] - Luxury7",    "1-5-tgdi-1dht-2wd-2025-luxury7",     "hibrido",   "phev",     "automatico",58300, 245,  1.5,  "l/100km",   5, False, False, "PHEV"),
    ("renting-maxus-deliver-9",    "Maxus Deliver 9 2.0D L3H2 150",          "maxus-deliver-9-2-0d-l3h2-150",      "diesel",    "diesel",   "manual",    64900, 150,  9.0,  "l/100km",   3, False, False, "Diesel"),
    ("renting-opel-combo-cargo",   "L 650Kg 1.5 S&S MT E6",                  "l-650kg-1-5-s-s-mt-e6",              "diesel",    "diesel",   "manual",    33900, 100,  5.6,  "l/100km",   6, False, False, "Diesel"),
    ("renting-peugeot-rifter",     "Active Business Standard BHDI 100",       "active-business-standard-bhdi-100",  "diesel",    "diesel",   "manual",    34500, 100,  5.4,  "l/100km",   3, False, False, "Diesel"),
    ("renting-omoda-5",            "HEV Business 1.5 TGDI 224CV",             "hev-business-1-5-tgdi-224cv",        "hibrido",   "hibrido",  "automatico",41100, 224,  5.4,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-peugeot-2008",       "Allure Hybrid 110 eDCS6",                 "allure-hybrid-110-edcs6",             "hibrido",   "hibrido",  "automatico",43200, 110,  5.0,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-jaecoo-5",           "HEV 1.5 TGDI 224CV BUSINESS",            "hev-1-5-tgdi-224cv-business",        "hibrido",   "hibrido",  "automatico",44700, 224,  5.4,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-peugeot-3008",       "1.2 Allure EDCS6",                        "1-2-allure-edcs6",                    "hibrido",   "hibrido",  "automatico",44900, 130,  5.8,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-ford-kuga",          "Titanium 1.5 EcoBoost 4x2 110KW",         "titanium-1-5-ecoboost-4x2-110kw",    "hibrido",   "hibrido",  "manual",    45900, 150,  6.5,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-toyota-c-hr",        "1.8 ADVANCE HYBRID 140 e-CVT",            "1-8-advance-hybrid-140-e-cvt",        "hibrido",   "hibrido",  "automatico",46900, 140,  4.3,  "l/100km",   5, False, False, "Híbrido"),
    ("renting-jeep-compass",       "1.2 MHEV Altitude 110",                   "1-2-mhev-altitude-110",               "hibrido",   "hibrido",  "automatico",49500, 110,  6.3,  "l/100km",   5, False, True,  "Híbrido"),
    ("renting-mazda-cx-60",        "e-SKYACTIV D MHEV 8AT EXCLUSIVE-LINE",    "e-skyactiv-d-mhev-8at-exclusive-line","hibrido",   "hibrido",  "automatico",51800, 200,  5.3,  "l/100km",   5, False, True,  "Híbrido"),
    ("renting-jaecoo-7",           "PHEV 1.5 TGDI 279CV BUSINESS",            "phev-1-5-tgdi-279cv-business",        "hibrido",   "phev",     "automatico",53100, 279,  1.5,  "l/100km",   5, False, False, "PHEV"),
    ("renting-toyota-hilux",       "MY25 GX 2.4B 150 CV 6AT 4X4",             "my25-gx-2-4b-150-cv-6at-4x4",        "diesel",    "diesel",   "automatico",63500, 150,  8.5,  "l/100km",   5, False, False, "Diesel"),
    ("renting-omoda-7",            "PHEV 1.5T 279CV PREMIUM",                 "phev-1-5t-279cv-premium",             "hibrido",   "phev",     "automatico",67900, 279,  1.5,  "l/100km",   5, False, False, "PHEV"),
    ("renting-cupra-formentor",    "1.5 eTSI 150CV DSG",                      "1-5-etsi-150cv-dsg",                  "turismo",   "gasolina", "automatico",43000, 150,  6.7,  "l/100km",   5, False, False, None),
]

INCLUDED_SERVICES = [
    "Seguro a todo riesgo",
    "Mantenimiento incluido",
    "Asistencia en carretera 24h",
    "Impuesto de circulación",
    "Cambio de neumáticos",
]

print("🚘  Insertando vehículos…")
vehicles_payload = []
for row in VEHICLES:
    ms, version, vs, cat, ft, trans, price, hp, cv, cu, seats, feat, offer, badge = row
    if ms not in model_by_slug:
        print(f"  ⚠️  Modelo no encontrado: {ms}")
        continue
    vehicles_payload.append({
        "model_id":            model_by_slug[ms],
        "version":             version,
        "version_slug":        vs,
        "category":            cat,
        "fuel_type":           ft,
        "transmission":        trans,
        "monthly_price_cents": price,
        "horsepower":          hp,
        "consumption_value":   cv,
        "consumption_unit":    cu,
        "seats":               seats,
        "is_featured":         feat,
        "is_offer":            offer,
        "badge_text":          badge,
        "included_services":   INCLUDED_SERVICES,
        "contract_months":     36,
        "annual_km":           15000,
        "stock_status":        "available",
    })

upsert("vehicles", vehicles_payload)
print(f"  ✓  {len(vehicles_payload)} vehículos\n")

# ─── RESUMEN ──────────────────────────────────────────────────────────────────
brands_count   = len(get("brands"))
models_count   = len(get("models"))
vehicles_count = len(get("vehicles"))

print("━" * 50)
print(f"✅  Base de datos cargada:")
print(f"   Marcas:    {brands_count}")
print(f"   Modelos:   {models_count}")
print(f"   Vehículos: {vehicles_count}")
print()
print("📸  Siguiente paso — imágenes:")
print("   Las fotos están en quiero-renting/fotos/*.jpg")
print("   Hay que subirlas a Supabase Storage (bucket 'vehicle-images')")
print("   y luego actualizar main_image_url en cada vehicle.")
print()
print("   Puedes hacerlo ejecutando:")
print("   python scripts/upload_images.py")

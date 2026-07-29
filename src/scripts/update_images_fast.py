"""
Actualiza imágenes de vehículos: reemplaza todo lo que no sea de
fotos.quecochemecompro.com con URLs de esa CDN.

IMPORTANTE: sesión separada para scraping (con User-Agent de browser)
y sesión limpia para Supabase (sin headers de browser que activan
el bloqueo de la service key).
"""
import requests, unicodedata, re
from _env import SUPABASE_URL, SERVICE_KEY, ANON_KEY

FOTO_BASE    = "https://fotos.quecochemecompro.com"
QCMC_BASE    = "https://quecochemecompro.com/precios"

HDR_R = {"apikey": ANON_KEY,    "Authorization": f"Bearer {ANON_KEY}"}
HDR_W = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
          "Content-Type": "application/json", "Prefer": "return=minimal"}

# Sesión para Supabase (sin User-Agent de browser)
DB = requests.Session()

# Sesión para scraping (con UA de browser para evitar 403)
WEB = requests.Session()
WEB.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})

def normalize(s):
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return s.lower().strip()

SLUG = {
    "audi a3":                  "audi-a3",
    "audi a3 sportback":        "audi-a3",
    "alfa romeo junior":        "alfa-romeo-junior",
    "citroen c4":               "citroen-c4",
    "cupra formentor":          "cupra-formentor",
    "dacia sandero":            "dacia-sandero",
    "fiat ducato":              "fiat-ducato",
    "ford kuga":                "ford-kuga",
    "ford puma":                "ford-puma",
    "hyundai tucson":           "hyundai-tucson",
    "jeep avenger":             "jeep-avenger",
    "jeep compass":             "jeep-compass",
    "kia stonic":               "kia-stonic",
    "maxus t60":                "maxus-t60",
    "maxus t60 max":            "maxus-t60",
    "mazda 3":                  "mazda-3",
    "mazda cx-5":               "mazda-cx-5",
    "mazda cx-30":              "mazda-cx-30",
    "mazda cx-60":              "mazda-cx-60",
    "mg zs":                    "mg-zs",
    "mitsubishi outlander":     "mitsubishi-outlander",
    "nissan qashqai":           "nissan-qashqai",
    "nissan x-trail":           "nissan-x-trail",
    "opel combo":               "opel-combo",
    "opel combo cargo":         "opel-combo",
    "opel corsa":               "opel-corsa",
    "peugeot 2008":             "peugeot-2008",
    "peugeot 3008":             "peugeot-3008",
    "peugeot partner":          "peugeot-partner",
    "peugeot rifter":           "peugeot-rifter",
    "renault austral":          "renault-austral",
    "renault captur":           "renault-captur",
    "renault espace":           "renault-espace",
    "renault rafale":           "renault-rafale",
    "renault symbioz":          "renault-symbioz",
    "seat arona":               "seat-arona",
    "seat ibiza":               "seat-ibiza",
    "skoda karoq":              "skoda-karoq",
    "skoda octavia":            "skoda-octavia",
    "skoda elroq":              "skoda-elroq",
    "subaru crosstrek":         "subaru-crosstrek",
    "subaru forester":          "subaru-forester",
    "subaru outback":           "subaru-outback",
    "toyota c-hr":              "toyota-c-hr",
    "toyota chr":               "toyota-c-hr",
    "toyota hilux":             "toyota-hilux",
    "toyota proace city":       "toyota-proace-city",
    "toyota yaris":             "toyota-yaris",
    "toyota yaris cross":       "toyota-yaris-cross",
    "volkswagen golf":          "volkswagen-golf",
    "volkswagen polo":          "volkswagen-polo",
    "volkswagen t-cross":       "volkswagen-t-cross",
    "volkswagen t-roc":         "volkswagen-t-roc",
    "volkswagen taigo":         "volkswagen-taigo",
    "volkswagen tiguan":        "volkswagen-tiguan",
}

VIEWS = [
    "delantera-dinamica",
    "vista-delantera",
    "vista-lateral-delantera",
    "vista-trasera",
    "lateral-delantera",
    "frontal",
    "delantera",
    "lateral",
    "tres-cuartos-delantera",
]

def head_ok(url):
    try:
        r = WEB.head(url, timeout=5, allow_redirects=True)
        return r.status_code == 200
    except Exception:
        return False

def best_url_by_head(slug):
    for v in VIEWS:
        url = f"{FOTO_BASE}/{slug}/{slug}-{v}.jpg"
        if head_ok(url):
            return url
    return None

def scrape_main_img(slug):
    """Busca la primera img del CDN en la página del modelo."""
    try:
        r = WEB.get(f"{QCMC_BASE}/{slug}/", timeout=8)
        if r.status_code != 200:
            return None
        pattern = r"https://fotos\.quecochemecompro\.com/[^\"'?]+"
        for m in re.findall(pattern, r.text):
            if m.endswith((".jpg", ".jpeg", ".webp", ".png")):
                if slug in m or any(c.isdigit() for c in m.split("/")[-1]):
                    if head_ok(m):
                        return m
    except Exception:
        pass
    return None

def get_vehicles():
    url = (f"{SUPABASE_URL}/rest/v1/vehicles"
           "?select=id,main_image_url,model:models(name,slug,brand:brands(name,slug))"
           "&is_active=eq.true&limit=300")
    return DB.get(url, headers=HDR_R).json()

def patch(vid, img_url):
    r = DB.patch(
        f"{SUPABASE_URL}/rest/v1/vehicles?id=eq.{vid}",
        headers=HDR_W,
        json={"main_image_url": img_url},
    )
    return r.status_code in (200, 204)

def main():
    vehicles = get_vehicles()
    print(f"Total: {len(vehicles)}")
    updated = skipped = missing = 0

    for v in vehicles:
        m   = v.get("model") or {}
        b   = m.get("brand") or {}
        bn  = normalize(b.get("name", ""))
        mn  = normalize(m.get("name", ""))
        key = f"{bn} {mn}".strip()
        cur = v.get("main_image_url") or ""
        vid = v["id"]

        if "fotos.quecochemecompro.com" in cur:
            print(f"  [OK]       {key}")
            skipped += 1
            continue

        slug = SLUG.get(key) or SLUG.get(mn)
        if not slug:
            print(f"  [NOMATCH]  {key}")
            skipped += 1
            continue

        img = best_url_by_head(slug) or scrape_main_img(slug)

        if img:
            ok = patch(vid, img)
            print(f"  [{'UPD' if ok else 'ERR'}]     {key}  →  {img.split('/')[-1]}")
            if ok:
                updated += 1
        else:
            print(f"  [404]      {key}")
            missing += 1

    print(f"\nActualizados: {updated}  |  Sin cambio: {skipped}  |  No encontrados: {missing}")

main()

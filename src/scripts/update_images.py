"""
Actualiza las imágenes de todos los vehículos en Supabase
usando fotos de quecochemecompro.com.
"""
import requests, json, time

SUPABASE_URL = "https://cwbiyfjaeaxmfaheskae.supabase.co"
SERVICE_KEY  = "REDACTED_SUPABASE_SECRET_KEY"
ANON_KEY     = "sb_publishable_yZ0mZkDWTeFq9CV9rakVZA_2HzIvAvK"
FOTO_BASE    = "https://fotos.quecochemecompro.com"

HEADERS_READ = {
    "apikey": ANON_KEY,
    "Authorization": f"Bearer {ANON_KEY}",
}
HEADERS_WRITE = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

# ── Mapa modelo → slug de quecochemecompro.com ───────────────────────────────
# Slug principal para fotos.quecochemecompro.com/{slug}/{slug}-delantera-dinamica.jpg
SLUG_MAP = {
    # Modelos sin imagen
    "audi a3 sportback":     "audi-a3",
    "maxus t60 max":         "maxus-t60",
    "mazda cx-5":            "mazda-cx5",
    "mazda cx-30":           "mazda-cx30",
    "volkswagen tiguan":     "volkswagen-tiguan",
    "volkswagen taigo":      "volkswagen-taigo",
    "volkswagen t-cross":    "volkswagen-t-cross",
    "nissan x-trail":        "nissan-x-trail",
    # Modelos que ya tienen imagen en storage pero podemos mejorar
    "seat ibiza":            "seat-ibiza",
    "seat arona":            "seat-arona",
    "volkswagen polo":       "volkswagen-polo",
    "renault captur":        "renault-captur",
    "dacia sandero":         "dacia-sandero",
    "kia stonic":            "kia-stonic",
    "toyota yaris":          "toyota-yaris",
    "peugeot rifter":        "peugeot-rifter",
    "opel corsa":            "opel-corsa",
    "opel combo":            "opel-combo",
    "mazda 3":               "mazda3",
    "skoda octavia":         "skoda-octavia",
    "volkswagen t-roc":      "volkswagen-t-roc",
    "peugeot partner":       "peugeot-partner",
    "cupra formentor":       "cupra-formentor",
    "toyota yaris cross":    "toyota-yaris-cross",
    "peugeot 2008":          "peugeot-2008",
    "jeep avenger":          "jeep-avenger",
    "peugeot 3008":          "peugeot-3008",
    "mg zs":                 "mg-zs",
    "citroen c4":            "citroen-c4",
    "ford puma":             "ford-puma",
    "renault symbioz":       "renault-symbioz",
    "hyundai tucson":        "hyundai-tucson",
    "audi a3":               "audi-a3",
    "ford kuga":             "ford-kuga",
    "toyota c-hr":           "toyota-c-hr",
    "volkswagen golf":       "volkswagen-golf",
    "mazda cx-60":           "mazda-cx60",
    "nissan qashqai":        "nissan-qashqai",
    "jeep compass":          "jeep-compass",
    "skoda karoq":           "skoda-karoq",
    "renault austral":       "renault-austral",
    "renault rafale":        "renault-rafale",
    "renault espace":        "renault-espace",
    "toyota hilux":          "toyota-hilux",
    "subaru crosstrek":      "subaru-crosstrek",
    "nissan x-trail":        "nissan-x-trail",
    "mitsubishi outlander":  "mitsubishi-outlander",
    "subaru forester":       "subaru-forester",
    "subaru outback":        "subaru-outback",
    "alfa romeo junior":     "alfa-romeo-junior",
    "toyota proace":         "toyota-proace-city",
    "fiat ducato":           "fiat-ducato",
    "mazda 6e":              "mazda6e",
    "omoda 5":               "omoda-5",
    "omoda 7":               "omoda-7",
    "omoda 9":               "omoda-9",
    "jaecoo 5":              "jaecoo-5",
    "jaecoo 7":              "jaecoo-7",
    "kgm tivoli":            "kgm-tivoli",
    "kgm korando":           "kgm-korando",
    "kgm rexton":            "kgm-rexton",
    "kgm musso":             "kgm-musso",
    "ebro s400":             "ebro-s400",
    "ebro s700":             "ebro-s700",
    "ebro s800 phev":        "ebro-s800",
    "foton tunland":         "foton-tunland",
    "nissan interstar":      "nissan-interstar",
    "maxus deliver 9":       "maxus-deliver-9",
    "skoda elroq":           "skoda-elroq",
    "peugeot partner":       "peugeot-partner",
}

VIEWS = [
    "delantera-dinamica",
    "lateral-delantera",
    "frontal-tres-cuartos",
    "delantera",
    "lateral",
]


def find_best_image(slug):
    """Devuelve la primera URL válida en fotos.quecochemecompro.com."""
    for view in VIEWS:
        url = f"{FOTO_BASE}/{slug}/{slug}-{view}.jpg"
        try:
            r = requests.head(url, timeout=5, allow_redirects=True)
            if r.status_code == 200:
                return url
        except Exception:
            pass
        time.sleep(0.1)
    return None


def get_vehicles():
    url = (
        f"{SUPABASE_URL}/rest/v1/vehicles"
        "?select=id,main_image_url,is_active,model:models(name,slug,brand:brands(name,slug))"
        "&is_active=eq.true&limit=200"
    )
    r = requests.get(url, headers=HEADERS_READ)
    r.raise_for_status()
    return r.json()


def update_image(vehicle_id, image_url):
    url = f"{SUPABASE_URL}/rest/v1/vehicles?id=eq.{vehicle_id}"
    r = requests.patch(url, headers=HEADERS_WRITE, json={"main_image_url": image_url})
    return r.status_code in (200, 204)


def main():
    vehicles = get_vehicles()
    print(f"Total vehículos: {len(vehicles)}")

    updated = 0
    skipped = 0
    not_found = 0

    for v in vehicles:
        model_name = (v.get("model") or {}).get("name", "").lower().strip()
        brand_name = ((v.get("model") or {}).get("brand") or {}).get("name", "").lower().strip()
        full_name  = f"{brand_name} {model_name}".strip()
        v_id       = v["id"]
        current    = v.get("main_image_url") or ""

        slug = SLUG_MAP.get(full_name) or SLUG_MAP.get(model_name)

        if not slug:
            print(f"  [SKIP-NOMATCH] {full_name}")
            skipped += 1
            continue

        # Prioridad: vehículos sin imagen primero, luego los que ya tienen para mejorar
        # Solo reemplazamos si no tienen imagen o si tienen imagen de storage (no de fotos.quecochemecompro.com)
        needs_update = (
            not current or
            "supabase.co" in current or
            "fotos.quecochemecompro.com" not in current
        )

        if not needs_update:
            print(f"  [OK]          {full_name}")
            skipped += 1
            continue

        img_url = find_best_image(slug)
        if img_url:
            ok = update_image(v_id, img_url)
            status = "UPDATED" if ok else "PATCH-ERR"
            print(f"  [{status}]      {full_name} → {img_url}")
            if ok:
                updated += 1
        else:
            print(f"  [NOT-FOUND]   {full_name} (slug: {slug})")
            not_found += 1

        time.sleep(0.15)

    print(f"\n{'='*50}")
    print(f"Actualizados: {updated} | Sin match: {skipped} | No encontrados: {not_found}")


if __name__ == "__main__":
    main()

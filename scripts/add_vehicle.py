"""Da de alta un vehiculo completo (marca/modelo si no existen, version,
precios por plazo/km, galeria de imagenes) a partir de una ficha ya
estructurada en JSON.

Uso:
    python scripts/add_vehicle.py fichas/mercedes-gle-300d.json

Formato del JSON de entrada — ver fichas/EJEMPLO.json.
Los campos ausentes se omiten (columna NULL / array vacio); la ficha en la
web oculta automaticamente lo que no tiene dato.
"""

import json
import re
import sys
import unicodedata

import requests
from _env import SUPABASE_URL, SERVICE_KEY

HEADERS = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
}


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")
    text = text.lower().strip()
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-")


def rest(method, path, headers=None, **kwargs):
    merged_headers = {**HEADERS, **(headers or {})}
    resp = requests.request(method, f"{SUPABASE_URL}/rest/v1/{path}", headers=merged_headers, **kwargs)
    if not resp.ok:
        raise SystemExit(f"Error {resp.status_code} en {path}: {resp.text}")
    return resp.json() if resp.text else None


def get_or_create_brand(name):
    existing = rest("GET", f"brands?name=eq.{requests.utils.quote(name)}&select=id")
    if existing:
        return existing[0]["id"]
    created = rest(
        "POST",
        "brands",
        json={"name": name, "slug": slugify(name)},
        headers={**HEADERS, "Prefer": "return=representation"},
    )
    print(f"  + Marca nueva creada: {name}")
    return created[0]["id"]


def get_or_create_model(brand_id, brand_name, model_name):
    existing = rest(
        "GET",
        f"models?brand_id=eq.{brand_id}&name=eq.{requests.utils.quote(model_name)}&select=id,slug",
    )
    if existing:
        return existing[0]["id"], existing[0]["slug"]
    slug = f"renting-{slugify(brand_name)}-{slugify(model_name)}"
    created = rest(
        "POST",
        "models",
        json={"brand_id": brand_id, "name": model_name, "slug": slug},
        headers={**HEADERS, "Prefer": "return=representation"},
    )
    print(f"  + Modelo nuevo creado: {model_name} ({slug})")
    return created[0]["id"], slug


def main():
    if len(sys.argv) != 2:
        raise SystemExit("Uso: python scripts/add_vehicle.py <ficha.json>")

    with open(sys.argv[1], encoding="utf-8") as f:
        data = json.load(f)

    brand_id = get_or_create_brand(data["brand"])
    model_id, model_slug = get_or_create_model(brand_id, data["brand"], data["model"])

    images = data.get("images", [])
    main_image_url = images[0]["url"] if images else data.get("main_image_url")

    vehicle_payload = {
        "model_id": model_id,
        "version": data["version"],
        "version_slug": slugify(data["version"]),
        "category": data["category"],
        "fuel_type": data["fuel_type"],
        "transmission": data["transmission"],
        "monthly_price_cents": data["monthly_price_cents"],
        "contract_months": data.get("contract_months", 36),
        "annual_km": data.get("annual_km", 15000),
        "horsepower": data.get("horsepower"),
        "consumption_value": data.get("consumption_value"),
        "consumption_unit": data.get("consumption_unit"),
        "seats": data.get("seats"),
        "doors": data.get("doors"),
        "main_image_url": main_image_url,
        "is_featured": data.get("is_featured", False),
        "is_offer": data.get("is_offer", False),
        "badge_text": data.get("badge_text"),
        "short_description": data.get("short_description"),
        "description": data.get("description"),
        "environmental_label": data.get("environmental_label"),
        "colors": data.get("colors"),
        "body_type": data.get("body_type"),
        "equipment": data.get("equipment", []),
    }
    if data.get("included_services"):
        vehicle_payload["included_services"] = data["included_services"]
    vehicle_payload = {k: v for k, v in vehicle_payload.items() if v is not None}

    vehicle = rest(
        "POST",
        "vehicles",
        json=vehicle_payload,
        headers={**HEADERS, "Prefer": "return=representation"},
    )[0]
    vehicle_id = vehicle["id"]
    print(f"  + Vehiculo creado: {data['brand']} {data['model']} {data['version']} (id={vehicle_id})")

    pricing = data.get("pricing", [])
    if pricing:
        rows = [
            {
                "vehicle_id": vehicle_id,
                "contract_months": p["contract_months"],
                "annual_km": p["annual_km"],
                "monthly_price_cents": p["monthly_price_cents"],
            }
            for p in pricing
        ]
        rest("POST", "vehicle_pricing", json=rows, headers={**HEADERS, "Prefer": "return=minimal"})
        print(f"  + {len(rows)} filas de cuotas insertadas")

    if images:
        rows = [
            {
                "vehicle_id": vehicle_id,
                "storage_path": img["url"],
                "alt_text": img.get("alt"),
                "sort_order": i,
                "is_primary": i == 0,
            }
            for i, img in enumerate(images)
        ]
        rest("POST", "vehicle_images", json=rows, headers={**HEADERS, "Prefer": "return=minimal"})
        print(f"  + {len(rows)} fotos insertadas")

    print(f"\nListo: https://movilease.es/{model_slug}")


if __name__ == "__main__":
    main()

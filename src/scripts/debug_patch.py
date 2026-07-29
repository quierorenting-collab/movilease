import requests, re
from _env import SUPABASE_URL, SERVICE_KEY, ANON_KEY

HDR_R = {"apikey": ANON_KEY,    "Authorization": f"Bearer {ANON_KEY}"}
HDR_W = {"apikey": SERVICE_KEY, "Authorization": f"Bearer {SERVICE_KEY}",
          "Content-Type": "application/json", "Prefer": "return=minimal"}

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"}

# Shared session (like the update script)
S = requests.Session()
S.headers.update(UA)

# 1. Get all vehicles
veh = S.get(
    SUPABASE_URL + "/rest/v1/vehicles"
    "?select=id,main_image_url,model:models(name,brand:brands(name))"
    "&is_active=eq.true&limit=100",
    headers=HDR_R
).json()

# Find Audi A3 without CDN image
candidates = [
    v for v in veh
    if "a3" in (v.get("model") or {}).get("name","").lower()
    and "fotos.quecochemecompro.com" not in (v.get("main_image_url") or "")
]
print("Candidates:", len(candidates))
if not candidates:
    # If all A3 are already updated, find any vehicle without CDN image
    candidates = [
        v for v in veh
        if "fotos.quecochemecompro.com" not in (v.get("main_image_url") or "")
    ]
    print("Any without CDN:", len(candidates))

if candidates:
    v = candidates[0]
    vid = v["id"]
    cur = v.get("main_image_url","")
    print(f"Testing vehicle: {vid}  current: {cur}")

    # Scrape quecochemecompro.com for a known model to get a valid image URL
    r = S.get("https://quecochemecompro.com/precios/audi-a3/", timeout=8)
    print(f"Scrape status: {r.status_code}")
    matches = re.findall(r"https://fotos\.quecochemecompro\.com/[^\"'?]+", r.text)
    valid = [m for m in matches if m.endswith((".jpg",".jpeg",".png",".webp"))]
    print(f"Images found: {valid[:3]}")

    if valid:
        img = valid[0]
        print(f"Patching {vid} with {img}")
        # Test with shared session
        r2 = S.patch(
            f"{SUPABASE_URL}/rest/v1/vehicles?id=eq.{vid}",
            headers=HDR_W,
            json={"main_image_url": img}
        )
        print(f"Shared session PATCH: {r2.status_code}  body: {r2.text[:300]}")

        # Test with fresh session
        r3 = requests.patch(
            f"{SUPABASE_URL}/rest/v1/vehicles?id=eq.{vid}",
            headers=HDR_W,
            json={"main_image_url": img}
        )
        print(f"Fresh session PATCH:  {r3.status_code}  body: {r3.text[:300]}")

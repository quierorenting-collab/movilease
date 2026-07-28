import requests
from _env import SUPABASE_URL, SERVICE_KEY

headers = {
    "apikey": SERVICE_KEY,
    "Authorization": f"Bearer {SERVICE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal",
}

resp = requests.patch(
    f"{SUPABASE_URL}/rest/v1/vehicles?is_active=eq.true",
    headers=headers,
    json={"is_featured": True},
)
print(f"Status: {resp.status_code}")
if resp.text:
    print(resp.text[:300])
else:
    print("OK — todos los vehículos activos marcados como featured")

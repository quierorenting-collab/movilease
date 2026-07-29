"""Carga variables desde .env.local sin depender de python-dotenv."""

import os
from pathlib import Path

_ENV_PATH = Path(__file__).parent.parent.parent / ".env.local"


def _load_dotenv():
    if not _ENV_PATH.exists():
        return
    for line in _ENV_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, _, value = line.partition("=")
        os.environ.setdefault(key.strip(), value.strip())


_load_dotenv()


def require_env(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(
            f"Falta {name}. Define la variable de entorno o añádela a .env.local"
        )
    return value


SUPABASE_URL = require_env("NEXT_PUBLIC_SUPABASE_URL")
SERVICE_KEY = require_env("SUPABASE_SERVICE_ROLE_KEY")
ANON_KEY = require_env("NEXT_PUBLIC_SUPABASE_ANON_KEY")

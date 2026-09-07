# -*- coding: utf-8 -*-
"""Vuelca en HubSpot los leads que ya estaban guardados, sin duplicar.

Desde hoy los leads nuevos entran solos en HubSpot. Los anteriores no, y estan
en la tabla `leads` de Supabase, que es donde se han ido guardando desde el
principio.

    python scripts/volcar_leads_hubspot.py            # ensaya y no escribe nada
    python scripts/volcar_leads_hubspot.py --de-verdad

El token sale de HUBSPOT_TOKEN, en el entorno o en .env.local (que esta en
.gitignore). Sin token el ensayo funciona igual: cuenta lo que haria mirando
solo Supabase.

COMO SE EVITA DUPLICAR, que es lo unico delicado de este script:

1. Se agrupan los leads por PERSONA antes de tocar HubSpot. Tres telefonos de
   la tabla tienen mas de un lead —gente que pregunto dos veces—, y son un
   contacto, no dos.
2. La persona se busca en HubSpot por email y por las formas en que puede estar
   escrito su telefono. La busqueda de HubSpot compara la cadena tal cual y en
   la tabla conviven "654371940", "+34677664324" y "610 55 42 76": buscar solo
   la forma exacta crearia un contacto nuevo para alguien que ya esta dentro.
3. Cada lead genera una negociacion cuyo nombre lleva su FECHA. Antes de
   crearla se miran las negociaciones que ese contacto ya tiene y se salta si
   ya existe una con ese nombre. Asi el script se puede ejecutar dos veces
   seguidas sin crear nada la segunda.

Lo que este script NO puede hacer: los leads de quierorenting.es. Esa web nunca
los ha guardado —solo avisaba por Telegram y por correo— y un bot de Telegram no
puede leer los mensajes que el mismo envio. La unica copia esta en el movil y en
el buzon.
"""
import argparse
import collections
import io
import os
import re
import sys

import requests

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from _env import SUPABASE_URL, SERVICE_KEY  # noqa: E402

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
API_HS = "https://api.hubapi.com"
ASOCIACION_NEGOCIACION_CONTACTO = 3
ESPERA = 20


def token_hubspot():
    if os.environ.get("HUBSPOT_TOKEN"):
        return os.environ["HUBSPOT_TOKEN"]
    ruta = os.path.join(RAIZ, ".env.local")
    if os.path.isfile(ruta):
        for linea in io.open(ruta, encoding="utf-8"):
            linea = linea.strip()
            if linea.startswith("HUBSPOT_TOKEN="):
                return linea.split("=", 1)[1].strip().strip('"').strip("'")
    return None


def variantes_telefono(telefono):
    """Las formas en que ese numero puede estar escrito en HubSpot."""
    limpio = re.sub(r"[\s.()-]", "", telefono or "")
    digitos = re.sub(r"\D", "", limpio)
    nueve = digitos[-9:]
    salida = [telefono, limpio, digitos, nueve]
    if len(digitos) == 9:
        salida.append("+34" + nueve)
    vistos, out = set(), []
    for v in salida:
        if v and v not in vistos:
            vistos.add(v)
            out.append(v)
    return out


def normalizado(telefono):
    limpio = re.sub(r"[\s.()-]", "", telefono or "")
    if limpio.startswith("+"):
        return limpio
    digitos = re.sub(r"\D", "", limpio)
    return "+34" + digitos if len(digitos) == 9 else (telefono or "").strip()


def parece_prueba(lead):
    """Leads que son pruebas del propio equipo, no clientes.

    En la tabla hay dos con el nombre "PRUEBA" y el telefono 666666666. Meterlos
    en el CRM ensucia el embudo y ademas engana a cualquier cuenta que se haga
    despues. Se saltan, pero se dicen: el criterio es discutible y no debe
    quedar escondido.
    """
    nombre = (lead.get("name") or "").strip().lower()
    digitos = re.sub(r"\D", "", lead.get("phone") or "")
    if nombre in ("prueba", "test", "pruebas", "asdf", "aaa", "x"):
        return True
    # Un movil de nueve digitos todos iguales no existe.
    return len(set(digitos)) == 1 and len(digitos) >= 9


def clave_persona(lead):
    """Dos leads son la misma persona si comparten los 9 ultimos digitos del
    telefono. El email no vale como clave: solo lo dejan 7 de cada 17."""
    d = re.sub(r"\D", "", lead.get("phone") or "")
    return d[-9:] or (lead.get("email") or "").lower() or lead["id"]


class HubSpot:
    def __init__(self, token, escribir):
        self.token = token
        self.escribir = escribir
        self.s = requests.Session()
        self.s.headers.update({"Authorization": "Bearer %s" % token,
                               "Content-Type": "application/json"})

    def _peticion(self, metodo, ruta, cuerpo=None):
        r = self.s.request(metodo, API_HS + ruta, json=cuerpo, timeout=ESPERA)
        if not r.ok:
            raise SystemExit("  HubSpot %s %s -> %s\n  %s"
                             % (metodo, ruta, r.status_code, r.text[:400]))
        return r.json() if r.content else {}

    def buscar_contacto(self, email, telefono):
        grupos = []
        if email:
            grupos.append({"filters": [{"propertyName": "email", "operator": "EQ", "value": email}]})
        for v in variantes_telefono(telefono)[: 4 if email else 5]:
            grupos.append({"filters": [{"propertyName": "phone", "operator": "EQ", "value": v}]})
        if not grupos:
            return None
        datos = self._peticion("POST", "/crm/v3/objects/contacts/search",
                               {"filterGroups": grupos, "properties": ["email", "phone"], "limit": 1})
        res = datos.get("results") or []
        return res[0]["id"] if res else None

    def negociaciones_de(self, contacto_id):
        """Nombres de las negociaciones que ese contacto ya tiene."""
        datos = self._peticion(
            "POST", "/crm/v3/objects/deals/search",
            {"filterGroups": [{"filters": [
                {"propertyName": "associations.contact", "operator": "EQ", "value": contacto_id}]}],
             "properties": ["dealname"], "limit": 100})
        return {d["properties"].get("dealname") for d in (datos.get("results") or [])}

    def etapa(self):
        pipe, fase = os.environ.get("HUBSPOT_PIPELINE_ID"), os.environ.get("HUBSPOT_DEALSTAGE_ID")
        if pipe and fase:
            return pipe, fase
        datos = self._peticion("GET", "/crm/v3/pipelines/deals")
        embudo = (datos.get("results") or [None])[0]
        if not embudo or not embudo.get("stages"):
            raise SystemExit("  HubSpot no tiene ningun embudo de negociaciones")
        etapas = sorted(embudo["stages"], key=lambda e: e.get("displayOrder", 0))
        return embudo["id"], etapas[0]["id"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--de-verdad", action="store_true",
                    help="escribe en HubSpot; sin esto solo ensaya")
    ap.add_argument("--con-pruebas", action="store_true",
                    help="incluye tambien los leads que parecen pruebas del equipo")
    args = ap.parse_args()
    if args.con_pruebas:
        globals()["parece_prueba"] = lambda lead: False

    cab = {"apikey": SERVICE_KEY, "Authorization": "Bearer %s" % SERVICE_KEY}
    r = requests.get(SUPABASE_URL.rstrip("/") + "/rest/v1/leads", headers=cab, params={
        "select": ("id,name,last_name,phone,email,company,province,client_type,"
                   "message,source,page_url,created_at"),
        "order": "created_at.asc"}, timeout=ESPERA)
    r.raise_for_status()
    leads = r.json()

    pruebas = [l for l in leads if parece_prueba(l)]
    leads = [l for l in leads if not parece_prueba(l)]
    personas = collections.OrderedDict()
    for l in leads:
        personas.setdefault(clave_persona(l), []).append(l)
    print("  %d leads utiles -> %d personas distintas" % (len(leads), len(personas)))
    if pruebas:
        print("  %d descartados por parecer pruebas del equipo (--con-pruebas para incluirlos):"
              % len(pruebas))
        for l in pruebas:
            print("     %s  %-14s %s" % (l["created_at"][:10], l.get("phone"), l.get("name")))

    token = token_hubspot()
    if not token:
        print("\n  Sin HUBSPOT_TOKEN: solo se puede ensayar sobre Supabase.")
        print("  Se crearian como mucho %d contactos y %d negociaciones.\n"
              % (len(personas), len(leads)))
        for clave, grupo in personas.items():
            p = grupo[0]
            print("     %-22s %-15s %-28s %d solicitud(es)"
                  % ((p.get("name") or "")[:22], p.get("phone"),
                     (p.get("email") or "sin email")[:28], len(grupo)))
        return

    hs = HubSpot(token, args.de_verdad)
    pipeline, fase = hs.etapa()
    print("  embudo %s / etapa %s" % (pipeline, fase))
    print("  modo: %s\n" % ("ESCRIBIENDO" if args.de_verdad else "ENSAYO, no escribe"))

    nuevos = actualizados = negociaciones = saltadas = 0
    for clave, grupo in personas.items():
        p = grupo[-1]                      # el ultimo dato es el mas reciente
        existente = hs.buscar_contacto(p.get("email"), p.get("phone"))
        props = {"firstname": p.get("name") or "", "phone": normalizado(p.get("phone"))}
        for campo, valor in (("lastname", p.get("last_name")), ("email", p.get("email")),
                             ("company", p.get("company")), ("state", p.get("province"))):
            if valor:
                props[campo] = valor

        if existente:
            actualizados += 1
            contacto = existente
            if args.de_verdad:
                hs._peticion("PATCH", "/crm/v3/objects/contacts/%s" % existente, {"properties": props})
        else:
            nuevos += 1
            contacto = None
            if args.de_verdad:
                props["lifecyclestage"] = "lead"
                contacto = hs._peticion("POST", "/crm/v3/objects/contacts",
                                        {"properties": props})["id"]

        ya_tiene = hs.negociaciones_de(contacto) if (contacto and args.de_verdad) else set()
        for l in grupo:
            fecha = l["created_at"][:10]
            nombre = "%s — solicitud web (%s)" % (l.get("name") or "Lead", fecha)
            if nombre in ya_tiene:
                saltadas += 1
                continue
            negociaciones += 1
            if not args.de_verdad:
                continue
            descripcion = "\n".join(x for x in [
                "Mensaje: " + l["message"] if l.get("message") else None,
                "Provincia: " + l["province"] if l.get("province") else None,
                "Pagina: " + l["page_url"] if l.get("page_url") else None,
                "Origen: formulario de movilease.es",
                "Lead del %s, volcado desde el historico" % fecha,
            ] if x)
            hs._peticion("POST", "/crm/v3/objects/deals", {
                "properties": {"dealname": nombre, "pipeline": pipeline, "dealstage": fase,
                               "description": descripcion,
                               # La negociacion se fecha en el dia del lead, no
                               # en el de la importacion: si no, el embudo diria
                               # que llegaron todos hoy.
                               "createdate": l["created_at"]},
                "associations": [{"to": {"id": contacto}, "types": [
                    {"associationCategory": "HUBSPOT_DEFINED",
                     "associationTypeId": ASOCIACION_NEGOCIACION_CONTACTO}]}]})

    print("  contactos nuevos:      %d" % nuevos)
    print("  contactos que ya estaban: %d" % actualizados)
    print("  negociaciones creadas: %d" % negociaciones)
    print("  negociaciones saltadas por existir ya: %d" % saltadas)
    if not args.de_verdad:
        print("\n  Ensayo. Para escribirlo de verdad: --de-verdad")


if __name__ == "__main__":
    main()

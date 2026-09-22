# SEO de entidad — Movilease Renting, S.L.

Objetivo: que Google identifique a **Movilease Renting, S.L.** (España) como una
entidad propia y deje de mezclarla con **MoviLease**, una empresa francesa cerrada
de Wambrechies (Francia).

## Datos NAP canónicos: copiar SIEMPRE exactamente así

Google cruza nombre, dirección y teléfono entre la web, Google Business Profile y
los directorios. Cualquier variación resta: una coma, «C/» en vez de «Calle» o el
teléfono sin prefijo. Estos son los mismos datos que publica la web (constante
`COMPANY` de `src/lib/constants.ts`: pie, JSON-LD y páginas legales):

| Campo | Valor |
|---|---|
| Nombre comercial | Movilease Renting |
| Razón social | Movilease Renting, S.L. |
| CIF | B93944635 |
| Dirección | Calle Infanta Mercedes 31 |
| Código postal | 28020 |
| Ciudad | Madrid |
| Provincia / comunidad | Madrid / Comunidad de Madrid |
| País | España |
| Dirección en una línea | Calle Infanta Mercedes 31, 28020 Madrid, España |
| Teléfono | +34 644 15 67 97 |
| Email | contacto@movilease.es |
| Web | https://movilease.es |
| Instagram | https://www.instagram.com/movilease.es/ |
| Trustpilot | https://es.trustpilot.com/review/movilease.es |
| LinkedIn | ⚠️ pendiente: falta la URL exacta de la página de empresa |

> ⚠️ **Por confirmar:** las páginas legales decían antes «Calle Infanta Mercedes
> 31, **2**». Si ese «2» es la planta y forma parte del domicilio, hay que
> añadirlo en `COMPANY` (web) y usarlo igual en todos los directorios.

Descripción corta (para campos de unos 160 caracteres):

> Movilease Renting, S.L. es una empresa española de renting de coches a largo
> plazo para particulares, autónomos y empresas, con sede en Madrid.

## Ficheros

- `google-business-profile.md`: alta de la ficha de Google.
- `reportar-ficha-francesa.md`: cómo pedir que se marque como cerrada la de Wambrechies.
- `feedback-ia-google.md`: texto para la vista creada con IA.
- `directorios.md`: checklist de directorios españoles.
- `reclamar-panel.md`: reclamar el panel de conocimiento.

## Orden recomendado

1. Google Business Profile (la señal más fuerte) y su verificación.
2. Search Console: confirmar que la propiedad de movilease.es está verificada y
   enviar `https://movilease.es/sitemap.xml`.
3. Reportar la ficha francesa y enviar el feedback de la vista creada con IA.
4. Directorios, empezando por los de prioridad alta.
5. Cuando aparezca el panel de conocimiento, reclamarlo.

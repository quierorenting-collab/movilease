# Reclamar el panel de conocimiento de Google

El panel de conocimiento es el recuadro que sale a la derecha (o arriba en el
móvil) al buscar el nombre de la empresa. Hay dos tipos, y se gestionan distinto:

| Tipo | Cómo se reconoce | Cómo se gestiona |
|---|---|---|
| **Ficha de empresa local** | Mapa, dirección, horario, reseñas, «Cómo llegar» | Desde **Google Business Profile**. Se «reclama» dando de alta y verificando la ficha (`google-business-profile.md`) |
| **Panel de entidad** | Logo, descripción (a veces de Wikipedia), redes sociales, sin mapa | Con **«¿Es tu empresa? / Reclamar este panel de conocimiento»** |

## 1. Comprobar qué sale hoy

Busca en Google, en una ventana de incógnito:

- `movilease`
- `movilease renting`
- `Movilease Renting S.L.`

Apunta si sale un panel y de qué tipo, y si mezcla datos de la empresa francesa.

## 2. Si sale un panel de entidad

1. Inicia sesión con una cuenta de Google que tenga acceso a Search Console de
   movilease.es (u otra de las propiedades oficiales: YouTube, redes).
2. En el panel, abajo, pulsa **«Reclamar este panel de conocimiento»** o
   **«¿Es tu empresa?»**.
3. Google pide verificar que representas a la entidad. La vía más rápida es
   iniciar sesión en **Search Console** con la propiedad de movilease.es ya
   verificada. Si no la ofrece, pedirá verificar con una red oficial (YouTube,
   X, Facebook, Instagram…) enlazada desde la web.
4. Una vez verificado, podrás **«Sugerir cambios»** con prioridad: logo, nombre,
   redes y, sobre todo, corregir datos mezclados con la empresa francesa.

Texto para sugerir cambios en el panel:

```
El panel mezcla dos empresas. Movilease Renting, S.L. (CIF B93944635) es una empresa española de renting de vehículos con sede en Calle Infanta Mercedes 31, planta 2, 28020 Madrid, España. Web oficial: https://movilease.es. Los datos de Wambrechies (Francia) corresponden a otra empresa, MoviLease, ya cerrada y sin relación con nosotros.
```

## 3. Si no sale ningún panel todavía

Es lo normal en una entidad nueva. Google lo crea cuando confía en quién eres.
Para acelerarlo:

1. ✅ **JSON-LD `Organization` en todas las páginas** con `legalName`, `taxID`,
   dirección y `sameAs`. **Hecho en la web.**
2. ☐ Google Business Profile verificado.
3. ☐ Perfiles oficiales enlazados en el `sameAs`: Instagram y Trustpilot ya
   están; **falta LinkedIn** (pásame la URL y lo añado en `COMPANY.sameAs` de
   `src/lib/constants.ts`).
4. ☐ Directorios con NAP idéntico (`directorios.md`).
5. ☐ Elemento en Wikidata con fuentes (ver `directorios.md`).
6. ☐ Menciones en medios o blogs del sector que enlacen a movilease.es.

Cuando aparezca el panel, vuelve al paso 2.

## 4. Search Console (requisito para reclamar)

La web ya lleva la etiqueta de verificación de Google en todas las páginas
(`verification.google` en `src/app/layout.tsx`). Comprueba en
https://search.google.com/search-console que la propiedad de `https://movilease.es`
figura como **verificada** y que el propietario es tu cuenta. Si no la ves, añade
una propiedad de **dominio** (`movilease.es`) con el registro DNS TXT que te dé
Google: cubre www y http/https y no depende del código.

## Plazos realistas

- Ficha de GBP: la verificación tarda de días a 2–3 semanas.
- Panel de entidad: puede tardar semanas o meses en aparecer o en corregirse.
- Revisa cada 2–3 semanas con las búsquedas del paso 1.

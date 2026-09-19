# Despliegue — Plataforma PSA Represa Villeros

Arquitectura real (no la que se planeó al principio — ver nota abajo):
**`backend/server.js` sirve el sitio Y la API desde un solo proceso Node**,
desplegado dos veces por separado con el mismo código: una en **Hostinger**
(vía su integración Git de hosting Node, ya conectada al dominio real) y otra
en **Render** (de respaldo / para pruebas). No hay División estático vs. API:
cada despliegue es autosuficiente.

```
                    push a GitHub (hotelmalibu/psa-villeros)
                                  │
                 ┌────────────────┴────────────────┐
                 ▼                                  ▼
   ┌───────────────────────────┐      ┌───────────────────────────┐
   │  Hostinger (Node hosting)  │      │  Render (respaldo)         │
   │  dominio: psacoveñas.com   │      │  psa-villeros-api.onrender │
   │  backend/server.js         │      │  backend/server.js         │
   │  sirve "/" (index.html)    │      │  sirve "/" (index.html)    │
   │  y "/api/..."              │      │  y "/api/..."               │
   └───────────────────────────┘      └───────────────────────────┘
                                                        (opcional, más adelante)
                                                       ┌──────────────────────────┐
                                                       │  GeoServer (Docker)      │
                                                       │  WMS/WFS de las capas    │
                                                       └──────────────────────────┘
```

**Por qué cambió el plan:** originalmente la idea era Hostinger = solo
`index.html` estático (subido por File Manager) + Render = solo la API. Pero
Hostinger ya tenía conectada su propia integración Git de hosting Node al
mismo repo, apuntando a `backend/` — así que en vez de pelear contra eso,
`backend/server.js` se adaptó para servir también el sitio (ver
`backend/README.md`), y ahora ambos despliegues son independientes y
completos.

## Dominio

**psacoveñas.com** (Hostinger). Como es un dominio con "ñ" (IDN), el nombre
real que viaja por DNS/HTTP no es ese texto sino su forma Punycode:

```
psacoveñas.com  →  xn--psacoveas-r6a.com
```

Eso es lo que hay que usar en `CORS_ORIGIN` (ver abajo) y es normal que
aparezca así en paneles técnicos — el navegador lo sigue mostrando como
"psacoveñas.com" para el usuario final.

## Estado actual

- [x] Repo en GitHub: [`hotelmalibu/psa-villeros`](https://github.com/hotelmalibu/psa-villeros).
- [x] **Backend + sitio desplegados en Render** (respaldo):
      [`psa-villeros-api`](https://dashboard.render.com) →
      `https://psa-villeros-api.onrender.com` (plan free — se "duerme" tras
      ~15 min sin tráfico, el primer request después tarda unos segundos).
      Verificado con `demo.tecnico` y `demo.publico` contra el servicio real.
- [x] **Backend + sitio desplegados en Hostinger** (el dominio real) vía su
      integración Git de hosting Node, apuntando a `backend/`.
      `https://psacoveñas.com/api/health` responde bien.
- [x] `index.html` duplicado en `backend/index.html` — necesario para que
      Hostinger lo encuentre (ver por qué en `backend/README.md`).
- [x] `API_BASE` en `index.html` es una ruta relativa (`""`) — funciona igual
      en cualquiera de los dos despliegues, sin fijar un dominio.
- [ ] **Falta confirmar que `https://psacoveñas.com/` ya sirve el sitio** (no
      solo la API) — se agregó el `index.html` duplicado recién; falta ver un
      redeploy tomar ese cambio.
- [ ] **Falta actualizar `CORS_ORIGIN`** con el dominio real en cualquiera de
      los dos paneles donde uses la API cross-origin (por defecto está en
      `*`, que ya funciona; esto es solo para cerrarlo más). No es urgente
      mientras cada despliegue sirva su propio sitio + su propia API (mismo
      origen, no necesita CORS).
- [ ] GeoServer: sin desplegar todavía (opcional, ver `geoserver/README.md`).

## Si vuelves a tocar `index.html`

Copialo también a `backend/index.html` antes de subir el cambio:

```bash
cp index.html backend/index.html
git add index.html backend/index.html
```

Si te olvidás de este paso, Hostinger seguirá sirviendo la versión vieja del
sitio (aunque la API ya tenga el código nuevo) — es la causa más probable si
alguna vez ves inconsistencias entre lo que ves en local y lo publicado ahí.

## Teselas del Mapa virtual

La ortofoto (7,75 cm/px) y el modelo de elevación del vuelo de dron viven como
teselas web en `backend/tiles/` (`ortho/`, `dem/`, más `index.json` y
`dem_t.bin` para consultar altitudes). `backend/server.js` las sirve en
`/tiles`; la capa de vegetación se calcula en el navegador sobre las teselas de
la ortofoto, así que no ocupa espacio. Están dentro de `backend/` (no en la
raíz) para que el despliegue Git de Hostinger también las copie.

El TIF de elevación exportado de DroneDeploy viene ya coloreado, sin metros
reales: el rango de altitud (`elevMin`/`elevMax` en `VMAP`, dentro de
`index.html`) debe salir de la leyenda de DroneDeploy. Mientras `calibrated`
sea `false`, el mapa marca la altitud como aproximada.

## GeoServer (opcional, cuando lo necesites)

Ver [`geoserver/README.md`](geoserver/README.md). No es necesario para que el
sitio funcione: el Atlas ya sirve las capas reales como GeoJSON embebido.

## Qué revisar después de cada despliegue

- `https://psacoveñas.com/api/health` y `https://psa-villeros-api.onrender.com/api/health`
  responden `{"ok":true,...}`.
- `https://psacoveñas.com/` y la URL de Render muestran el sitio (no "Cannot
  GET /").
- El login con `demo.tecnico` / `Villeros2026` funciona en ambos.
- Recargar la página estando logueado no debe pedir login de nuevo (sesión por
  `sessionStorage` + `/api/auth/me`).

## Qué sigue siendo simulado (a propósito, por ahora)

- El formulario de "observación sobre su predio" en Participación no envía
  datos a ningún servidor todavía.
- El repositorio de Documentos sigue apuntando a enlaces de Google Drive, no a
  un storage propio.

Ninguno de los dos bloquea el despliegue — son mejoras futuras, no
dependencias de Hostinger/Render.

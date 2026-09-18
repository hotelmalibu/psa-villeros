# Despliegue — Plataforma PSA Represa Villeros

Arquitectura: **Hostinger** sirve el sitio estático (`index.html`), **Render**
corre los servicios que necesitan un proceso vivo (la API de autenticación, y
opcionalmente GeoServer). El HTML sigue siendo un solo archivo sin build step;
solo se conecta por `fetch` a los servicios de Render.

```
┌─────────────────────┐        fetch (HTTPS)        ┌──────────────────────────┐
│  Hostinger           │ ───────────────────────────▶│  Render                  │
│  index.html (5+ MB)  │                              │  psa-villeros-api        │
│  hosting estático    │ ◀─────────────────────────── │  (Node/Express + JWT)    │
└─────────────────────┘        JSON + token           └──────────────────────────┘
                                                        (opcional, más adelante)
                                                       ┌──────────────────────────┐
                                                       │  GeoServer (Docker)      │
                                                       │  WMS/WFS de las capas    │
                                                       └──────────────────────────┘
```

## Estado actual

- [x] Repo en GitHub: [`hotelmalibu/psa-villeros`](https://github.com/hotelmalibu/psa-villeros).
- [x] **Backend de autenticación desplegado en Render**:
      [`psa-villeros-api`](https://dashboard.render.com) →
      `https://psa-villeros-api.onrender.com` (plan free — se "duerme" tras
      ~15 min sin tráfico, el primer request después tarda unos segundos).
      Verificado con `demo.tecnico` y `demo.publico` contra el servicio real.
- [x] `index.html` ya apunta a esa URL (`var API_BASE`) y está pusheado a `main`.
- [ ] **Falta subir `index.html` a Hostinger** (ver paso 3 abajo — necesita tus
      credenciales, no puedo hacerlo por ti).
- [ ] GeoServer: sin desplegar todavía (opcional, ver `geoserver/README.md`).

## Orden recomendado

1. ~~Backend de autenticación (`backend/`) → Render~~ — **ya hecho**, ver arriba.
2. ~~Copiar la URL de Render en `API_BASE`~~ — **ya hecho**.
3. **Frontend** (`index.html`) → subir a Hostinger.
   - Vía hPanel: Archivos > Administrador de archivos > `public_html/` > subir
     `index.html` (puede tardar un poco por el tamaño, ~5 MB).
   - Vía FTP: cualquier cliente FTP (FileZilla, etc.) con las credenciales de tu
     plan de Hostinger, subiendo a `public_html/`.
   - Esto lo tienes que hacer tú: no puedo iniciar sesión en tu cuenta de
     Hostinger ni escribir tu contraseña por ti.
   - Una vez subido, actualiza `CORS_ORIGIN` en Render (Environment del
     servicio `psa-villeros-api`) con el dominio real de Hostinger en vez de
     `*`, para cerrar el acceso a la API solo a tu sitio.
4. **GeoServer** (opcional, cuando lo necesites) → ver
   [`geoserver/README.md`](geoserver/README.md). No es necesario para que el
   sitio funcione: el Atlas ya sirve las capas reales como GeoJSON embebido.

## Qué revisar después de cada despliegue

- `https://tu-api.onrender.com/api/health` responde `{"ok":true,...}`.
- El login con `demo.tecnico` / `Villeros2026` funciona desde el sitio ya
  publicado en Hostinger (no solo en local) — confirma que `CORS_ORIGIN` en
  Render incluye el dominio real de Hostinger.
- Recargar la página estando logueado no debe pedir login de nuevo (sesión por
  `sessionStorage` + `/api/auth/me`).

## Qué sigue siendo simulado (a propósito, por ahora)

- El formulario de "observación sobre su predio" en Participación no envía
  datos a ningún servidor todavía.
- El repositorio de Documentos sigue apuntando a enlaces de Google Drive, no a
  un storage propio.

Ninguno de los dos bloquea el despliegue — son mejoras futuras, no
dependencias de Hostinger/Render.

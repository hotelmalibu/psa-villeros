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

## Orden recomendado

1. **Backend de autenticación** (`backend/`) → desplegar primero en Render.
   Instrucciones completas en [`backend/README.md`](backend/README.md).
2. Copiar la URL pública que Render asigna (el nombre exacto depende de si
   `psa-villeros-api` ya está tomado por otro usuario de Render — el panel te
   muestra el nombre final) dentro de `index.html`, variable `API_BASE` (buscar
   `var API_BASE =`, hoy tiene un placeholder que hay que reemplazar sí o sí).
3. **Frontend** (`index.html`) → subir a Hostinger.
   - Vía hPanel: Archivos > Administrador de archivos > `public_html/` > subir
     `index.html` (puede tardar un poco por el tamaño, ~5 MB).
   - Vía FTP: cualquier cliente FTP (FileZilla, etc.) con las credenciales de tu
     plan de Hostinger, subiendo a `public_html/`.
   - Esto lo tienes que hacer tú: no puedo iniciar sesión en tu cuenta de
     Hostinger ni escribir tu contraseña por ti.
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

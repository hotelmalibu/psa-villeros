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
- [x] **Backend de autenticación desplegado en Render**:
      [`psa-villeros-api`](https://dashboard.render.com) →
      `https://psa-villeros-api.onrender.com` (plan free — se "duerme" tras
      ~15 min sin tráfico, el primer request después tarda unos segundos).
      Verificado con `demo.tecnico` y `demo.publico` contra el servicio real.
- [x] `index.html` ya apunta a esa URL (`var API_BASE`) y está pusheado a `main`.
- [x] Carpeta local `hostinger-upload/` lista para subir tal cual (solo
      contiene `index.html`, sin nada más del repo) — no está en git, es solo
      una copia de conveniencia en tu máquina para arrastrar al File Manager.
- [ ] **Falta subir `hostinger-upload/index.html` a Hostinger** y apuntar
      `psacoveñas.com` a ese hosting (ver paso 3 abajo — necesita tus
      credenciales, no puedo hacerlo por ti: Hostinger tiene una verificación
      anti-bots de Cloudflare que bloquea el navegador automatizado).
- [ ] **Falta actualizar `CORS_ORIGIN` en Render** con el dominio real (ver
      paso 4 — también necesita que inicies sesión ahí, la sesión que tenía
      abierta expiró).
- [ ] GeoServer: sin desplegar todavía (opcional, ver `geoserver/README.md`).

## Orden recomendado

1. ~~Backend de autenticación (`backend/`) → Render~~ — **ya hecho**, ver arriba.
2. ~~Copiar la URL de Render en `API_BASE`~~ — **ya hecho**.
3. **Frontend** → subir a Hostinger y apuntar el dominio.
   - Iniciá sesión en [hpanel.hostinger.com](https://hpanel.hostinger.com).
   - Si `psacoveñas.com` todavía no está agregado como dominio del hosting:
     **Dominios** → agregalo (o **Websites** → creá un sitio nuevo para ese
     dominio) y seguí el asistente para que apunte al hosting donde vas a
     subir el archivo.
   - **Archivos → Administrador de archivos** → entrá a `public_html/` del
     hosting asociado a `psacoveñas.com` (si el dominio queda en una
     subcarpeta tipo `public_html/psacoveñas.com/`, es ahí).
   - Subí `hostinger-upload/index.html` (pesa 7,4 MB, puede tardar un poco).
     Si ya había un `index.html`, reemplazalo.
   - El DNS puede tardar unos minutos a unas horas en propagarse si el
     dominio se acaba de apuntar.
   - Esto lo tenés que hacer vos: no puedo iniciar sesión en tu cuenta de
     Hostinger ni escribir tu contraseña por vos, y el navegador automatizado
     queda bloqueado por la verificación anti-bots del sitio.
4. **Cerrar la API al dominio real** → en
   [dashboard.render.com](https://dashboard.render.com), entrá al servicio
   `psa-villeros-api` → **Environment** → cambiá `CORS_ORIGIN` de `*` a:
   ```
   https://psacoveñas.com,https://www.psacoveñas.com
   ```
   (Render acepta el nombre en Unicode tal cual — internamente lo compara
   contra el `Origin` que manda el navegador, que sí va en Punycode
   `xn--psacoveas-r6a.com`; si notás que el login falla por CORS una vez
   publicado, probá poniendo directamente la forma Punycode en su lugar).
   Guardá — el servicio se redespliega solo con el nuevo valor.
5. **GeoServer** (opcional, cuando lo necesites) → ver
   [`geoserver/README.md`](geoserver/README.md). No es necesario para que el
   sitio funcione: el Atlas ya sirve las capas reales como GeoJSON embebido.

## Qué revisar después de cada despliegue

- `https://psa-villeros-api.onrender.com/api/health` responde `{"ok":true,...}`.
- El login con `demo.tecnico` / `Villeros2026` funciona desde
  `https://psacoveñas.com` publicado (no solo en local) — confirma que
  `CORS_ORIGIN` en Render incluye ese dominio.
- Recargar la página estando logueado no debe pedir login de nuevo (sesión por
  `sessionStorage` + `/api/auth/me`).

## Qué sigue siendo simulado (a propósito, por ahora)

- El formulario de "observación sobre su predio" en Participación no envía
  datos a ningún servidor todavía.
- El repositorio de Documentos sigue apuntando a enlaces de Google Drive, no a
  un storage propio.

Ninguno de los dos bloquea el despliegue — son mejoras futuras, no
dependencias de Hostinger/Render.

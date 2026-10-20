# API de autenticación — Plataforma PSA Represa Villeros

Backend mínimo en Node/Express que reemplaza el login simulado del `index.html`.
Verifica usuario + contraseña (hash bcrypt) contra `users.js` y devuelve un JWT
que el frontend guarda en `sessionStorage` para mantener la sesión.

Este mismo proceso **también sirve el sitio** (`GET /` → `index.html`), no solo
la API — así un único despliegue de Node alcanza para todo. `index.html` está
duplicado en esta carpeta (`backend/index.html`) además de en la raíz del repo,
porque el despliegue Git de Hostinger solo copia el contenido de esta carpeta
(no el repo completo como Render) — sin esa copia local, la app solo serviría
la API y `/` daría "Cannot GET /". **Si editas `index.html`, copialo también acá**
antes de subir el cambio:
```bash
cp ../index.html index.html
```

## Endpoints

- `GET /` — el sitio (`index.html`).
- `GET /api/health` — verifica que el servicio está vivo.
- `POST /api/auth/login` — body `{ "username": "...", "password": "..." }` → `{ token, user }`.
- `GET /api/auth/me` — header `Authorization: Bearer <token>` → `{ user }`.
- `POST /api/docs` / `POST /api/economia` / `POST /api/predial` — requieren sesión (`Authorization: Bearer`) y la
  clave de acceso adicional (body `{ "clave": "..." }`) → devuelven `docs.js` / `economia.js` / `predial.js` (este
  último, el detalle por predio del módulo Análisis predial: presupuesto referencial de adquisición, ruta de los
  nueve predios del polígono, grupos y ruta de gestión de los 60 predios — Producto 3).
- `POST /api/flipbook/acceso` — misma sesión y clave que arriba; body `{ "clave": "...", "doc": "producto1" | "producto2" | "producto3" }`
  (sin `doc` se entiende el Producto 2; un `doc` desconocido responde 400); en vez de devolver datos, concede una
  cookie de acceso de 20 minutos (`psa_flip`, http-only, `path=/flipbook`) y responde `{ ok, url }`. El
  documento técnico completo (Producto 2) vive en `backend/flipbook/` como un lector tipo flipbook
  (HTML + imágenes en `assets/`, generado con `scripts` fuera de este repo a partir del documento
  fuente) y se sirve en `GET /flipbook/producto2.html` solo con esa cookie — sin ella responde 401. El
  frontend pide la cookie por `fetch` y abre esa URL en una pestaña nueva (botón "Leer en línea" en
  Documentos del contrato).
  La copia servida es el libro digital "versión final" (septiembre de 2026, 191 páginas), extraído del HTML
  único que entregó el usuario (imágenes y fuentes a `assets/`), con dos tandas de correcciones puntuales para
  cumplir las reglas del cliente. Primera: la gráfica de dos curvas del Anexo 2 (Mapa 16) se sustituyó por la
  Figura 3 de una sola curva, se quitó del capítulo 13 la comparación con el costeo sobre área SIG y se
  reemplazaron dos frases que aludían a un portafolio (capítulo 7.6 y ficha de P17). Segunda: se retiró el
  concepto «área directa» y su cifra (las 47,4 ha) del capítulo 4, del capítulo 7.6 y de los Anexos 1, 3, 4 y 5,
  dejando solo el área elegible y el dato geográfico de los 9 predios dentro del polígono de la cuenca. Al
  reemplazar el libro por una versión corregida en el origen, esas correcciones dejan de ser necesarias.
  El Producto 3 (modelo de gestión y prospectiva predial, octubre de 2026) se lee en `GET /flipbook/producto3.html`, con la
  misma cookie: es un lector de imágenes de las 34 páginas de la edición digital en PDF que entregó el usuario
  (`backend/flipbook/producto3/p01.webp` … `p34.webp`; el PDF trae el texto en curvas, por eso no es un lector de texto).
  Se regenera con `.claude/build-src/producto3/render_paginas.py` y `build_reader.js`; trae selector de capítulos,
  botones de página y una vista ampliada de cada pliego.
  El Producto 1 (diagnóstico del área de estudio, agosto de 2026) se lee en `GET /flipbook/producto1.html`, también con esa
  cookie: es el libro de 108 páginas (HTML de texto con StPageFlip y fuentes embebidas) que entregó el usuario, servido sin
  cambios (idéntico byte a byte al `index.html` de su paquete), con sus 41 imágenes en `backend/flipbook/media/` (las rutas
  relativas `media/…` del HTML se resuelven ahí). Se instala con `.claude/build-src/producto1/instalar_producto1.py` a partir
  del zip del libro; ese zip no trae la imagen decorativa `i001…png` (una marca de agua totalmente transparente que el HTML
  cita en cuatro reglas CSS), así que el script la recupera del PDF para que el navegador no pida un 404. Las cifras del
  libro no se tocaron: usa 12,96 km² para la cuenca (una delimitación esquemática a partir de la Resolución 1070 de 2023 y del
  estudio de Inalter, que el propio libro dice que debe reemplazarse por la delimitación cartográfica oficial) mientras la
  plataforma muestra 11,98 km² (1.198 ha) de la delimitación cartográfica.

## Desplegar en Render (gratis)

1. Este repo (`github.com/hotelmalibu/psa-villeros`) ya incluye `render.yaml` en
   la raíz, apuntando a esta carpeta (`rootDir: backend`).
2. En [render.com](https://render.com), inicia sesión (o crea cuenta) y elige
   **New > Blueprint**, conecta tu cuenta de GitHub y selecciona el repo
   `hotelmalibu/psa-villeros`. Render detecta `render.yaml` y configura el
   servicio solo (nombre `psa-villeros-api`, plan free, `JWT_SECRET` generado).
   - Si prefieres hacerlo a mano en vez del Blueprint: **New > Web Service**,
     conecta el repo, Root Directory = `backend`, Build Command = `npm install`,
     Start Command = `npm start`.
3. En **Environment**, confirma que `JWT_SECRET` tiene un valor generado (Render lo
   crea solo si usaste el Blueprint) y ajusta `CORS_ORIGIN` al dominio real:
   `https://psacoveñas.com,https://www.psacoveñas.com` (ver `DEPLOY.md` para el
   detalle del dominio, que es un IDN con "ñ"). Mientras tanto puede quedar en `*`.
4. Cuando termine el deploy, Render te da una URL pública, algo como
   `https://psa-villeros-api.onrender.com`, y al entrar ahí ya se ve el sitio
   completo (este mismo proceso lo sirve). No hace falta tocar `API_BASE` en
   `index.html`: ya es una ruta relativa (`""`), así que llama a la API del
   mismo origen donde esté publicada la página, sea Render o Hostinger.

**Nota sobre el plan gratis de Render:** el servicio se "duerme" tras ~15 min sin
tráfico y el primer request después tarda unos segundos en responder (arranca de
nuevo). Para un uso institucional constante conviene el plan pago más económico
("Starter"), que no se duerme.

## Agregar o cambiar usuarios

No hay base de datos: los usuarios viven en `users.js`, con su contraseña ya
convertida a hash (nunca en texto plano). Para generar el hash de una contraseña
nueva:

```bash
npm run hash -- "la-contraseña-nueva"
```

Copia el resultado en el campo `passHash` del usuario correspondiente en
`users.js`, vuelve a subir el cambio a GitHub y Render redepliega solo.

## Probar en local

```bash
npm install
npm start
```

El servicio queda en `http://localhost:4000`. Para probarlo junto al `index.html`,
cambia temporalmente `API_BASE` a `http://localhost:4000` en el HTML.

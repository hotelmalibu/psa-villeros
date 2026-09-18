# API de autenticación — Plataforma PSA Represa Villeros

Backend mínimo en Node/Express que reemplaza el login simulado del `index.html`.
Verifica usuario + contraseña (hash bcrypt) contra `users.js` y devuelve un JWT
que el frontend guarda en `sessionStorage` para mantener la sesión.

## Endpoints

- `GET /api/health` — verifica que el servicio está vivo.
- `POST /api/auth/login` — body `{ "username": "...", "password": "..." }` → `{ token, user }`.
- `GET /api/auth/me` — header `Authorization: Bearer <token>` → `{ user }`.

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
   crea solo si usaste el Blueprint) y ajusta `CORS_ORIGIN` al dominio real de
   Hostinger cuando lo tengas (por ejemplo `https://psavilleros.tu-dominio.com`).
   Mientras tanto puede quedar en `*`.
4. Cuando termine el deploy, Render te da una URL pública, algo como
   `https://psa-villeros-api.onrender.com`.
5. Copia esa URL en `index.html`, en la línea:
   ```js
   var API_BASE = "https://psa-villeros-api.onrender.com";
   ```
   y vuelve a subir el `index.html` a Hostinger.

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

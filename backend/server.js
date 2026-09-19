const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const zlib = require("zlib");
const path = require("path");
const users = require("./users");

const app = express();
app.use(express.json());

// Sirve el sitio estático (index.html) desde el mismo proceso, para hosts
// (como el despliegue Git de Hostinger) que solo corren esta app de Node y
// no tienen un servidor de archivos estáticos aparte. Busca el index.html
// en varias ubicaciones posibles según cómo se haya desplegado el repo.
//
// Confirmado con /api/debug (ya retirado): Render clona el repo completo,
// así que backend/../index.html existe. Hostinger, en cambio, con el Git
// deploy de su hosting Node, SOLO copia el contenido de este directorio
// (el "Application Root" que se configuró ahí) a una carpeta aislada — el
// resto del repo (incluido el index.html de la raíz) no llega. Por eso
// este mismo index.html también vive copiado en backend/index.html: así
// viaja junto con el código sin importar cuál de los dos "recorta" el repo.
// Si vuelves a editar index.html, acordate de copiarlo también acá.
const INDEX_CANDIDATES = [
  path.join(__dirname, "..", "index.html"), // repo completo (Render)
  path.join(__dirname, "index.html"), // solo se desplegó este directorio (Hostinger)
  path.join(process.cwd(), "index.html"), // cwd distinto a __dirname
];
const INDEX_PATH = INDEX_CANDIDATES.find((p) => {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
});

// Comprime en gzip (en memoria, sin dependencias) los textos y binarios que sí se
// comprimen: HTML, JS, JSON y la cuadrícula de altitud. Las imágenes (webp/jpg) y el
// modelo GLB ya vienen comprimidos, así que se sirven tal cual.
const GZIP_RE = /\.(js|json|bin|html|css|svg)$/;
const gzCache = new Map();
function gzipFile(file) {
  const st = fs.statSync(file);
  const key = file + ":" + st.mtimeMs;
  let buf = gzCache.get(key);
  if (!buf) {
    buf = zlib.gzipSync(fs.readFileSync(file), { level: 9 });
    gzCache.set(key, buf);
  }
  return buf;
}
function acceptsGzip(req) {
  return /gzip/.test(req.headers["accept-encoding"] || "");
}
function sendGzipped(res, file, maxAgeSec) {
  res.set({
    "Content-Encoding": "gzip",
    "Vary": "Accept-Encoding",
    "Cache-Control": "public, max-age=" + maxAgeSec,
  });
  res.type(path.extname(file));
  res.send(gzipFile(file));
}
function staticDir(dir, maxAgeSec, extraHeaders) {
  const root = path.join(__dirname, dir);
  const plain = express.static(root, {
    maxAge: maxAgeSec * 1000,
    setHeaders: (res) => extraHeaders && res.set(extraHeaders),
  });
  return (req, res, next) => {
    if (req.method !== "GET" || !GZIP_RE.test(req.path) || !acceptsGzip(req)) return plain(req, res, next);
    let file;
    try {
      file = path.normalize(path.join(root, decodeURIComponent(req.path)));
      if (!file.startsWith(root + path.sep) || !fs.statSync(file).isFile()) return next();
    } catch (e) {
      return next();
    }
    if (extraHeaders) res.set(extraHeaders);
    sendGzipped(res, file, maxAgeSec);
  };
}

// Teselas de la ortofoto / altitud del Mapa virtual (backend/tiles).
app.use("/tiles", staticDir("tiles", 7 * 86400));
// Modelo 3D (GLB) y librería three.js del visor 3D, alojados localmente.
app.use("/models", staticDir("models", 7 * 86400));
app.use("/vendor", staticDir("vendor", 30 * 86400));
// Imágenes del sitio (nombres con hash del contenido: se pueden cachear un año).
app.use("/img", staticDir("img", 365 * 86400, { "Cache-Control": "public, max-age=31536000, immutable" }));

if (INDEX_PATH) {
  console.log("Sirviendo el sitio estático desde:", INDEX_PATH);
  app.get("/", (req, res) => {
    if (!acceptsGzip(req)) return res.sendFile(INDEX_PATH);
    res.set("Cache-Control", "no-cache");
    res.set({ "Content-Encoding": "gzip", "Vary": "Accept-Encoding" });
    res.type("html");
    res.send(gzipFile(INDEX_PATH));
  });
} else {
  console.warn(
    "AVISO: no se encontró index.html en ninguna ubicación esperada " +
      "(" + INDEX_CANDIDATES.join(", ") + "). Este proceso solo servirá la API."
  );
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.warn(
    "AVISO: falta la variable de entorno JWT_SECRET. Configúrala en Render " +
      "(Settings > Environment) antes de usar esto en producción. Usando un " +
      "secreto temporal solo para desarrollo local."
  );
}
const SECRET = JWT_SECRET || "dev-only-secret-cambia-esto-en-render";
const TOKEN_TTL = "8h";

const allowedOrigins = (process.env.CORS_ORIGIN || "*")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.includes("*") ? true : allowedOrigins,
  })
);

// Limita intentos fallidos por IP+usuario en memoria (suficiente para el tamaño de esta plataforma).
const failedAttempts = new Map();
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(key) {
  const rec = failedAttempts.get(key);
  if (!rec) return false;
  if (Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.delete(key);
    return false;
  }
  return rec.count >= MAX_ATTEMPTS;
}

function registerFailure(key) {
  const rec = failedAttempts.get(key);
  if (!rec || Date.now() - rec.first > WINDOW_MS) {
    failedAttempts.set(key, { count: 1, first: Date.now() });
  } else {
    rec.count += 1;
  }
}

function clearFailures(key) {
  failedAttempts.delete(key);
}

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "psa-villeros-api" });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "Usuario y contraseña son obligatorios." });
  }

  const key = `${req.ip}:${username}`;
  if (isRateLimited(key)) {
    return res.status(429).json({ error: "Demasiados intentos fallidos. Intente de nuevo en unos minutos." });
  }

  const user = users.find((u) => u.username === username);
  const ok = user && bcrypt.compareSync(password, user.passHash);

  if (!ok) {
    registerFailure(key);
    return res.status(401).json({ error: "Usuario o contraseña incorrectos." });
  }

  clearFailures(key);
  const token = jwt.sign(
    { sub: user.username, role: user.role, roleLabel: user.roleLabel, full: user.full },
    SECRET,
    { expiresIn: TOKEN_TTL }
  );
  res.json({
    token,
    user: { username: user.username, role: user.role, roleLabel: user.roleLabel, full: user.full },
  });
});

function authMiddleware(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Falta el token de sesión." });
  try {
    req.auth = jwt.verify(token, SECRET);
    next();
  } catch (e) {
    res.status(401).json({ error: "Sesión inválida o expirada." });
  }
}

app.get("/api/auth/me", authMiddleware, (req, res) => {
  res.json({
    user: {
      username: req.auth.sub,
      role: req.auth.role,
      roleLabel: req.auth.roleLabel,
      full: req.auth.full,
    },
  });
});

// Secciones internas (documentos y portafolio de predios): exigen sesión iniciada Y la clave de acceso.
// Sus datos viven en docs.js y portafolio.js y nunca viajan en el HTML de la página.
const docs = require("./docs");
const portafolio = require("./portafolio");
const DOC_KEY_HASH =
  process.env.DOC_KEY_HASH || "$2a$10$4KRp1JOwicIIlhibWTu0qeSguDY0e21S/Wro5joF2ovPhX0n/G1iu";

// Comprueba la clave; los intentos fallidos se cuentan juntos para ambas secciones.
function claveValida(req, res) {
  const { clave } = req.body || {};
  const key = `${req.ip}:clave`;
  if (isRateLimited(key)) {
    res.status(429).json({ error: "Demasiados intentos fallidos. Intente de nuevo en unos minutos." });
    return false;
  }
  if (typeof clave !== "string" || !clave || !bcrypt.compareSync(clave.trim(), DOC_KEY_HASH)) {
    registerFailure(key);
    res.status(401).json({ error: "Clave incorrecta." });
    return false;
  }
  clearFailures(key);
  return true;
}

app.post("/api/docs", authMiddleware, (req, res) => {
  if (claveValida(req, res)) res.json(docs);
});

app.post("/api/portafolio", authMiddleware, (req, res) => {
  if (claveValida(req, res)) res.json(portafolio);
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`psa-villeros-api escuchando en el puerto ${PORT}`);
});

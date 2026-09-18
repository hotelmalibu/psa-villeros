const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const users = require("./users");

const app = express();
app.use(express.json());

// Sirve el sitio estático (index.html) desde el mismo proceso, para hosts
// (como el despliegue Git de Hostinger) que solo corren esta app de Node y
// no tienen un servidor de archivos estáticos aparte. Busca el index.html
// en varias ubicaciones posibles según cómo se haya clonado el repo.
const INDEX_CANDIDATES = [
  path.join(__dirname, "..", "index.html"), // repo completo, backend/ como subcarpeta
  path.join(__dirname, "index.html"), // solo se clonó/copió backend/
  path.join(process.cwd(), "index.html"), // cwd distinto a __dirname
];
const INDEX_PATH = INDEX_CANDIDATES.find((p) => {
  try {
    return fs.existsSync(p);
  } catch (e) {
    return false;
  }
});

if (INDEX_PATH) {
  console.log("Sirviendo el sitio estático desde:", INDEX_PATH);
  app.get("/", (req, res) => res.sendFile(INDEX_PATH));
} else {
  console.warn(
    "AVISO: no se encontró index.html en ninguna ubicación esperada " +
      "(" + INDEX_CANDIDATES.join(", ") + "). Este proceso solo servirá la API."
  );
}

// Endpoint temporal de diagnóstico — ver por qué "/" no encuentra el index.html
// en este host. Borrar una vez resuelto.
app.get("/api/debug", (req, res) => {
  function safeListDir(p) {
    try {
      return fs.readdirSync(p);
    } catch (e) {
      return "ERROR: " + e.message;
    }
  }
  res.json({
    __dirname,
    cwd: process.cwd(),
    indexCandidates: INDEX_CANDIDATES,
    indexFound: INDEX_PATH || null,
    lsDirname: safeListDir(__dirname),
    lsParent: safeListDir(path.join(__dirname, "..")),
    lsCwd: safeListDir(process.cwd()),
  });
});

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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`psa-villeros-api escuchando en el puerto ${PORT}`);
});

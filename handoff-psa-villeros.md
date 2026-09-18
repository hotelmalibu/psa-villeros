# Plataforma PSA — Represa Villeros (Coveñas, Sucre)
### Ficha de continuidad para Claude Code

Este documento resume el estado del proyecto para que puedas continuar el trabajo directamente en Claude Code, sin necesidad de repasar todo el historial de esta conversación.

---

## 1. Contexto del proyecto

| Campo | Valor |
|---|---|
| Contrato | Concurso de Méritos COV‑CMA‑010‑2026 |
| Cliente / contratante | Municipio de Coveñas, Sucre |
| Contratista | Consorcio Servicios Ambientales 2026 (NIT 902.083.846‑1) |
| Representante legal | Jessica Andrea Tobías Pérez |
| Autoridad ambiental | CARSUCRE (concurrencia de CVS por jurisdicción en Córdoba) |
| Financiador ancla | Batallón de Infantería de Marina N.º 6 |
| Modalidad PSA | Regulación y calidad hídrica |
| Valor del contrato | $264.399.995 COP |
| Vigencia | 27 jul 2026 – 27 oct 2026 (3 meses) |

**Objetivo del esquema:** Perfil de un esquema de Pago por Servicios Ambientales (PSA) para conservar el recurso hídrico de la microcuenca que alimenta la Represa Villeros, de la cual depende el acueducto de Coveñas.

**Métricas clave de la cuenca:**
- Cuenca abastecedora: 12,96 km² (1.296 ha)
- Espejo de agua de la represa: 22,20 ha
- Área de intervención: 60 predios, 294 ha
- Cota de la represa: 18 msnm
- Coordenadas oficiales de la represa: 9°22'54.5"N, 75°41'49"W (9.381806, ‑75.696944) — fuente: Anexo 4, PPTX de socialización

---

## 2. Qué es esta plataforma

Es un **portal institucional de una sola página HTML autocontenida** (sin backend, sin build step) que documenta el perfil del esquema de PSA para uso del equipo técnico, la supervisión municipal y consulta pública. Incluye:

1. **Presentación** — objetivo, meta, sistema de abastecimiento, aliados institucionales, financiación, antecedentes (línea de tiempo de 19 años de expedientes), problema en cifras (sedimentación, calidad del agua).
2. **Componentes** — los 7 componentes técnicos del equipo consultor, modalidades de intervención por predio, índice de prioridad predial (MCDA), ficha técnica del proyecto.
3. **Participación** — cronología de socialización, actores institucionales, mecanismo de participación, galería de fotos reales del Taller de Articulación N.º 3, formulario de contacto (demo, no envía datos).
4. **Atlas** — visor SIG con Leaflet: zonificación ambiental, amenaza por incendio, cobertura del suelo, modelo digital de elevación (DEM), marcador de la represa.
5. **Recorrido virtual** — placeholder/demo.
6. **Documentos** — repositorio de informes, mapas y anexos (enlaces a Google Drive), protegido por rol.

Autenticación es **simulada en el frontend** (no hay backend real): dos usuarios de demostración hardcodeados en un objeto JS.

---

## 3. Ubicación de archivos

- **Archivo maestro (fuente de la verdad):** este chat mantiene la copia autoritativa en `/home/claude/plataforma-psa-villeros-v4.html` dentro del entorno de Claude.ai — **no es accesible desde tu máquina**. Debes descargar la última versión publicada (ver abajo) y usarla como punto de partida en tu repo.
- **Archivo publicado para descarga:** compartido en esta conversación como `plataforma-psa-villeros.html` (~5,14 MB).
- **Artifact publicado (vista previa en vivo):** https://claude.ai/artifact/BimBztVkQJAZRSYFTEJV53

**Recomendación:** descarga el HTML compartido en este chat y guárdalo en tu repositorio local, por ejemplo como `index.html`, antes de abrir el proyecto en Claude Code.

---

## 4. Arquitectura técnica

- **Un solo archivo `.html`**, ~5,14 MB, sin build step. Se abre directo en el navegador.
- **Sin dependencias de red en tiempo de ejecución**, salvo Google Fonts (`Space Grotesk`, `Manrope`, `Space Mono` vía `fonts.googleapis.com`).
- **Leaflet 1.9.4** está **embebido inline** en el `<script>` (no se carga desde CDN).
- **JavaScript vanilla**, sin frameworks. La UI se arma en tiempo de carga mediante funciones `renderX()` que leen arreglos de datos JS y generan HTML vía `innerHTML`.
- **Navegación tipo SPA**: botones con `data-view="..."` en el sidebar controlan qué `<section>` se muestra.
- **Activos embebidos en base64**: fotos de la galería, logo del escudo de Coveñas (PNG transparente), imagen DEM, GeoJSON de zonificación — todo dentro del mismo archivo, sin carpeta de assets externa.

### Arreglos de datos clave (JS, dentro del único `<script>`)

| Variable | Contenido |
|---|---|
| `METRICAS` | Tarjetas de métricas del hero (cuenca, espejo de agua, predios, sedimentación) |
| `COMPONENTES` | Los 7 componentes técnicos (Dirección, hídrico, SIG, económico, biótico, social, jurídico) |
| `MODALIDADES` | Conservación / Rehabilitación / Restauración por predio |
| `MCDA` | Criterios ponderados del índice de prioridad predial |
| `TIMELINE` | Cronología de socialización (Participación) |
| `ACTORES` | Tabla de actores institucionales y su rol |
| `ALLIES` | Logos y roles de aliados institucionales (Presentación) |
| `GALERIA` / `GALERIA_IMG` | Metadatos de fotos + diccionario de imágenes base64 (Participación) |
| `DOCS` | Repositorio de documentos por categoría (Documentos) |
| `ZONIFICACION_GEOJSON` | GeoJSON embebido para la capa de zonificación en el Atlas |
| `DEM_IMG_SRC` | Imagen PNG del DEM, embebida en base64 |
| `REPRESA_MARKER` | Coordenadas del marcador de la represa en Leaflet |

Cada sección tiene su función `render*()` (`renderComponentes()`, `renderParticipacion()`, etc.), normalmente invocadas todas juntas al cargar/iniciar sesión.

---

## 5. Sistema de diseño

- **Tema oscuro por defecto** (tokens CSS en `:root`): `--paper`, `--paper-raised`, `--ink`, `--navy`, `--gold`, `--green`, etc. Existe una paleta clara alternativa bajo `:root[data-theme="light"]`, con un botón de alternancia (2 estados: oscuro ⇄ claro).
- **Tipografía**: Space Grotesk (encabezados), Manrope (cuerpo), Space Mono (cifras/datos monoespaciados).
- **Iconos de navegación**: SVG en línea dibujados a mano (viewBox 20×20, `stroke=currentColor`, stroke-width 1.6) — no dependen de librerías de iconos externas.

---

## 6. Fuentes de datos reales incorporadas

- **Informe de Supervisión N.º 1** (27 jul – 26 ago 2026): valor del contrato, fechas, actividades con avance físico, indicador PDM (3202043), línea estratégica "Coveñas + Social e Influyente".
- **Acta de Articulación N.º 3** (3 sept 2026, Biblioteca Pública de Coveñas): coordenadas oficiales de la represa, matriz de compromisos por entidad, y **4 fotos reales** del taller (extraídas del PDF original vía `pdfimages`, redimensionadas y comprimidas a JPEG).

---

## 7. Credenciales de demostración

| Usuario | Contraseña | Rol |
|---|---|---|
| `demo.tecnico` | `Villeros2026` | Equipo técnico / supervisión (acceso completo, incluida sección Documentos) |
| `demo.publico` | `covenas2026` | Consulta pública (acceso limitado) |

---

## 8. Cambios más recientes (última sesión)

- H1 y texto de introducción de **Presentación** reenfocados para liderar con "Perfil del esquema de Pago por Servicios Ambientales..." en vez de "Formular...".
- **Ficha técnica del proyecto** (Componentes) simplificada: solo Sector, Plan de Desarrollo, Indicador de producto y Fuente de financiación (se removieron valor del contrato, tabla de avance físico, plazo y la sección de hitos formales).
- Los **7 componentes técnicos** ahora llevan una numeración visible ("COMPONENTE 01/07" … "07/07").
- **Iconos del menú lateral** reemplazados por SVG en línea (antes eran glifos Unicode simples).
- Fotos reales de la galería en **Participación** verificadas en un navegador headless (Playwright): las 4 imágenes cargan correctamente. Si en algún momento no las ves en el link publicado, probablemente sea caché del navegador — probá refrescar forzado (Ctrl/Cmd+Shift+R) o abrir en una pestaña nueva.
- Rediseño visual completo a **tema oscuro por defecto** con paleta azul marino.
- Corrección gramatical de "embalse" → "represa" en las 16 apariciones del texto.
- Pie de página institucional agregado a todas las vistas.

---

## 9. Cambios de la sesión en Claude Code (2026-09-17)

- **Atlas — 5 capas SIG reales agregadas** al mapa Leaflet: Cuenca abastecedora, Catastro (137 predios), Vías (16 tramos), Drenaje (91 tramos dentro del área de estudio) y Represa (polígono real del espejo de agua, no solo el punto). Convertidas desde los shapefiles originales de `REPRESA VILLEROS.zip` (RESULTADOS/), reproyectadas a WGS84. Con esto el Atlas ya tiene las 8 capas completas (las 3 que ya existían + estas 5).
- **Aliados institucionales simplificados**: la tarjeta de Presentación ahora solo muestra Municipio de Coveñas y Consorcio Servicios Ambientales 2026 (se quitaron CARSUCRE, CVS, Batallón I.M. N.º 6, IT Creativos y VEA de esa tarjeta puntual — siguen mencionados como texto en otras secciones donde correspondía).
- **Rediseño de paleta**: azules más oscuros y profundos (fondo casi negro-azulado, tarjetas con más contraste) para un acabado más premium. Mismo sistema de diseño, solo tokens de color ajustados en `:root`.
- **Autenticación real**: se reemplazó el login hardcodeado en el JS por una API real (`backend/`, Node/Express + JWT + contraseñas con hash bcrypt), pensada para desplegarse en Render. El `index.html` ahora hace `fetch` a esa API y guarda la sesión en `sessionStorage`. Ver [`backend/README.md`](backend/README.md).
- **GeoServer — paquete preparado, no desplegado todavía**: `geoserver/` trae un `Dockerfile`, los 5 shapefiles originales y un script de publicación vía REST API, listos para desplegar en Render cuando se decida dar ese paso (requiere un plan con disco persistente). No se probó en vivo por falta de Docker/Java en este entorno — revisar bien el primer despliegue. Ver [`geoserver/README.md`](geoserver/README.md).
- **Arquitectura de despliegue definida**: Hostinger para el HTML estático, Render para los servicios (API de auth, y GeoServer si se activa). Guía completa en [`DEPLOY.md`](DEPLOY.md).

## 10. Pendientes / próximos pasos sugeridos

1. **Desplegar el backend de auth en Render** y actualizar `API_BASE` en `index.html` con la URL real (hoy tiene un placeholder: `https://psa-villeros-api.onrender.com`).
2. **Subir `index.html` a Hostinger** (manual — necesita las credenciales de la cuenta, ver `DEPLOY.md`).
3. **Logos institucionales faltantes** (si se decide volver a mostrarlos): no se encontraron en Drive los logos oficiales de CARSUCRE, CVS, Batallón de Infantería de Marina N.º 6 ni ECOPETROL.
4. **GeoServer**: desplegarlo y verificarlo en Render cuando se necesite servir las capas como WMS/WFS en vez de GeoJSON embebido (ver `geoserver/README.md` para el porqué no es urgente).
5. Posible pulido adicional de los iconos de navegación u otros detalles visuales, a discreción.

---

## 10. Cómo continuar en Claude Code

1. Descargá el archivo `plataforma-psa-villeros.html` compartido en este chat y guardalo en tu repositorio (por ejemplo, como `index.html`).
2. Abrí el proyecto en Claude Code apuntando a esa carpeta.
3. No hay build step: para probar cambios, simplemente abrí el archivo `.html` directo en el navegador (`open index.html` o equivalente).
4. Todo el JS vive en un único bloque `<script>` al final del `<body>`; el CSS vive en un único bloque `<style>` en el `<head>`. Para editar una sección puntual, buscá primero el `<section id="view-...">` correspondiente en el HTML y luego su función `render*()` en el JS.
5. Si necesitás volver a extraer o reemplazar imágenes embebidas en base64, tené en cuenta que el archivo pesa ~5,14 MB — es normal, no es un error.

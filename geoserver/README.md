# GeoServer — Plataforma PSA Represa Villeros (opcional, para más adelante)

Esto es un paquete **listo para desplegar pero no verificado en vivo** (este entorno
no tiene Docker/Java para levantarlo y probarlo localmente). Trátalo como un punto
de partida sólido, no como algo ya probado end-to-end — la primera vez que lo
despliegues, revisa que cada paso responda lo esperado antes de confiar en él.

## Por qué esto es opcional

El Atlas de la plataforma **ya funciona hoy** sirviendo las 8 capas (incluidas las
5 reales nuevas: Cuenca, Catastro, Vías, Drenaje, Represa) como GeoJSON embebido
en el propio `index.html` — sin necesitar ningún servidor SIG. GeoServer solo suma
valor si más adelante quieres:
- Servir capas muy grandes sin inflar el HTML.
- Permitir consultas espaciales (WFS) desde otros sistemas.
- Actualizar la cartografía sin tener que editar y volver a publicar el HTML.

## Requisito importante: disco persistente

GeoServer necesita guardar su configuración en disco. El plan **gratis** de Render
usa almacenamiento efímero — cada vez que el servicio se reinicia o se redeploya,
perderías las capas publicadas. Para que esto sea confiable necesitas un plan de
Render con **disco persistente** (Starter o superior + "Add Disk" en la
configuración del servicio, montado por ejemplo en `/opt/geoserver_data`).

## Pasos para desplegar en Render

1. Sube esta carpeta `geoserver/` (junto con `data/`, que ya trae los 5 shapefiles
   reales en su proyección original) a un repositorio de GitHub.
2. En Render: **New > Web Service > Docker**, apuntando a esta carpeta
   (Root Directory = `geoserver`, usa el `Dockerfile` incluido).
3. Agrega un disco persistente (Settings > Disks) montado en la ruta de datos de
   GeoServer, y elige un plan pago (no free) — sin esto perderás la configuración
   en cada redeploy.
4. En **Environment**, cambia `GEOSERVER_ADMIN_PASSWORD` a una clave real (no
   dejes la del Dockerfile).
5. Cuando el servicio esté arriba (puede tardar varios minutos la primera vez —
   GeoServer es una aplicación Java pesada), corre `publish-layers.sh` desde tu
   máquina para publicar las 5 capas vía su API REST:
   ```bash
   GEOSERVER_URL=https://tu-geoserver.onrender.com \
   GEOSERVER_PASS=la-clave-que-pusiste \
   ./publish-layers.sh
   ```
6. Verifica que responda, por ejemplo:
   `https://tu-geoserver.onrender.com/geoserver/villeros/wms?service=WMS&request=GetCapabilities`

## Nota sobre Drenaje y Represa

Los shapefiles originales de estas dos capas cubren una región mucho más amplia
que la microcuenca (drenajes y represas de varios municipios). En el `index.html`
ya filtramos esto al convertir a GeoJSON. Si publicas estas dos capas en GeoServer
tal cual, verás todo el drenaje regional — puedes acotarlo con un filtro CQL en el
`GetMap`/`GetFeature` (ej. `BBOX` alrededor de la represa) o recortando el
shapefile antes de subirlo.

## Capas que faltan por incluir

Las 3 capas que ya existían (Zonificación, Amenaza por incendio, Cobertura del
suelo) no están en este paquete — solo agregué las 5 nuevas que pediste. Sus
shapefiles originales están en `RESULTADOS/Zonificacion_Final_Villeros.*`,
`RESULTADOS/AMENAZA DE INCENDIO.*` y `RESULTADOS/Cobertura_Villeros___.*` dentro
de `REPRESA VILLEROS.zip`; se pueden agregar al `data/` y a
`publish-layers.sh` con el mismo patrón el día que se necesite.

## Conectar el Atlas del sitio a GeoServer en vez del GeoJSON embebido

Una vez confirmado que GeoServer responde, en `index.html` (función
`initLeafletMap`) se reemplazarían los `L.geoJSON(CUENCA_GEOJSON, ...)` etc. por
capas WMS, por ejemplo:

```js
var cuencaLayer = L.tileLayer.wms("https://tu-geoserver.onrender.com/geoserver/villeros/wms", {
  layers: "villeros:cuenca",
  format: "image/png",
  transparent: true
});
```

Esto es un cambio pequeño y aislado — no hace falta tocarlo hasta que GeoServer
esté desplegado y verificado.

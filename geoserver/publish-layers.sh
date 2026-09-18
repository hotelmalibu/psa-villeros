#!/usr/bin/env bash
# Publica las 5 capas SIG reales (Cuenca, Catastro, Vías, Drenaje, Represa) en un
# GeoServer ya corriendo, como WMS/WFS. Ejecutar UNA VEZ después de que el
# contenedor esté arriba (Render > Logs debe decir que GeoServer terminó de iniciar).
#
# Uso:
#   GEOSERVER_URL=https://tu-geoserver.onrender.com \
#   GEOSERVER_USER=admin GEOSERVER_PASS=cambia-esta-clave \
#   ./publish-layers.sh

set -euo pipefail

URL="${GEOSERVER_URL:?Define GEOSERVER_URL, ej: https://tu-geoserver.onrender.com}"
USER="${GEOSERVER_USER:-admin}"
PASS="${GEOSERVER_PASS:?Define GEOSERVER_PASS}"
WORKSPACE="villeros"
DATA_DIR="/opt/data/villeros"   # ruta DENTRO del contenedor (ver Dockerfile)

auth=(-u "${USER}:${PASS}")

echo "== Creando workspace '${WORKSPACE}' =="
curl -s -f "${auth[@]}" -X POST -H "Content-type: text/xml" \
  -d "<workspace><name>${WORKSPACE}</name></workspace>" \
  "${URL}/geoserver/rest/workspaces" || echo "  (puede que ya exista, seguimos)"

publish_layer() {
  local store_name="$1"
  local shapefile="$2"

  echo "== Publicando ${store_name} =="
  curl -s -f "${auth[@]}" -X POST -H "Content-type: text/xml" \
    -d "<dataStore>
          <name>${store_name}</name>
          <connectionParameters>
            <url>file://${DATA_DIR}/${shapefile}</url>
          </connectionParameters>
        </dataStore>" \
    "${URL}/geoserver/rest/workspaces/${WORKSPACE}/datastores"

  curl -s -f "${auth[@]}" -X POST -H "Content-type: text/xml" \
    -d "<featureType><name>${store_name}</name></featureType>" \
    "${URL}/geoserver/rest/workspaces/${WORKSPACE}/datastores/${store_name}/featuretypes"
}

publish_layer "cuenca"    "Cuenca_villeros.shp"
publish_layer "catastro"  "Catastro_villeros.shp"
publish_layer "vias"      "VIA_VILLEROS.shp"
publish_layer "drenaje"   "Drenaje Villeros.shp"
publish_layer "represa"   "Represa_Villeros.shp"

echo "== Listo. Capas disponibles como WMS/WFS en: =="
echo "   ${URL}/geoserver/${WORKSPACE}/wms"
echo "   ${URL}/geoserver/${WORKSPACE}/wfs"

FROM kartoza/geoserver:2.25.2

# Shapefiles reales del proyecto (fuente: RESULTADOS/ dentro de REPRESA VILLEROS.zip),
# en su proyección original — GeoServer reproyecta al vuelo para WMS/WFS.
COPY data/ /opt/data/villeros/

# Credenciales de administración de GeoServer (cámbialas en Render > Environment).
ENV GEOSERVER_ADMIN_USER=admin
ENV GEOSERVER_ADMIN_PASSWORD=cambia-esta-clave

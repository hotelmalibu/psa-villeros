// Documentos del contrato: los tres productos en su versión final, cada uno con su lector en línea (flipbook en
// backend/flipbook). Se entrega únicamente tras iniciar sesión Y validar la clave de acceso a documentos
// (POST /api/docs). «doc» es el identificador que POST /api/flipbook/acceso traduce en la dirección del lector.
module.exports = {
  "groups": [
    {
      "titulo": "Producto 1 · Diagnóstico y línea base",
      "docs": [
        {
          "n": "Diagnóstico del área de estudio — documento técnico (versión final)",
          "s": "Producto 1 · agosto de 2026 · línea base consolidada, análisis cartográfico y diagnóstico de servicios hidrológicos",
          "fmt": "DOCX",
          "url": "/flipbook/producto1.html",
          "doc": "producto1"
        }
      ]
    },
    {
      "titulo": "Producto 2 · Perfil del esquema de PSA",
      "docs": [
        {
          "n": "Documento técnico del esquema de PSA — versión final",
          "s": "Producto 2 · septiembre de 2026 · con anexos jurídicos, cartográficos y bióticos",
          "fmt": "DOCX",
          "url": "/flipbook/producto2.html",
          "doc": "producto2"
        }
      ]
    },
    {
      "titulo": "Producto 3 · Modelo de gestión y prospectiva predial",
      "docs": [
        {
          "n": "Modelo de gestión y prospectiva predial del esquema de PSA — versión final",
          "s": "Producto 3 · octubre de 2026 · edición digital de 34 páginas",
          "fmt": "PDF",
          "url": "/flipbook/producto3.html",
          "doc": "producto3"
        }
      ]
    }
  ]
};

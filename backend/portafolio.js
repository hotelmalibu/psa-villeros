// Portafolio de los 9 predios priorizados: datos económicos por predio.
// Viven en el servidor (no en index.html) y solo se entregan por POST /api/portafolio,
// que exige sesión iniciada y la clave de acceso.
//
// - avalúo y modalidad: documento técnico del esquema de PSA / catastro IGAC (vigencia 1 ene 2026).
//   Modalidad por umbral de cobertura natural (ESA WorldCover 2021, Mapa 12): >= 60 % conservación,
//   30-60 % rehabilitación, < 30 % restauración.
// - incentivo: del documento técnico en P02, P03, P06, P08 y P09. En los demás predios se calcula con
//   el mismo método: tarifa de referencia x área, limitada al 15 % del avalúo catastral.

const TARIFA_HA = 1500000; // COP por hectárea al año
const TOPE_PCT = 0.15;

const BASE = [
  { id: "P02", prioridad: "1-Alta", area: 11.006, modalidad: "Rehabilitación", avaluo: 328791000, incentivo: 16509000 },
  { id: "P03", prioridad: "1-Alta", area: 4.069, modalidad: "Rehabilitación", avaluo: 58947000, incentivo: 6103500 },
  { id: "P06", prioridad: "1-Alta", area: 33.785, modalidad: "Conservación", avaluo: 195595000, incentivo: 8071097 },
  { id: "P07", prioridad: "1-Alta", area: 42.187, modalidad: "Restauración", avaluo: 342655000 },
  { id: "P08", prioridad: "1-Alta", area: 25.956, modalidad: "Rehabilitación", avaluo: 373492000, incentivo: 38934000 },
  { id: "P09", prioridad: "1-Alta", area: 11.775, modalidad: "Rehabilitación", avaluo: 302518000, incentivo: 17231507 },
  { id: "P17", prioridad: "2-Media", area: 12.964, modalidad: "Restauración", avaluo: 237301000 },
  { id: "P18", prioridad: "2-Media", area: 5.33, modalidad: "Restauración", avaluo: 175760000 },
  { id: "P19", prioridad: "2-Media", area: 2.536, modalidad: "Rehabilitación", avaluo: 55278000 },
];

const predios = BASE.map((p) => {
  const tope = Math.round(p.avaluo * TOPE_PCT);
  const calculado = !p.incentivo;
  const incentivo = calculado ? Math.min(Math.round(TARIFA_HA * p.area), tope) : p.incentivo;
  return {
    id: p.id,
    prioridad: p.prioridad,
    area: p.area,
    modalidad: p.modalidad,
    avaluo: p.avaluo,
    avaluoHa: Math.round(p.avaluo / p.area),
    tope,
    incentivo,
    calculado,
    usoTope: Math.round((incentivo / tope) * 1000) / 10,
  };
});

const suma = (k) => predios.reduce((a, p) => a + p[k], 0);
const totales = { area: Math.round(suma("area") * 1000) / 1000, avaluo: suma("avaluo"), tope: suma("tope"), incentivo: suma("incentivo") };
totales.avaluoHa = Math.round(totales.avaluo / totales.area);

module.exports = { predios, totales };

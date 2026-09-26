// Datos económicos de la versión final del Producto 2 (documento técnico del esquema de PSA), por predio y por aliado.
// Viven en el servidor (no en index.html) y solo se entregan por POST /api/economia, que exige sesión iniciada y
// la clave de acceso.
//
// - matriz: Tabla 7 (matriz consolidada de los 60 predios). Área SIG: capa predios_intervencion_covenas del GeoPackage
//   maestro del proyecto; valor catastral, modalidad, prioridad e índice final y costo anual final del incentivo
//   (liquidado sobre el área elegible = mínimo entre el área SIG y la catastral). Costo 0: costo de oportunidad cero,
//   con piso mínimo por definir. Los predios se ordenan por código; el orden no refleja prioridad.
// - poligono: Tablas 20 y 23 (los 9 predios dentro del polígono estricto de la cuenca): áreas SIG, catastral y elegible,
//   avalúo catastral (IGAC, vigencia 1 ene 2026), topes legales del 15 %, incentivo anual final y posición en el
//   ordenamiento del índice final sobre los 60 predios.
// - aliados: Tabla 28 (cuantificación propuesta por aliado). Es una propuesta sometida al equipo técnico de la Secretaría
//   de Desarrollo Social; ningún monto constituye, a la fecha, un compromiso formalizado.

const MATRIZ = [
  ["P01", 7.614, 163190000, "Restauración / reconversión", "Media", 50.8, 9330564],
  ["P02", 11.006, 328791000, "Rehabilitación (mixto)", "Muy alta", 56.2, 12964650],
  ["P03", 4.069, 58947000, "Rehabilitación (mixto)", "Muy alta", 58.1, 5869500],
  ["P04", 0.879, 9993000, "Conservación", "Muy alta", 60.6, 0],
  ["P05", 2.433, 44945000, "Conservación", "Muy alta", 59.6, 0],
  ["P06", 33.785, 195595000, "Conservación", "Muy alta", 68.2, 7390841],
  ["P07", 42.187, 342655000, "Restauración / reconversión", "Muy baja", 36.3, 22918200],
  ["P08", 25.956, 373492000, "Rehabilitación (mixto)", "Media", 52.6, 16581000],
  ["P09", 11.775, 302518000, "Rehabilitación (mixto)", "Alta", 55.5, 17231507],
  ["P10", 2.213, 181689000, "Conservación", "Muy alta", 59.7, 0],
  ["P11", 5.727, 311912000, "Restauración / reconversión", "Media", 51.7, 7750800],
  ["P12", 1.618, 290809000, "Rehabilitación (mixto)", "Alta", 53.8, 0],
  ["P13", 7.665, 471385000, "Restauración / reconversión", "Media", 48.2, 9512816],
  ["P14", 6.273, 252300000, "Restauración / reconversión", "Baja", 47.7, 6913950],
  ["P15", 13.669, 614068000, "Rehabilitación (mixto)", "Baja", 45.3, 15689850],
  ["P16", 0.666, 37154000, "Restauración / reconversión", "Media", 48.2, 0],
  ["P17", 12.964, 237301000, "Restauración / reconversión", "Muy baja", 37.8, 18720300],
  ["P18", 5.33, 175760000, "Restauración / reconversión", "Muy baja", 42.8, 0],
  ["P19", 2.536, 55278000, "Rehabilitación (mixto)", "Media", 48.3, 0],
  ["P20", 10.297, 656892000, "Restauración / reconversión", "Baja", 44.9, 15445500],
  ["P21", 1.378, 41825000, "Restauración / reconversión", "Baja", 45.2, 0],
  ["P22", 8.665, 160300000, "Restauración / reconversión", "Baja", 44.2, 9564750],
  ["P23", 0.493, 17406000, "Conservación", "Alta", 56.1, 0],
  ["P24", 0.05, 35215000, "Conservación", "Muy alta", 59.1, 0],
  ["P25", 1.891, 83838000, "Conservación", "Muy alta", 57.5, 0],
  ["P26", 6.334, 592485000, "Restauración / reconversión", "Muy baja", 42.5, 9501000],
  ["P27", 0.098, 21344000, "Conservación", "Muy alta", 56.6, 0],
  ["P28", 0.071, 3554000, "Rehabilitación (mixto)", "Baja", 45.8, 0],
  ["P29", 0.246, 8313000, "Rehabilitación (mixto)", "Media", 50.2, 0],
  ["P30", 0.192, 10473000, "Conservación", "Muy alta", 57.6, 0],
  ["P31", 0.085, 3546000, "Conservación", "Media", 51.5, 0],
  ["P32", 0.645, 149723000, "Conservación", "Alta", 54.3, 0],
  ["P33", 3.433, 417337000, "Rehabilitación (mixto)", "Baja", 46, 5149500],
  ["P34", 0.334, 12435000, "Conservación", "Alta", 53.4, 0],
  ["P35", 0.15, 243176000, "Rehabilitación (mixto)", "Baja", 47.1, 0],
  ["P36", 0.207, 6995000, "Rehabilitación (mixto)", "Media", 49.7, 0],
  ["P37", 0.058, 22099000, "Conservación", "Media", 49.7, 0],
  ["P38", 0.037, 125662000, "Conservación", "Muy alta", 62.6, 0],
  ["P39", 1.14, 34512000, "Restauración / reconversión", "Baja", 47.9, 0],
  ["P40", 0.144, 14671000, "Conservación", "Muy alta", 56.9, 0],
  ["P41", 13.17, 930557000, "Restauración / reconversión", "Muy baja", 41, 19755000],
  ["P42", 2.383, 434206000, "Restauración / reconversión", "Baja", 46.4, 0],
  ["P43", 0.376, 12476000, "Rehabilitación (mixto)", "Baja", 44.7, 0],
  ["P44", 2.705, 84516000, "Restauración / reconversión", "Muy baja", 42.5, 0],
  ["P45", 1.428, 65726000, "Restauración / reconversión", "Baja", 43.1, 0],
  ["P46", 0.425, 132960000, "Conservación", "Media", 52.6, 0],
  ["P47", 20.502, 698507000, "Restauración / reconversión", "Muy baja", 35.7, 15509400],
  ["P48", 0.422, 7219000, "Rehabilitación (mixto)", "Alta", 53.7, 0],
  ["P49", 0.101, 1065000, "Conservación", "Alta", 54.7, 0],
  ["P50", 0.964, 196587000, "Conservación", "Media", 51.1, 0],
  ["P51", 0.9, 31718000, "Conservación", "Alta", 52.7, 0],
  ["P52", 0.028, 9637000, "Restauración / reconversión", "Muy baja", 36.8, 0],
  ["P53", 4.513, 350034000, "Restauración / reconversión", "Muy baja", 39.9, 6769500],
  ["P54", 0.701, 38581000, "Conservación", "Alta", 53.5, 0],
  ["P55", 0.732, 57992000, "Conservación", "Alta", 53.2, 0],
  ["P56", 0.092, 1827000, "Conservación", "Alta", 53.9, 0],
  ["P57", 4.844, 166674000, "Restauración / reconversión", "Muy baja", 42.5, 7266000],
  ["P58", 0.088, 2135000, "Conservación", "Alta", 55.5, 0],
  ["P59", 0.228, 47101000, "Restauración / reconversión", "Muy baja", 35.7, 0],
  ["P60", 5.08, 265366000, "Rehabilitación (mixto)", "Muy baja", 41.5, 7620000],
];

const matriz = MATRIZ.map(([id, area, avaluo, modalidad, clase, indice, costo]) => ({ id, area, avaluo, modalidad, clase, indice, costo }));

// id, sig, cat, eleg, avaluo, topeHa, tope, coHa, incentivo, pctTopeHa, pctAvaluo, origen, modalidad, indice, posicion
const POLIGONO = [
  ["P02", 11.006, 8.64, 8.64, 328791000, 3337200, 49318650, 1500000, 12964650, 45, 26.3, "Elegible = catastral", "Rehabilitación", 56.2, 12],
  ["P03", 4.069, 3.91, 3.91, 58947000, 2259633, 8842050, 1500000, 5869500, 66, 66.4, "Elegible = catastral", "Rehabilitación", 58.1, 7],
  ["P06", 33.785, 30.94, 30.94, 195595000, 948340, 29339250, 238896, 7390841, 25, 25.2, "Elegible = catastral", "Conservación", 68.2, 1],
  ["P07", 42.187, 15.28, 15.28, 342655000, 3160437, 51398250, 1500000, 22918200, 47, 44.6, "Elegible = catastral", "Restauración", 36.3, 58],
  ["P08", 25.956, 11.05, 11.05, 373492000, 3336529, 56023800, 1500000, 16581000, 45, 29.6, "Elegible = catastral", "Rehabilitación", 52.6, 26],
  ["P09", 11.775, 12.17, 11.775, 302518000, 3337200, 45377700, 1463398, 17231507, 44, 38.0, "Elegible = SIG", "Rehabilitación", 55.5, 15],
  ["P17", 12.964, 12.48, 12.48, 237301000, 2852130, 35595150, 1500000, 18720300, 53, 52.6, "Elegible = catastral", "Restauración", 37.8, 56],
  ["P18", 5.33, 6.09, 5.33, 175760000, 3279251, 26364000, 0, 0, 0, 0, "Costo de oportunidad cero; piso pendiente", "Restauración", 42.8, 49],
  ["P19", 2.536, 3.31, 2.536, 55278000, 2507214, 8291700, 0, 0, 0, 0, "Costo de oportunidad cero; piso pendiente", "Rehabilitación", 48.3, 34],
];

const predios = POLIGONO.map(([id, sig, cat, eleg, avaluo, topeHa, tope, coHa, incentivo, pctTopeHa, pctAvaluo, origen, modalidad, indice, posicion]) =>
  ({ id, sig, cat, eleg, avaluo, topeHa, tope, coHa, incentivo, pctTopeHa, pctAvaluo, origen, modalidad, indice, posicion }));

const totales = { sig: 149.608, cat: 103.87, eleg: 101.941, avaluo: 2070337000, tope: 310550550, incentivo: 101675998, pctAvaluo: 32.7 };
const positivos = { n: 7, sig: 141.742, cat: 94.475, eleg: 94.075, avaluo: 1839299000, tope: 275894850, incentivo: 101675998, pctAvaluo: 36.9 };

// Referencia de magnitud para P18 y P19 (costo de oportunidad cero): valor máximo a la tarifa de trabajo de $1.500.000
// por hectárea elegible; no constituye una asignación del modelo.
const pisoReferencia = [{ id: "P18", valor: 7995000 }, { id: "P19", valor: 3804000 }];

const aliados = [
  { aliado: "Batallón de Infantería de Marina No. 6 (financiador ancla)", compromiso: "$103.110.378 por año (42 % del incentivo)",
    base: "Obligado directo por la Resolución 1070 de 2023. Su compromiso se aplica en el orden de vinculación del índice final; según la frontera presupuesto-prioridad, cubre cerca del 65 % de la prioridad." },
  { aliado: "Municipio de Coveñas", compromiso: "Del orden de $18.000.000 a $25.000.000 por año (operación del esquema)",
    base: "Con cargo al 1 % de ingresos corrientes que exige el artículo 111 de la Ley 99 de 1993. No se fija un valor cerrado porque depende del presupuesto anual aprobado por el Concejo Municipal; el rango corresponde al estimado de los costos de operación y debe confirmarse con la Secretaría de Hacienda." },
  { aliado: "Ecopetrol / Cenit", compromiso: "$144.344.250 por año (58 % del incentivo)",
    base: "Con cargo a la inversión forzosa del 1 % (art. 43, Ley 99 de 1993; Decreto 2099 de 2016). Por la escala de su operación en Coveñas, es candidato natural para completar la financiación del incentivo de los 60 predios. El valor exacto debe calcularse sobre el proyecto licenciado que origine la obligación." },
  { aliado: "Banco de hábitat", compromiso: "Hasta USD 593.698 por año (cofinanciación)",
    base: "Compensaciones de terceros licenciados, calculadas por la plataforma SLM (estrategia 6). Margen adicional para el escalamiento." },
];

module.exports = { matriz, poligono: { predios, totales, positivos, pisoReferencia }, aliados };

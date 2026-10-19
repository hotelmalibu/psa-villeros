// Detalle por predio del Producto 3 (modelo de gestión y prospectiva predial del esquema de PSA), versión final, octubre de 2026.
// Vive en el servidor (no en index.html) y solo se entrega por POST /api/predial, que exige sesión iniciada y la clave de
// acceso, igual que los valores económicos por predio (backend/economia.js).
//
// - rutaPredios: Tabla 10 (ruta de gestión predial de PSA para los 60 predios). Modalidad, índice y prioridad finales e
//   incentivo anual coinciden con la matriz de economia.js en los 60 predios (verificado con verify_predial.js). Los predios
//   se ordenan por código; el orden no refleja prioridad. incentivo 0 = costo de oportunidad cero, con piso mínimo por definir.
// - rutaPoligono: Tabla 8 (ruta de gestión de los nueve predios del polígono de la cuenca).
// - grupos: Tabla 9 (resumen por grupos de predios). Se omite la columna «Orden» (Prioridad 1 a 3) del documento: el orden de
//   suscripción dentro de cada grupo es el del índice final sobre los 60 predios.
// - adquisicion: Tabla 7 y secciones 6.4 y 6.5 (candidatos de adquisición, presupuesto referencial y comparación con el PSA).
//   Es una propuesta no vinculante del modelo prospectivo: ningún monto constituye un compromiso formalizado.
// Los predios se identifican solo por su código (P01 a P60), en cumplimiento de la Ley 1581 de 2012.

const RUTA = [
  ["P01", "Rest./reconv.", 50.8, "Media", 9330564, "G2", "R1", "F2–F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P02", "Rehabilitación", 56.2, "Muy alta", 12964650, "G1", "R2", "F2", "PSA con apoderado común o firma de los 5 copropietarios (R2)"],
  ["P03", "Rehabilitación", 58.1, "Muy alta", 5869500, "G1", "R5", "F2", "PSA condicionado: búsqueda ORIP/VUR por código catastral y corrección IGAC del folio (R5)"],
  ["P04", "Conservación", 60.6, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P05", "Conservación", 59.6, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P06", "Conservación", 68.2, "Muy alta", 7390841, "G1", "R7", "F3", "Consulta de naturaleza jurídica (SNC/ORIP/ANT): PSA prioritario si privado; convenio público sin incentivo si estatal (R7)"],
  ["P07", "Rest./reconv.", 36.3, "Muy baja", 22918200, "G1", "R4→R8", "F3", "Folio derivado ante la ORIP e identificación del titular; si no se aclara o no hay voluntad: adquisición art. 111 (R4→R8)"],
  ["P08", "Rehabilitación", 52.6, "Media", 16581000, "G1", "R3", "F2", "PSA parcial sobre el área no embargada, previa verificación de linderos sobre la ortofoto (R3)"],
  ["P09", "Rehabilitación", 55.5, "Alta", 17231507, "G1", "R7", "F2", "PSA con poseedor u ocupante de buena fe exenta de culpa acreditado (R7)"],
  ["P10", "Conservación", 59.7, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P11", "Rest./reconv.", 51.7, "Media", 7750800, "G2", "R1", "F2–F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P12", "Rehabilitación", 53.8, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P13", "Rest./reconv.", 48.2, "Media", 9512816, "G2", "R1", "F2–F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P14", "Rest./reconv.", 47.7, "Baja", 6913950, "G2", "R1", "F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P15", "Rehabilitación", 45.3, "Baja", 15689850, "G2", "R1", "F3", "Verificación registral en fase 1; PSA estándar (R1)"],
  ["P16", "Rest./reconv.", 48.2, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P17", "Rest./reconv.", 37.8, "Muy baja", 18720300, "G1", "R7→R8", "F3", "Consulta SNC/ANT: PSA, vinculación como baldío o adquisición según resultado (R7→R8)"],
  ["P18", "Rest./reconv.", 42.8, "Muy baja", 0, "G1", "R6", "F2", "Obtener y analizar certificado; PSA condicionado al piso mínimo (R6)"],
  ["P19", "Rehabilitación", 48.3, "Media", 0, "G1", "R6", "F2", "Obtener y analizar certificado; PSA condicionado al piso mínimo (R6)"],
  ["P20", "Rest./reconv.", 44.9, "Baja", 15445500, "G2", "R1", "F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P21", "Rest./reconv.", 45.2, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P22", "Rest./reconv.", 44.2, "Baja", 9564750, "G2", "R1", "F3", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P23", "Conservación", 56.1, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P24", "Conservación", 59.1, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P25", "Conservación", 57.5, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P26", "Rest./reconv.", 42.5, "Muy baja", 9501000, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P27", "Conservación", 56.6, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P28", "Rehabilitación", 45.8, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P29", "Rehabilitación", 50.2, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P30", "Conservación", 57.6, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P31", "Conservación", 51.5, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P32", "Conservación", 54.3, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P33", "Rehabilitación", 46, "Baja", 5149500, "G2", "R1", "F3", "Verificación registral en fase 1; PSA estándar (R1)"],
  ["P34", "Conservación", 53.4, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P35", "Rehabilitación", 47.1, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P36", "Rehabilitación", 49.7, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P37", "Conservación", 49.7, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P38", "Conservación", 62.6, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P39", "Rest./reconv.", 47.9, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P40", "Conservación", 56.9, "Muy alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P41", "Rest./reconv.", 41, "Muy baja", 19755000, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P42", "Rest./reconv.", 46.4, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P43", "Rehabilitación", 44.7, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P44", "Rest./reconv.", 42.5, "Muy baja", 0, "G3", "R1", "F3–F4", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P45", "Rest./reconv.", 43.1, "Baja", 0, "G3", "R1", "F3", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P46", "Conservación", 52.6, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P47", "Rest./reconv.", 35.7, "Muy baja", 15509400, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P48", "Rehabilitación", 53.7, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P49", "Conservación", 54.7, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P50", "Conservación", 51.1, "Media", 0, "G3", "R1", "F2–F3", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P51", "Conservación", 52.7, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P52", "Rest./reconv.", 36.8, "Muy baja", 0, "G3", "R1", "F3–F4", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P53", "Rest./reconv.", 39.9, "Muy baja", 6769500, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P54", "Conservación", 53.5, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P55", "Conservación", 53.2, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P56", "Conservación", 53.9, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P57", "Rest./reconv.", 42.5, "Muy baja", 7266000, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1); acreditación multitemporal previa"],
  ["P58", "Conservación", 55.5, "Alta", 0, "G3", "R1", "F2", "Verificación registral en fase 1; PSA al piso mínimo (R1)"],
  ["P59", "Rest./reconv.", 35.7, "Muy baja", 0, "G3", "R1", "F3–F4", "Verificación registral en fase 1; PSA al piso mínimo (R1); acreditación multitemporal previa"],
  ["P60", "Rehabilitación", 41.5, "Muy baja", 7620000, "G2", "R1", "F3–F4", "Verificación registral en fase 1; PSA estándar (R1)"],
];

const MODALIDAD = {
  "Conservación": "Conservación",
  "Rehabilitación": "Rehabilitación (mixto)",
  "Rest./reconv.": "Restauración / reconversión"
};

module.exports = {
  rutaPredios: RUTA.map(([id, mod, indice, prioridad, incentivo, grupo, regla, fase, ruta]) => ({
    id, modalidad: MODALIDAD[mod], indice, prioridad, incentivo, grupo, regla, fase, ruta
  })),

  rutaPoligono: [
    { id: "P02", regla: "R2", gestiones: "Actualizar certificado; convocar a los 5 copropietarios; verificar poderes; definir área sobre ortofoto",
      instrumento: "PSA estándar (pluralidad)", plazo: "2–3 meses", desenlace: "Primer acuerdo del esquema: $12.964.650/año sobre 8,6 ha elegibles." },
    { id: "P03", regla: "R5", gestiones: "Búsqueda por código catastral en ORIP y VUR; solicitud de corrección al IGAC",
      instrumento: "PSA condicionado", plazo: "3–5 meses", desenlace: "Acuerdo tras confirmar folio: $5.869.500/año (66 % del tope)." },
    { id: "P06", regla: "R7", gestiones: "Consulta SNC de naturaleza jurídica; búsqueda ORIP por código catastral; consulta ANT; verificación de titular público",
      instrumento: "PSA prioritario o convenio público", plazo: "3–6 meses", desenlace: "Si privado: primer acuerdo en prioridad (índice 68,2). Si público: convenio sin incentivo; $7,4 M/año liberados." },
    { id: "P07", regla: "R4→R8", gestiones: "Solicitud a la ORIP del folio derivado y titular vigente; conciliación de linderos (dif. 176 %); acreditación multitemporal",
      instrumento: "Adquisición (o PSA si titular aparece con voluntad)", plazo: "6–12 meses", desenlace: "Escenario base de adquisición: $342,7 M referenciales; protección permanente del predio." },
    { id: "P08", regla: "R3", gestiones: "Verificar sobre plano y ortofoto si el área de interés coincide con la porción embargada; seguimiento del proceso civil",
      instrumento: "PSA parcial", plazo: "3–6 meses", desenlace: "Acuerdo sobre el área libre: hasta $16.581.000/año sobre 11,1 ha elegibles." },
    { id: "P09", regla: "R7", gestiones: "Consulta de naturaleza; acreditación de poseedor u ocupante de buena fe exenta de culpa",
      instrumento: "PSA con poseedor acreditado", plazo: "2–4 meses", desenlace: "Acuerdo de $17.231.507/año; caso piloto de la vía del ocupante." },
    { id: "P17", regla: "R7→R8", gestiones: "Consulta SNC y ANT; si privado, concertación con titular",
      instrumento: "PSA / vinculación ANT / adquisición", plazo: "4–8 meses", desenlace: "Según consulta: acuerdo de $18.720.300/año o escenario ampliado de adquisición ($237,3 M)." },
    { id: "P18", regla: "R6", gestiones: "Obtener y analizar certificado; aplicación del piso mínimo",
      instrumento: "PSA condicionado", plazo: "2–4 meses", desenlace: "Acuerdo al piso mínimo de referencia: $7.995.000/año sobre 5,3 ha elegibles." },
    { id: "P19", regla: "R6", gestiones: "Obtener y analizar certificado; aplicación del piso mínimo",
      instrumento: "PSA condicionado", plazo: "2–4 meses", desenlace: "Acuerdo al piso mínimo de referencia: $3.804.000/año sobre 2,5 ha elegibles." }
  ],
  rutaPoligonoNota: "Siete de los nueve predios conservan el acuerdo voluntario como instrumento objetivo —la adquisición queda acotada a P07 y, condicionalmente, a P17— y las gestiones previas se concentran en tres ventanillas: ORIP, IGAC y ANT. El costo pleno de estos acuerdos es del orden de $101,7 millones anuales dentro del polígono de la cuenca, el 38 % de la necesidad total.",

  grupos: [
    { g: "G1", nombre: "Polígono de la cuenca", predios: 9,
      ruta: "Ruta específica predio a predio (sección 7.1 del documento): acuerdos con gestión previa registral, convenio público o adquisición.",
      incentivo: "101.675.998 (7 predios) + piso mínimo (P18, P19)" },
    { g: "G2", nombre: "Fuera del polígono de la cuenca, con costo de oportunidad positivo", predios: 14,
      ruta: "PSA estándar (regla R1): verificación registral en fase 1 y suscripción en orden del índice final; acreditación multitemporal previa en los de restauración.",
      incentivo: "145.778.630" },
    { g: "G3", nombre: "Fuera del polígono de la cuenca, con costo de oportunidad cero", predios: 37,
      ruta: "PSA al piso mínimo (regla R1): verificación registral en fase 1; suscripción condicionada a la adopción del piso (sección 7.5 del Producto 2).",
      incentivo: "Establecido según el piso mínimo" }
  ],
  gruposTotal: { predios: 60, incentivo: "247.454.628 + piso mínimo" },

  adquisicion: {
    candidatos: [
      { id: "P07", condicion: "Folio cerrado (2024); titular no identificable (cat. C)", areaCat: 15.28, avaluo: 342655000, escenario: "Base" },
      { id: "P17", condicion: "Si la consulta ANT concluye predio privado sin voluntad (cat. F)", areaCat: 12.48, avaluo: 237301000, escenario: "Ampliado" },
      { id: "P06", condicion: "Solo si resulta privado y sin voluntad (activo crítico)", areaCat: 30.94, avaluo: 195595000, escenario: "Contingente" }
    ],
    escenarios: [
      { n: "Escenario base", detalle: "P07", areaCat: 15.28, avaluo: 342655000 },
      { n: "Escenario ampliado (base + P17)", detalle: "P07 + P17", areaCat: 27.76, avaluo: 579956000 }
    ],
    presupuesto: "El presupuesto se estima sobre el avalúo catastral oficial verificado, como referencia conservadora; el precio final lo fija el avalúo comercial del paso 4 de la ruta, que en suelo rural de esta zona puede superarlo. Ambos escenarios son compatibles con la fuente del artículo 111 —el 1 % de ingresos corrientes, ejecutable en más de una vigencia— y con la concurrencia de la autoridad ambiental y del departamento que prevé el Decreto 953 de 2013.",
    comparacionP07: { incentivoAnual: 22918200, quinquenio: 114591000, adquisicion: 342655000 },
    comparacion: "Para P07, pagar el incentivo calculado ($22,9 millones/año) costaría $114,6 millones en un quinquenio; adquirirlo cuesta, como mínimo, $342,7 millones más el mantenimiento. La adquisición solo es superior si el horizonte de protección es indefinido y el acuerdo imposible —su caso mientras el titular no aparezca—. La regla R8 exige demostrar en el acta de decisión que la vía voluntaria se agotó o es inviable, no solo que la adquisición es posible.",
    fuente: "Avalúos oficiales IGAC verificados (Tablas 8 y 10 del Producto 2)."
  }
};

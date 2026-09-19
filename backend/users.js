// Usuarios de la plataforma PSA - Represa Villeros.
// Las contraseñas nunca se guardan en texto plano: solo su hash bcrypt.
// Para agregar o cambiar un usuario, genera un hash nuevo con:
//   npm run hash -- "la-contraseña-nueva"
// y reemplaza el campo "passHash" correspondiente.

module.exports = [
  {
    username: "publico",
    passHash: "$2a$10$7vHKszyzeKlw30EbtWcSg.lbNajS1tIwULdmkA4yhNnW52/hpkpm2",
    role: "publico",
    roleLabel: "Consulta pública",
    full: true,
  },
];

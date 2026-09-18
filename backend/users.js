// Usuarios de la plataforma PSA - Represa Villeros.
// Las contraseñas nunca se guardan en texto plano: solo su hash bcrypt.
// Para agregar o cambiar un usuario, genera un hash nuevo con:
//   npm run hash -- "la-contraseña-nueva"
// y reemplaza el campo "passHash" correspondiente.

module.exports = [
  {
    username: "demo.tecnico",
    passHash: "$2a$10$PeBIp54o.yOHS82kVtWpfOWnRty80qn5zFYdl0BfSSRuuHV7NvBVa",
    role: "tecnico",
    roleLabel: "Equipo técnico / supervisión",
    full: true,
  },
  {
    username: "demo.publico",
    passHash: "$2a$10$7vHKszyzeKlw30EbtWcSg.lbNajS1tIwULdmkA4yhNnW52/hpkpm2",
    role: "publico",
    roleLabel: "Consulta pública",
    full: false,
  },
];

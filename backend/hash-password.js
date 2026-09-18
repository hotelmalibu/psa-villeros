// Utilidad: genera el hash bcrypt de una contraseña nueva.
// Uso:  npm run hash -- "la-contraseña-nueva"
const bcrypt = require("bcryptjs");

const pass = process.argv[2];
if (!pass) {
  console.error('Uso: npm run hash -- "la-contraseña-nueva"');
  process.exit(1);
}
console.log(bcrypt.hashSync(pass, 10));

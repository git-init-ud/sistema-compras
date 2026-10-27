const { randomUUID } = require("crypto");

// "Base de datos" en memoria: los datos viven mientras el proceso esté corriendo.
// Los UUID coinciden con los del seed anterior para no romper la colección de Postman.
const clientes = [
  {
    id: "44bb26f4-6da4-4153-8d21-2f288c4af537",
    nombre: "Laura Gómez",
    email: "laura.gomez@example.com"
  },
  {
    id: "664bd043-0dcb-4777-b44f-589bc9c75295",
    nombre: "Andrés Ruiz",
    email: "andres.ruiz@example.com"
  }
];

function listar() {
  return clientes;
}

function buscarPorId(id) {
  const idNormalizado = String(id).toLowerCase();
  return clientes.find((cliente) => cliente.id === idNormalizado);
}

function buscarPorEmail(email) {
  return clientes.find((cliente) => cliente.email === email);
}

function crear({ nombre, email }) {
  const cliente = { id: randomUUID(), nombre, email };
  clientes.push(cliente);
  return cliente;
}

function actualizar(cliente, { nombre, email }) {
  cliente.nombre = nombre;
  cliente.email = email;
  return cliente;
}

function eliminar(cliente) {
  const indice = clientes.indexOf(cliente);
  if (indice !== -1) {
    clientes.splice(indice, 1);
  }
}

module.exports = {
  listar,
  buscarPorId,
  buscarPorEmail,
  crear,
  actualizar,
  eliminar
};

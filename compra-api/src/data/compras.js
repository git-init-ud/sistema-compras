// "Base de datos" en memoria: las compras viven mientras el proceso esté corriendo.
// Seed inicial: una compra de ejemplo para que la API arranque con datos mínimos.
// El cliente y el producto referenciados existen en los seeds de sus respectivas APIs.
const compras = [
  {
    id: 1,
    clienteId: "44bb26f4-6da4-4153-8d21-2f288c4af537",
    productoId: 1,
    cantidad: 1,
    total: 180000,
    fecha: "2026-10-01T10:00:00.000Z"
  }
];

let siguienteId = 2;

function listar() {
  return compras;
}

function buscarPorId(id) {
  return compras.find((compra) => compra.id === id);
}

function crear({ clienteId, productoId, cantidad, total }) {
  const compra = {
    id: siguienteId++,
    clienteId,
    productoId,
    cantidad,
    total,
    fecha: new Date().toISOString()
  };

  compras.push(compra);
  return compra;
}

function actualizar(compra, { clienteId, productoId, cantidad, total }) {
  compra.clienteId = clienteId;
  compra.productoId = productoId;
  compra.cantidad = cantidad;
  compra.total = total;
  return compra;
}

function eliminar(compra) {
  const indice = compras.indexOf(compra);
  if (indice !== -1) {
    compras.splice(indice, 1);
  }
}

function tieneComprasDeCliente(clienteId) {
  const idNormalizado = String(clienteId).toLowerCase();
  return compras.some(
    (compra) => String(compra.clienteId).toLowerCase() === idNormalizado
  );
}

function tieneComprasDeProducto(productoId) {
  return compras.some((compra) => compra.productoId === productoId);
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  tieneComprasDeCliente,
  tieneComprasDeProducto
};

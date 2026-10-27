// "Base de datos" en memoria: las compras viven mientras el proceso esté corriendo.
const compras = [];

let siguienteId = 1;

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

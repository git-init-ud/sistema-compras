// "Base de datos" en memoria: los datos viven mientras el proceso esté corriendo.
const productos = [
  { id: 1, nombre: "Teclado mecánico", precio: 180000, stock: 15 },
  { id: 2, nombre: "Mouse inalámbrico", precio: 65000, stock: 30 }
];

let siguienteId = 3;

function listar() {
  return productos;
}

function buscarPorId(id) {
  return productos.find((producto) => producto.id === id);
}

function crear({ nombre, precio, stock }) {
  const producto = { id: siguienteId++, nombre, precio, stock };
  productos.push(producto);
  return producto;
}

function actualizar(producto, { nombre, precio, stock }) {
  producto.nombre = nombre;
  producto.precio = precio;
  producto.stock = stock;
  return producto;
}

function eliminar(producto) {
  const indice = productos.indexOf(producto);
  if (indice !== -1) {
    productos.splice(indice, 1);
  }
}

module.exports = {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
};

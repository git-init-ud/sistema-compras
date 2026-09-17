const PRODUCTO_API_URL = process.env.PRODUCTO_API_URL;

async function obtenerProducto(id) {
  const respuesta = await fetch(`${PRODUCTO_API_URL}/productos/${id}`);

  if (respuesta.status === 404) {
    return null;
  }

  if (!respuesta.ok) {
    throw new Error(`producto-api respondió con estado ${respuesta.status}`);
  }

  return respuesta.json();
}

module.exports = { obtenerProducto };

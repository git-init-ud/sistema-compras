const COMPRA_API_URL = process.env.COMPRA_API_URL || "http://localhost:3003";

async function productoTieneCompras(id) {
  const respuesta = await fetch(`${COMPRA_API_URL}/compras/producto/${id}`);

  if (!respuesta.ok) {
    throw new Error(`compra-api respondió con estado ${respuesta.status}`);
  }

  const { tieneCompras } = await respuesta.json();
  return Boolean(tieneCompras);
}

module.exports = { productoTieneCompras };

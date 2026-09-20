const CLIENTE_API_URL = process.env.CLIENTE_API_URL;

async function obtenerCliente(id) {
  const respuesta = await fetch(`${CLIENTE_API_URL}/clientes/${id}`);

  if (respuesta.status === 404) {
    return null;
  }

  if (!respuesta.ok) {
    throw new Error(`cliente-api respondió con estado ${respuesta.status}`);
  }

  return respuesta.json();
}

module.exports = { obtenerCliente };
const express = require("express");
const router = express.Router();
const {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar,
  tieneComprasDeCliente,
  tieneComprasDeProducto
} = require("../data/compras");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

function redondearTotal(valor) {
  return Math.round(valor * 100) / 100;
}

// GET /compras/cliente/:clienteId
// Endpoint interno que usa cliente-api para saber si puede eliminar un cliente.
router.get("/cliente/:clienteId", (req, res) => {
  res.status(200).json({
    tieneCompras: tieneComprasDeCliente(req.params.clienteId)
  });
});

// GET /compras/producto/:productoId
// Endpoint interno que usa producto-api para saber si puede eliminar un producto.
router.get("/producto/:productoId", (req, res) => {
  const productoId = Number(req.params.productoId);

  res.status(200).json({
    tieneCompras: Number.isInteger(productoId)
      ? tieneComprasDeProducto(productoId)
      : false
  });
});

// GET /compras
router.get("/", (req, res) => {
  res.status(200).json(listar());
});

// GET /compras/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  const compra = buscarPorId(id);

  if (!compra) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  res.status(200).json(compra);
});

// POST /compras
router.post("/", async (req, res, next) => {
  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  const cantidadNumero = Number(cantidad);

  if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
    return res
      .status(400)
      .json({ mensaje: "'cantidad' debe ser un entero mayor que 0" });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidadNumero) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidadNumero}`
    });
  }

  try {
    const compra = crear({
      clienteId: cliente.id,
      productoId: producto.id,
      cantidad: cantidadNumero,
      total: redondearTotal(producto.precio * cantidadNumero)
    });

    res.status(201).json(compra);
  } catch (error) {
    next(error);
  }
});

// PUT /compras/:id
router.put("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  const cantidadNumero = Number(cantidad);

  if (!Number.isInteger(cantidadNumero) || cantidadNumero <= 0) {
    return res
      .status(400)
      .json({ mensaje: "'cantidad' debe ser un entero mayor que 0" });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidadNumero) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidadNumero}`
    });
  }

  try {
    const compra = buscarPorId(id);

    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    actualizar(compra, {
      clienteId: cliente.id,
      productoId: producto.id,
      cantidad: cantidadNumero,
      total: redondearTotal(producto.precio * cantidadNumero)
    });

    res.status(200).json(compra);
  } catch (error) {
    next(error);
  }
});

// DELETE /compras/:id
router.delete("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  const compra = buscarPorId(id);

  if (!compra) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  eliminar(compra);
  res.status(200).json({ mensaje: "Compra eliminada" });
});

module.exports = router;

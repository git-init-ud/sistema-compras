const express = require("express");
const router = express.Router();
const compras = require("../data/compras");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

let siguienteId = 1;

// GET /compras
router.get("/", (req, res) => {
  res.status(200).json(compras);
});

// GET /compras/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const compra = compras.find((compra) => compra.id === id);

  if (!compra) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  res.status(200).json(compra);
});

// POST /compras
router.post("/", async (req, res) => {
  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
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

  if (producto.stock < cantidad) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
    });
  }

  const nuevaCompra = {
    id: siguienteId++,
    clienteId,
    productoId,
    cantidad,
    total: producto.precio * cantidad,
    fecha: new Date().toISOString()
  };

  compras.push(nuevaCompra);
  res.status(201).json(nuevaCompra);
});

module.exports = router;
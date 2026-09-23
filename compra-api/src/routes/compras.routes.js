const express = require("express");
const router = express.Router();
const db = require("../db");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

const COLUMNAS =
  "id, cliente_id AS \"clienteId\", producto_id AS \"productoId\", cantidad, total::float8 AS total, fecha";

// GET /compras
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT ${COLUMNAS} FROM compras ORDER BY id`);
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

// GET /compras/:id
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  try {
    const { rows } = await db.query(`SELECT ${COLUMNAS} FROM compras WHERE id = $1`, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /compras
router.post("/", async (req, res, next) => {
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

  try {
    const { rows } = await db.query(
      `INSERT INTO compras (cliente_id, producto_id, cantidad, total)
       VALUES ($1, $2, $3, $4) RETURNING ${COLUMNAS}`,
      [cliente.id, producto.id, cantidad, producto.precio * cantidad]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

module.exports = router;

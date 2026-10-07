const express = require("express");
const router = express.Router();
const Producto = require("../models/Producto");

const CAMPOS = ["id", "nombre", "precio", "stock"];

// GET /productos
router.get("/", async (req, res, next) => {
  try {
    const productos = await Producto.findAll({
      attributes: CAMPOS,
      order: [["id", "ASC"]]
    });
    res.status(200).json(productos);
  } catch (error) {
    next(error);
  }
});

// GET /productos/:id
router.get("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  try {
    const producto = await Producto.findByPk(id, { attributes: CAMPOS });

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json(producto);
  } catch (error) {
    next(error);
  }
});

// POST /productos
router.post("/", async (req, res, next) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  try {
    const producto = await Producto.create(
      { nombre, precio, stock },
      { returning: true }
    );
    res.status(201).json({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      stock: producto.stock
    });
  } catch (error) {
    if (error.original?.code === "23514") {
      return res
        .status(400)
        .json({ mensaje: "'precio' y 'stock' no pueden ser negativos" });
    }
    next(error);
  }
});

// PUT /productos/:id
router.put("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  try {
    const { rows } = await db.query(
      `UPDATE productos SET nombre = $1, precio = $2, stock = $3 WHERE id = $4 RETURNING ${COLUMNAS}`,
      [nombre, precio, stock, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ mensaje: "'precio' y 'stock' no pueden ser negativos" });
    }
    next(error);
  }
});

// DELETE /productos/:id
router.delete("/:id", async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  try {
    const { rows } = await db.query(
      "DELETE FROM productos WHERE id = $1 RETURNING id",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ mensaje: "No se puede eliminar: el producto tiene compras asociadas" });
    }
    next(error);
  }
});

module.exports = router;

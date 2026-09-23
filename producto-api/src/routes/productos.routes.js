const express = require("express");
const router = express.Router();
const db = require("../db");

// numeric comes back from pg as a string, so cast it to a JS number in SQL
const COLUMNAS = "id, nombre, precio::float8 AS precio, stock";

// GET /productos
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(`SELECT ${COLUMNAS} FROM productos ORDER BY id`);
    res.status(200).json(rows);
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
    const { rows } = await db.query(
      `SELECT ${COLUMNAS} FROM productos WHERE id = $1`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    res.status(200).json(rows[0]);
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
    const { rows } = await db.query(
      `INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING ${COLUMNAS}`,
      [nombre, precio, stock]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23514") {
      return res
        .status(400)
        .json({ mensaje: "'precio' y 'stock' no pueden ser negativos" });
    }
    next(error);
  }
});

module.exports = router;

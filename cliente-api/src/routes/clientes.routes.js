const express = require("express");
const router = express.Router();
const db = require("../db");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /clientes
router.get("/", async (req, res, next) => {
  try {
    const { rows } = await db.query(
      "SELECT id, nombre, email FROM clientes ORDER BY created_at"
    );
    res.status(200).json(rows);
  } catch (error) {
    next(error);
  }
});

// GET /clientes/:id
router.get("/:id", async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const { rows } = await db.query(
      "SELECT id, nombre, email FROM clientes WHERE id = $1",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// POST /clientes
router.post("/", async (req, res, next) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res
      .status(400)
      .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  try {
    const { rows } = await db.query(
      "INSERT INTO clientes (nombre, email) VALUES ($1, $2) RETURNING id, nombre, email",
      [nombre, email]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensaje: `El email ${email} ya está registrado` });
    }
    next(error);
  }
});

module.exports = router;

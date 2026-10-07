const express = require("express");
const router = express.Router();
const Cliente = require("../models/Cliente");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAMPOS = ["id", "nombre", "email"];

// GET /clientes
router.get("/", async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: CAMPOS,
      order: [["created_at", "ASC"]]
    });
    res.status(200).json(clientes);
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

    const cliente = await Cliente.findByPk(req.params.id, {
      attributes: CAMPOS
    });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(cliente);
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
    const cliente = await Cliente.create({ nombre, email }, { returning: true });
    res.status(201).json({
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ mensaje: `El email ${email} ya está registrado` });
    }
    next(error);
  }
});

// PUT /clientes/:id
router.put("/:id", async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res
        .status(400)
        .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
    }

    const { rows } = await db.query(
      "UPDATE clientes SET nombre = $1, email = $2 WHERE id = $3 RETURNING id, nombre, email",
      [nombre, email, req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ mensaje: `El email ${req.body.email} ya está registrado` });
    }
    next(error);
  }
});

// DELETE /clientes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const { rows } = await db.query(
      "DELETE FROM clientes WHERE id = $1 RETURNING id",
      [req.params.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    res.status(200).json({ mensaje: "Cliente eliminado" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(409).json({ mensaje: "No se puede eliminar: el cliente tiene compras asociadas" });
    }
    next(error);
  }
});

module.exports = router;

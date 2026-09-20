const express = require("express");
const router = express.Router();
const clientes = require("../data/clientes");

let siguienteId = 3;

// GET /clientes
router.get("/", (req, res) => {
  res.status(200).json(clientes);
});

// GET /clientes/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const cliente = clientes.find((cliente) => cliente.id === id);

  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  res.status(200).json(cliente);
});

// POST /clientes
router.post("/", (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res
      .status(400)
      .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  const nuevoCliente = { id: siguienteId++, nombre, email };
  clientes.push(nuevoCliente);
  res.status(201).json(nuevoCliente);
});

module.exports = router;
const express = require("express");
const router = express.Router();
const {
  listar,
  buscarPorId,
  buscarPorEmail,
  crear,
  actualizar,
  eliminar
} = require("../data/clientes");
const { clienteTieneCompras } = require("../services/compraService");

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function aRespuesta(cliente) {
  return { id: cliente.id, nombre: cliente.nombre, email: cliente.email };
}

// GET /clientes
router.get("/", (req, res) => {
  res.status(200).json(listar().map(aRespuesta));
});

// GET /clientes/:id
router.get("/:id", (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  const cliente = buscarPorId(req.params.id);

  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  res.status(200).json(aRespuesta(cliente));
});

// POST /clientes
router.post("/", (req, res) => {
  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res
      .status(400)
      .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  if (buscarPorEmail(email)) {
    return res.status(409).json({ mensaje: `El email ${email} ya está registrado` });
  }

  const cliente = crear({ nombre, email });
  res.status(201).json(aRespuesta(cliente));
});

// PUT /clientes/:id
router.put("/:id", (req, res) => {
  if (!UUID_RE.test(req.params.id)) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  const { nombre, email } = req.body;

  if (!nombre || !email) {
    return res
      .status(400)
      .json({ mensaje: "Los campos 'nombre' y 'email' son obligatorios" });
  }

  const cliente = buscarPorId(req.params.id);

  if (!cliente) {
    return res.status(404).json({ mensaje: "Cliente no encontrado" });
  }

  const existente = buscarPorEmail(email);

  if (existente && existente.id !== cliente.id) {
    return res.status(409).json({ mensaje: `El email ${email} ya está registrado` });
  }

  actualizar(cliente, { nombre, email });
  res.status(200).json(aRespuesta(cliente));
});

// DELETE /clientes/:id
router.delete("/:id", async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const cliente = buscarPorId(req.params.id);

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    let tieneCompras;

    try {
      tieneCompras = await clienteTieneCompras(cliente.id);
    } catch (error) {
      return res.status(503).json({
        mensaje: "No se pudo verificar si el cliente tiene compras asociadas",
        detalle: error.message
      });
    }

    if (tieneCompras) {
      return res
        .status(409)
        .json({ mensaje: "No se puede eliminar: el cliente tiene compras asociadas" });
    }

    eliminar(cliente);
    res.status(200).json({ mensaje: "Cliente eliminado" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  listar,
  buscarPorId,
  crear,
  actualizar,
  eliminar
} = require("../data/productos");
const { productoTieneCompras } = require("../services/compraService");

function aNumero(valor) {
  if (valor === null || valor === "" || typeof valor === "boolean") {
    return NaN;
  }

  return Number(valor);
}

// Normaliza precio y stock a números antes de guardarlos.
function normalizar({ precio, stock }) {
  return {
    precio: Math.round(aNumero(precio) * 100) / 100,
    stock: aNumero(stock)
  };
}

function datosValidos(precio, stock) {
  return Number.isFinite(precio) && Number.isInteger(stock);
}

// GET /productos
router.get("/", (req, res) => {
  res.status(200).json(listar());
});

// GET /productos/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  const producto = buscarPorId(id);

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  res.status(200).json(producto);
});

// POST /productos
router.post("/", (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (
    !nombre ||
    precio === undefined ||
    precio === null ||
    stock === undefined ||
    stock === null
  ) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  const normalizado = normalizar({ precio, stock });

  if (!datosValidos(normalizado.precio, normalizado.stock)) {
    return res.status(400).json({
      mensaje: "'precio' y 'stock' deben ser números válidos"
    });
  }

  if (normalizado.precio < 0 || normalizado.stock < 0) {
    return res
      .status(400)
      .json({ mensaje: "'precio' y 'stock' no pueden ser negativos" });
  }

  const producto = crear({ nombre, ...normalizado });
  res.status(201).json(producto);
});

// PUT /productos/:id
router.put("/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  const { nombre, precio, stock } = req.body;

  if (
    !nombre ||
    precio === undefined ||
    precio === null ||
    stock === undefined ||
    stock === null
  ) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  const normalizado = normalizar({ precio, stock });

  if (!datosValidos(normalizado.precio, normalizado.stock)) {
    return res.status(400).json({
      mensaje: "'precio' y 'stock' deben ser números válidos"
    });
  }

  if (normalizado.precio < 0 || normalizado.stock < 0) {
    return res
      .status(400)
      .json({ mensaje: "'precio' y 'stock' no pueden ser negativos" });
  }

  const producto = buscarPorId(id);

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  actualizar(producto, { nombre, ...normalizado });
  res.status(200).json(producto);
});

// DELETE /productos/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const producto = buscarPorId(id);

    if (!producto) {
      return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    let tieneCompras;

    try {
      tieneCompras = await productoTieneCompras(producto.id);
    } catch (error) {
      return res.status(503).json({
        mensaje: "No se pudo verificar si el producto tiene compras asociadas",
        detalle: error.message
      });
    }

    if (tieneCompras) {
      return res
        .status(409)
        .json({ mensaje: "No se puede eliminar: el producto tiene compras asociadas" });
    }

    eliminar(producto);
    res.status(200).json({ mensaje: "Producto eliminado" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

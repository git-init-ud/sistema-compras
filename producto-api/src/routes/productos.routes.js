const express = require("express");
const router = express.Router();
const productos = require("../data/productos");

let siguienteId = 3;

// GET /productos
router.get("/", (req, res) => {
  res.status(200).json(productos);
});

// GET /productos/:id
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find((producto) => producto.id === id);

  if (!producto) {
    return res.status(404).json({ mensaje: "Producto no encontrado" });
  }

  res.status(200).json(producto);
});

// POST /productos
router.post("/", (req, res) => {
  const { nombre, precio, stock } = req.body;

  if (!nombre || precio === undefined || stock === undefined) {
    return res.status(400).json({
      mensaje: "Los campos 'nombre', 'precio' y 'stock' son obligatorios"
    });
  }

  const nuevoProducto = { id: siguienteId++, nombre, precio, stock };
  productos.push(nuevoProducto);
  res.status(201).json(nuevoProducto);
});

module.exports = router;

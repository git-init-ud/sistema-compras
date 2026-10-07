const express = require("express");
const router = express.Router();
const getProductos = require("../controllers/productoController").getProductos;
const getProductoById = require("../controllers/productoController").getProductoById;
const createProducto = require("../controllers/productoController").createProducto;
const updateProducto = require("../controllers/productoController").updateProducto;
const deleteProducto = require("../controllers/productoController").deleteProducto;

// GET /productos
router.get("/", getProductos);

// GET /productos/:id
router.get("/:id", getProductoById);

// POST /productos
router.post("/", createProducto);

// PUT /productos/:id
router.put("/:id", updateProducto);

// DELETE /productos/:id
router.delete("/:id", deleteProducto);

module.exports = router;

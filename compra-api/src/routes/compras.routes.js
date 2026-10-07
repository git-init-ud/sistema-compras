const express = require("express");
const router = express.Router();
const getCompras = require("../controllers/compraController").getCompras;
const getCompraById = require("../controllers/compraController").getCompraById;
const createCompra = require("../controllers/compraController").createCompra;
const updateCompra = require("../controllers/compraController").updateCompra;
const deleteCompra = require("../controllers/compraController").deleteCompra;

// GET /compras
router.get("/", getCompras);

// GET /compras/:id
router.get("/:id", getCompraById);

// POST /compras
router.post("/", createCompra);

// PUT /compras/:id
router.put("/:id", updateCompra);

// DELETE /compras/:id
router.delete("/:id", deleteCompra);

module.exports = router;

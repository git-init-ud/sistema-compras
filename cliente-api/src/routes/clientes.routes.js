const express = require("express");
const router = express.Router();
const getClientes = require("../controllers/clienteController").getClientes;
const getClienteById = require("../controllers/clienteController").getClienteById;
const createCliente = require("../controllers/clienteController").createCliente;
const updateCliente = require("../controllers/clienteController").updateCliente;
const deleteCliente = require("../controllers/clienteController").deleteCliente;

// GET /clientes
router.get("/", getClientes);

// GET /clientes/:id
router.get("/:id", getClienteById);

// POST /clientes
router.post("/", createCliente);

// PUT /clientes/:id
router.put("/:id", updateCliente);

// DELETE /clientes/:id
router.delete("/:id", deleteCliente);

module.exports = router;

const Compra = require("../models/Compra");
const { obtenerCliente } = require("../services/clienteService");
const { obtenerProducto } = require("../services/productoService");

// GET /compras
const getCompras = async (req, res, next) => {
  try {
    const compras = await Compra.findAll({ order: [["id", "ASC"]] });
    res.status(200).json(compras);
  } catch (error) {
    next(error);
  }
}

// GET /compras/:id
const getCompraById = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  try {
    const compra = await Compra.findByPk(id);

    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    res.status(200).json(compra);
  } catch (error) {
    next(error);
  }
}

// POST /compras
const createCompra = async (req, res, next) => {
  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidad) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
    });
  }

  try {
    const compra = await Compra.create(
      {
        clienteId: cliente.id,
        productoId: producto.id,
        cantidad,
        total: producto.precio * cantidad
      },
      { returning: true }
    );
    res.status(201).json(compra);
  } catch (error) {
    next(error);
  }
}

// PUT /compras/:id
const updateCompra = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  const { clienteId, productoId, cantidad } = req.body;

  if (!clienteId || !productoId || !cantidad) {
    return res.status(400).json({
      mensaje: "Los campos 'clienteId', 'productoId' y 'cantidad' son obligatorios"
    });
  }

  let cliente;
  let producto;

  try {
    cliente = await obtenerCliente(clienteId);
    producto = await obtenerProducto(productoId);
  } catch (error) {
    return res.status(503).json({
      mensaje: "No se pudo validar la compra porque uno de los servicios no respondió",
      detalle: error.message
    });
  }

  if (!cliente) {
    return res.status(404).json({ mensaje: `El cliente ${clienteId} no existe` });
  }

  if (!producto) {
    return res.status(404).json({ mensaje: `El producto ${productoId} no existe` });
  }

  if (producto.stock < cantidad) {
    return res.status(400).json({
      mensaje: `Stock insuficiente. Disponible: ${producto.stock}, solicitado: ${cantidad}`
    });
  }

  try {
    const compra = await Compra.findByPk(id);

    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    await compra.update({
      clienteId: cliente.id,
      productoId: producto.id,
      cantidad,
      total: producto.precio * cantidad
    });

    res.status(200).json(compra);
  } catch (error) {
    next(error);
  }
}

// DELETE /compras/:id
const deleteCompra = async (req, res, next) => {
  const id = Number(req.params.id);

  if (!Number.isInteger(id)) {
    return res.status(404).json({ mensaje: "Compra no encontrada" });
  }

  try {
    const compra = await Compra.findByPk(id);

    if (!compra) {
      return res.status(404).json({ mensaje: "Compra no encontrada" });
    }

    await compra.destroy();

    res.status(200).json({ mensaje: "Compra eliminada" });
  } catch (error) {
    next(error);
  }
}

module.exports = { getCompras, getCompraById, createCompra, updateCompra, deleteCompra };

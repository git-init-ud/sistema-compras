const Cliente = require('../models/Cliente');
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAMPOS = ["id", "nombre", "email"];
// GET /clientes

const getClientes = async (req, res, next) => {
  try {
    const clientes = await Cliente.findAll({
      attributes: CAMPOS,
      order: [["created_at", "ASC"]]
    });
    res.status(200).json(clientes);
  } catch (error) {
    next(error);
  }
}

// GET/clientes/:id
const getClienteById = async (req, res, next) => {
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
}


// POST /clientes
const createCliente = async (req, res, next) => {
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
}

// PUT /clientes/:id
const updateCliente = async (req, res, next) => {
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

    const cliente = await Cliente.findByPk(req.params.id, { attributes: CAMPOS });

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    await cliente.update({ nombre, email });

    res.status(200).json({
      id: cliente.id,
      nombre: cliente.nombre,
      email: cliente.email
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ mensaje: `El email ${req.body.email} ya está registrado` });
    }
    next(error);
  }
}

const deleteCliente = async (req, res, next) => {
  try {
    if (!UUID_RE.test(req.params.id)) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    const cliente = await Cliente.findByPk(req.params.id);

    if (!cliente) {
      return res.status(404).json({ mensaje: "Cliente no encontrado" });
    }

    await cliente.destroy();

    res.status(200).json({ mensaje: "Cliente eliminado" });
  } catch (error) {
    // 23001 = RESTRICT, 23503 = violación de FK en general
    if (error.original?.code === "23001" || error.original?.code === "23503") {
      return res.status(409).json({ mensaje: "No se puede eliminar: el cliente tiene compras asociadas" });
    }
    next(error);
  }
}

module.exports = { getClientes, getClienteById, createCliente, updateCliente, deleteCliente };

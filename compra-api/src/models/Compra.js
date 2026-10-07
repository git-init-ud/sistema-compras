const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Compra = sequelize.define(
  "Compra",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    clienteId: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "cliente_id"
    },
    productoId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "producto_id"
    },
    cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      // Postgres devuelve NUMERIC como string; lo pasamos a número para la API
      get() {
        const valor = this.getDataValue("total");
        return valor === null ? null : Number(valor);
      }
    },
    // la columna tiene DEFAULT now(); Sequelize aplica el mismo criterio al crear
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    tableName: "compras",
    createdAt: false,
    updatedAt: false
  }
);

module.exports = Compra;

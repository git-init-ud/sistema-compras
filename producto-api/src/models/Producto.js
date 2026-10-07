const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Producto = sequelize.define(
  "Producto",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    precio: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      // Postgres devuelve NUMERIC como string; lo pasamos a número para la API
      get() {
        const valor = this.getDataValue("precio");
        return valor === null ? null : Number(valor);
      }
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "productos",
    createdAt: "created_at",
    updatedAt: false
  }
);

module.exports = Producto;

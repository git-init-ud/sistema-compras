const { DataTypes } = require("sequelize");
const sequelize = require("../db");

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    nombre: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    email: {
      type: DataTypes.TEXT,
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "clientes",
    createdAt: "created_at",
    updatedAt: false
  }
);

module.exports = Cliente;

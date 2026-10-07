const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
  process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5440/compras_db",
  {
    // pon DB_LOGGING=true en el .env para ver el SQL que genera Sequelize
    logging: process.env.DB_LOGGING === "true" ? console.log : false
  }
);

module.exports = sequelize;

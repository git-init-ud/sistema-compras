const { Pool } = require("pg");

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL || "postgresql://postgres@127.0.0.1:5440/compras_db"
});

module.exports = pool;

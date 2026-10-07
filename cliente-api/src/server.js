require("dotenv").config();
const express = require("express");
const clientesRoutes = require("./routes/clientes.routes");
const sequelize = require("./db");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/clientes", clientesRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "cliente-api activa" });
});

sequelize
  .authenticate()
  .then(() => console.log("cliente-api conectada a PostgreSQL vía Sequelize"))
  .catch((error) =>
    console.error("cliente-api no pudo conectar a PostgreSQL:", error.message)
  );

app.listen(PORT, () => {
  console.log(`cliente-api escuchando en el puerto ${PORT}`);
});

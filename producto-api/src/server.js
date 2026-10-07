require("dotenv").config();
const express = require("express");
const productosRoutes = require("./routes/productos.routes");
const sequelize = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use("/productos", productosRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "producto-api activa" });
});

sequelize
  .authenticate()
  .then(() => console.log("producto-api conectada a PostgreSQL vía Sequelize"))
  .catch((error) =>
    console.error("producto-api no pudo conectar a PostgreSQL:", error.message)
  );

app.listen(PORT, () => {
  console.log(`producto-api escuchando en el puerto ${PORT}`);
});

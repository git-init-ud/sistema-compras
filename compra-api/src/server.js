require("dotenv").config();
const express = require("express");
const comprasRoutes = require("./routes/compras.routes");
const sequelize = require("./db");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use("/compras", comprasRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "compra-api activa" });
});

sequelize
  .authenticate()
  .then(() => console.log("compra-api conectada a PostgreSQL vía Sequelize"))
  .catch((error) =>
    console.error("compra-api no pudo conectar a PostgreSQL:", error.message)
  );

app.listen(PORT, () => {
  console.log(`compra-api escuchando en el puerto ${PORT}`);
});

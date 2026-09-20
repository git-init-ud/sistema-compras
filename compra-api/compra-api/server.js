require("dotenv").config();
const express = require("express");
const comprasRoutes = require("./routes/compras.routes");

const app = express();
const PORT = process.env.PORT || 3003;

app.use(express.json());
app.use("/compras", comprasRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "compra-api activa" });
});

app.listen(PORT, () => {
  console.log(`compra-api escuchando en el puerto ${PORT}`);
});
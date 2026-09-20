require("dotenv").config();
const express = require("express");
const clientesRoutes = require("./routes/clientes.routes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use("/clientes", clientesRoutes);

app.get("/", (req, res) => {
  res.status(200).json({ mensaje: "cliente-api activa" });
});

app.listen(PORT, () => {
  console.log(`cliente-api escuchando en el puerto ${PORT}`);
});
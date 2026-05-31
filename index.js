const express = require("express");
const app = express();

app.get("/proyecto1", (req, res) => {
  res.send("Hola desde la Raspberry 🚀");
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor activo en puerto 3000");
});
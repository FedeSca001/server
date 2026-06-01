const express = require("express");
const app = express();

const scrapingRaceRouter = require("./src/show-results/scraping-race");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Hola, mundo! 🌍");
});

app.use("/scrapingRace", scrapingRaceRouter);

app.use((req, res) => {
  res.status(404).send({ error: "Ruta no encontrada" });
});

app.listen(3000, "0.0.0.0", () => {
  console.log("Servidor activo en puerto 3000");
});
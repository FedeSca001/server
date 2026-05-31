const express = require("express");
const router = express.Router();
const { getRace } = require("../show-results/scrapingFunctions/scrapingFunctinos.js");

router.get("/inicio", (req, res) => {
  res.send("¡Bienvenido a la carrera de scraping! 🏁");
});

router.get("/getRaces", async (req, res) => {
  try {
    const races = await getRace();
    res.json(races);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener carreras" });
  }
});

module.exports = router;
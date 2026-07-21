const express = require("express");
const router = express.Router();

const calendarioMotoGp = require("./CalendarioMotoGp.js");
const clasificacionMotoGp = require("./ClasificacionMotoGp.js");
const clasificacionF1 = require("./ClasificacionF1.js");

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

router.use("/calendario", calendarioMotoGp);
router.use("/clasificacion", clasificacionMotoGp);
router.use("/clasificacionF1", clasificacionF1);

module.exports = router;
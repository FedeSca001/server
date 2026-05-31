const express = require("express");
const router = express.Router();

router.get("/inicio", (req, res) => {
  res.send("¡Bienvenido a la carrera de scraping! 🏁");
});

module.exports = router;
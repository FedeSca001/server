const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");

// Año dinámico
const year = new Date().getFullYear().toString();

// -----------------------------
// SCRAPER GENÉRICO
// -----------------------------
const obtenerClasificacion = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        // ayuda a evitar bloqueos básicos
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
      },
    });

    const $ = cheerio.load(data);

    const clasificacion = [];

    $("tbody > tr").each((index, element) => {
      const fila = $(element);

      const posicion = fila.find("td:nth-child(1)").text().trim();

      const nacionalidad = fila.find("td:nth-child(3)").text().trim();
    //selector combre = #results-table > div > table > tbody > tr:nth-child(6) > td:nth-child(2) > a > span:nth-child(2) > span.max-lg\:hidden

     const nombre = fila
        .find("td:nth-child(2) a span:nth-child(2) span.max-lg\\:hidden")
        .text()
        .trim();
      const apellido = fila
        .find("td:nth-child(2) a span:nth-child(2) span.max-lg\\:hidden")
        .text()
        .trim();
      
      const combreCompleto = nombre + " " + apellido;

      const img = fila.find("td:nth-child(2) img").attr("src");
      
      const puntos = fila.find("td:nth-child(5)").text().trim();

      if (posicion && nombre) {
        clasificacion.push({
          posicion: Number(posicion),
          nombre: combreCompleto,
          nacionalidad,
          img,
          puntos: Number(puntos) || 0,
        });
      }
    });

    return clasificacion;
  } catch (error) {
    console.error("Error scraping F1:", error.message);

    return {
      error: "Error al obtener la clasificación",
      detalle: error.message,
    };
  }
};

// -----------------------------
// URLs F1
// -----------------------------
const getClasificacionF1Pilotos = () => {
  return obtenerClasificacion(
    `https://www.formula1.com/en/results/${year}/drivers`
  );
};

const getClasificacionF1Equipos = () => {
  return obtenerClasificacion(
    `https://www.formula1.com/en/results/${year}/team`
  );
};

// Home del módulo
router.get("/", (req, res) => {
  res.send("¡Bienvenido a la clasificación de Fórmula 1! 🏎️");
});

// Pilotos
router.get("/pilotos", async (req, res) => {
  const data = await getClasificacionF1Pilotos();

  if (data.error) {
    return res.status(500).json(data);
  }

  res.json(data);
});

// Equipos
router.get("/equipos", async (req, res) => {
  const data = await getClasificacionF1Equipos();

  if (data.error) {
    return res.status(500).json(data);
  }

  res.json(data);
});

module.exports = router;
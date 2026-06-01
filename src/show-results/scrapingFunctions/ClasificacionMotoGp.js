const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const router = express.Router();

const SELECTORS = {
    pilotoNombre: "td.piloto",
    puntos: "td.puntosmundial > b",
    fila: "table > tbody > tr"
};

const obtenerClasificacion = async (url) => {
    try {
        // 🔥 FIX ENCODING (Marca usa ISO/Latin1)
        const { data } = await axios.get(url, {
            responseType: "arraybuffer"
        });

        const html = Buffer.from(data, "binary").toString("latin1");
        const $ = cheerio.load(html);

        const clasificacion = [];

        $(SELECTORS.fila).each((index, element) => {
            const piloto = $(element).find(SELECTORS.pilotoNombre).text().trim();
            const puntos = $(element).find(SELECTORS.puntos).text().trim();

            clasificacion.push({
                posicion: index + 1,
                piloto,
                puntos
            });
        });
        return clasificacion;
    } catch (error) {
        console.error("Error al obtener la clasificación:", error);
        return {
            error: "Error al obtener la clasificación",
            detalle: error.message
        };
    }
};

const getClasificacionMotogp = () => obtenerClasificacion("https://www.marca.com/motor/motociclismo/clasificacion-motogp.html");

const getClasificacionMoto2 = () => obtenerClasificacion("https://www.marca.com/motor/motociclismo/clasificacion-moto2.html");

const getClasificacionMoto3 = () => obtenerClasificacion("https://www.marca.com/motor/motociclismo/clasificacion-moto3.html");

// MotoGP
router.get("/", async (req, res) => {
    const data = await getClasificacionMotogp();
    if (data.error) return res.status(500).json(data);
    res.json(data);
});

// Moto2
router.get("/moto2", async (req, res) => {
    const data = await getClasificacionMoto2();
    if (data.error) return res.status(500).json(data);
    res.json(data);
});

// Moto3
router.get("/moto3", async (req, res) => {
    const data = await getClasificacionMoto3();
    if (data.error) return res.status(500).json(data);
    res.json(data);
});

module.exports = router;
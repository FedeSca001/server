const express = require("express");
const cheerio = require("cheerio");
const axios = require("axios");

const router = express.Router();

const scrapingImagenes = async (url) => {
    console.log("\n===== SCRAPING DE IMÁGENES =====");
    console.log(`Analizando: ${url}`);

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);
        const imagenes = [];

        $("img").each((_, element) => {
            let src = $(element).attr("src");
            if (!src) return;
            try {
                src = new URL(src, url).href;
            } catch {
                return;
            }
            imagenes.push(src);
        });

        // Eliminar duplicados
        const resultado = [...new Set(imagenes)];

        console.log(`Se encontraron ${resultado.length} imágenes:\n`);

        resultado.forEach((img, index) => {
            console.log(`${index + 1}. ${img}`);
        });

        return resultado;

    } catch (error) {
        console.error("Error durante el scraping:", error.message);
        return [];
    }
};

module.exports = {
    scrapingImagenes,
};
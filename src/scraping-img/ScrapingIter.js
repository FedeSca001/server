const { scrapingImagenes } = require("./ScrapingImg.js");

const iterarScraping = async (baseUrl, iterations, suffix) => {
    console.log("\n===== ITERAR SCRAPING DE IMÁGENES =====");

    for (let i = 1; i <= iterations; i++) {
        const url = `${baseUrl}${i}${suffix}`;
        console.log(`\n--- Iteración ${i} ---`);
        // Enviamos también el número de la URL
        await scrapingImagenes(url, i);
    }
};

module.exports = { iterarScraping };
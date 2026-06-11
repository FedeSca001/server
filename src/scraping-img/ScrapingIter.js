const { scrapingImagenes } = require("./ScrapingImg.js");

const iterarScraping = async (baseUrl, iterations, suffix) => {
    console.log("\n===== ITERAR SCRAPING DE IMÁGENES =====");
    console.log("Base URL:", baseUrl);
    console.log("Iterations:", iterations);
    console.log("Suffix:", suffix);
    for (let i = 1; i <= iterations; i++) {
        const url = `${baseUrl}${i}${suffix}`;
        console.log(`\n--- Iteración ${i} ---`);
        await scrapingImagenes(url);
    }
}

module.exports = { iterarScraping };
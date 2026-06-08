const express = require("express");

const router = express.Router();

const SELECTORS = {};

const scrapingImagenes = async (url) => {
    console.log("\n===== SCRAPING DE IMÁGENES =====");
    console.log("Iniciando scraping de imágenes..."+url);
};

module.exports = { scrapingImagenes };
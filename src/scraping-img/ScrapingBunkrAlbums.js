const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../DataBase/db.js");
const fs = require("fs");

const CONCURRENCY = 5;

/* ---------------- UTILIDADES ---------------- */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}

/* ---------------- SCRAPING ---------------- */

async function scrapePage(page) {
    const url = `https://balbums.st/?search=&mode=broad&per=20&sort=latest&page=${page}`;

    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);
        const albums = [];

        $("section.grid.gap-4.fadeup > a").each((i, el) => {
            const title = $(el)
                .find("div.p-3\\.5 h3")
                .text()
                .trim();

            const image =
                $(el).find("img.thumb-img").attr("src") ||
                $(el).find("img.thumb-img").attr("data-src");

            const url = $(el).attr("href");

            if (title && image && url) {
                albums.push({ title, image, url });
            }
        });

        return albums;

    } catch (err) {
        console.log(`❌ Error página ${page}: ${err.message}`);
        return [];
    }
}

/* ---------------- DB SAVE ---------------- */

function saveAlbums(albums) {
    const sql = "INSERT INTO albums (title, image, url) VALUES (?, ?, ?)";

    for (const album of albums) {
        db.query(sql, [album.title, album.image, album.url], (err) => {
            if (err) {
                console.error("Error insertando:", err.message);
            }
        });
    }
}

/* ---------------- WORKER ---------------- */

async function worker(queue) {
    while (true) {
        const page = queue.shift(); // toma siguiente página

        if (page === undefined) break;

        console.log(`📄 Procesando página ${page}`);

        const albums = await scrapePage(page);

        if (albums.length > 0) {
            saveAlbums(albums);
        }

        await sleep(randomDelay());
    }
}

/* ---------------- MAIN ---------------- */

async function main(initialPage, finalPage) {
    console.log(`🚀 Iniciando scraping desde ${initialPage} hasta ${finalPage}`);

    // crear cola de páginas
    const queue = [];

    for (let i = initialPage; i <= finalPage; i++) {
        queue.push(i);
    }

    // lanzar workers
    const workers = [];

    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(queue));
    }

    await Promise.all(workers);

    console.log("✅ Finalizado");
}

/* ---------------- EXPORT ---------------- */

module.exports = {
    scrapePage,
    main,
    saveAlbums
};
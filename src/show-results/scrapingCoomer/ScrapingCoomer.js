/*const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../../DataBase/db.js");
const fs = require("fs");
let counterNewArtists = 0;
const CONCURRENCY = 5;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}

async function scrapePage(page) {
    const url = `https://coomer.st/artists?o=${page}`;

    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const posts = [];

        $("div.card-list__items > a").each((i, el) => {
            const artista = $(el)
                .find("div.user-card__info > div.user-card__name")
                .text()
                .trim();
            const image =
                $(el).find("div.user-card__icon > div > picture > img").attr("src") ||
                $(el).find("div.user-card__icon > div > picture > img").attr("data-src");
            const url = $(el).attr("href");
            const platform = $(el)
                .find("div.user-card__info > span")
                .text().trim();

            if (artista && image && url && platform) {
                posts.push({ artista, image, url, platform });
            }
        });
        console.log(`Página ${page}: ${posts.length} artistas`);
        return posts;
    } catch (err) {
        console.log(`❌ Error página ${page}: ${err.message}`);
        return [];
    }
}

const saveArtists = (artists) => {
    const sql = "INSERT IGNORE INTO artists (name, image, url, platform) VALUES (?, ?, ?, ?)";
    for (const a of artists) {
        db.query(sql, [a.artista, a.image, a.url, a.platform], (err, result) => {
            if (err) {
                console.log(`❌ Error: ${a.artista}`);
                return;
            }
            if (result.affectedRows === 1) {
                counterNewArtists++;
                console.log(`✅ Nuevo artista: ${a.artista}`);
            }
        });
    }
}

async function worker(queue) {
    while (true) {
        const page = queue.shift();
        if (page === undefined) break;

        console.log(`📄 Procesando página ${page}`);

        const artists = await scrapePage(page);

        if (artists.length > 0) {
            saveArtists(artists);
        }
        await sleep(randomDelay());
    }
}


async function main(initialPage, finalPage) {
    console.log(`🚀 Iniciando scraping desde ${initialPage} hasta ${finalPage}`);
    const queue = [];
    for (let i = initialPage; i <= finalPage; i++) {
        queue.push(i);
    }
    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(queue));
    }
    await Promise.all(workers);
    console.log(`✅ Finalizado. Nuevos artistas encontrados: ${counterNewArtists}`);

/*module.exports = {
    main,
};*/

const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../../DataBase/db.js");

let counterNewArtists = 0;
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
    const url = `https://coomer.st/artists?o=${page}`;

    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });

        // DEBUG
        console.log(data.substring(0, 500));
        const $ = cheerio.load(data);
        console.log("user-card:", $("a.user-card").length);

        const posts = [];

        $("a.user-card").each((i, el) => {
            const artista = $(el)
                .find(".user-card__name")
                .text()
                .trim();

            const image =
                $(el).find("img").attr("src") ||
                $(el).find("img").attr("data-src");

            const profileUrl = $(el).attr("href");

            const platform = $(el)
                .find(".user-card__service")
                .text()
                .trim();

            if (artista && image && profileUrl && platform) {
                posts.push({
                    artista,
                    image,
                    url: profileUrl,
                    platform,
                });
            }
        });

        console.log(`Página ${page}: ${posts.length} artistas`);
        return posts;
    } catch (err) {
        console.log(`❌ Error página ${page}: ${err.message}`);
        return [];
    }
}

/* ---------------- DB SAVE ---------------- */

function saveArtists(artists) {
    const sql =
        "INSERT IGNORE INTO artists (name, image, url, platform) VALUES (?, ?, ?, ?)";

    for (const a of artists) {
        db.query(sql, [a.artista, a.image, a.url, a.platform], (err, result) => {
            if (err) {
                console.log(`❌ Error: ${a.artista}`, err.message);
                return;
            }

            if (result.affectedRows === 1) {
                counterNewArtists++;
                console.log(`✅ Nuevo artista: ${a.artista}`);
            }
        });
    }
}

/* ---------------- WORKER ---------------- */

async function worker(queue) {
    while (true) {
        const page = queue.shift();
        if (page === undefined) break;

        console.log(`📄 Procesando página ${page}`);

        const artists = await scrapePage(page);

        if (artists.length > 0) {
            saveArtists(artists);
        }

        await sleep(randomDelay());
    }
}

/* ---------------- MAIN ---------------- */

async function main(initialPage, finalPage) {
    console.log(`🚀 Iniciando scraping desde ${initialPage} hasta ${finalPage}`);

    const queue = [];
    for (let i = initialPage; i <= finalPage; i++) {
        queue.push(i);
    }

    const workers = [];
    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(queue));
    }

    await Promise.all(workers);

    console.log(`✅ Finalizado. Nuevos artistas encontrados: ${counterNewArtists}`);
}

module.exports = {
    main,
};
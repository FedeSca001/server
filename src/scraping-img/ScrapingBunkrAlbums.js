const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../db");

/* ---------------- CONFIG ---------------- */

const MAX_PAGE = 19237;
const CONCURRENCY = 5;

const PROGRESS_FILE = "./progress.json";

/* ---------------- UTILIDADES ---------------- */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}

/* ---------------- PROGRESO ---------------- */

const fs = require("fs");

function saveProgress(page) {
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ page }));
}

function loadProgress() {
    if (!fs.existsSync(PROGRESS_FILE)) return 1;

    const data = JSON.parse(fs.readFileSync(PROGRESS_FILE, "utf8"));
    return data.page || 1;
}

/* ---------------- GUARDAR EN DB ---------------- */

const saveAlbums = (albums) => {
    const sql = "INSERT INTO albums (title, image, url) VALUES (?, ?, ?)";

    albums.forEach((album) => {
        db.query(sql, [album.title, album.image, album.url], (err) => {
            if (err) {
                console.error("Error insertando:", err.message);
            }
        });
    });
};

/* ---------------- SCRAPE PAGE ---------------- */

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

            if (title && image) {
                albums.push({ title, image, url });
            }
        });

        return albums;

    } catch (err) {
        console.log(`Error página ${page}: ${err.message}`);
        return [];
    }
}

/* ---------------- WORKER ---------------- */

let currentPage = loadProgress();

async function worker() {
    while (currentPage <= MAX_PAGE) {
        const page = currentPage++;

        console.log(`Procesando página ${page}`);

        const albums = await scrapePage(page);

        if (albums.length > 0) {
            saveAlbums(albums);
        }

        saveProgress(page);

        await sleep(randomDelay());
    }
}

/* ---------------- MAIN ---------------- */

async function main() {
    const workers = [];

    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker());
    }

    await Promise.all(workers);

    console.log("Finalizado");
}

/* ---------------- EXPORT ---------------- */

module.exports = {
    scrapePage,
    main,
    saveAlbums
};
const puppeteer = require("puppeteer");
const db = require("../../DataBase/db.js");

let counterNewArtists = 0;
const CONCURRENCY = 2;
let browser;

/* ---------------- UTILIDADES ---------------- */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}

/* ---------------- SCRAPING ---------------- */

async function scrapePage(page) {
    let browserPage;

    try {
        browserPage = await browser.newPage();

        await browserPage.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
        );

        await browserPage.goto(`https://coomer.st/artists?o=${page}`, {
            waitUntil: "networkidle2",
            timeout: 30000,
        });

        await browserPage.waitForSelector("a.user-card", {
            timeout: 10000,
        });

        const posts = await browserPage.$$eval("a.user-card", cards =>
            cards.map(card => ({
                artista: card.querySelector(".user-card__name")?.textContent.trim(),
                image: card.querySelector("img")?.src || "",
                url: card.getAttribute("href"),
                platform: card.querySelector(".user-card__service")?.textContent.trim(),
            }))
        );

        console.log(`Página ${page}: ${posts.length} artistas`);

        await browserPage.close();
        return posts;

    } catch (err) {
        console.log(`❌ Error página ${page}: ${err.message}`);

        if (browserPage) {
            await browserPage.close().catch(() => {});
        }

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
                console.log(`❌ Error: ${a.artista}: ${err.message}`);
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

    browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const queue = [];

    for (let i = initialPage; i <= finalPage; i++) {
        queue.push(i);
    }

    const workers = [];

    for (let i = 0; i < CONCURRENCY; i++) {
        workers.push(worker(queue));
    }

    await Promise.all(workers);

    await browser.close();

    console.log(`✅ Finalizado. Nuevos artistas encontrados: ${counterNewArtists}`);
}

module.exports = {
    main,
};
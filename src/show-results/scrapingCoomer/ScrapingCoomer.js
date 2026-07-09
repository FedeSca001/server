const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
puppeteer.use(StealthPlugin());

const db = require("../../DataBase/db.js");

let browser;
let counterNewArtists = 0;
const CONCURRENCY = 1;
const MAX_RETRIES = 4;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(min = 3500, max = 8500) {
    return Math.floor(Math.random() * (max - min)) + min;
}

/* ---------------- SCRAPING CON REINTENTOS ---------------- */

async function scrapePage(pageNum, retry = 0) {
    let browserPage;

    try {
        browserPage = await browser.newPage();

        await browserPage.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36"
        );

        await browserPage.setExtraHTTPHeaders({
            "Accept-Language": "en-US,en;q=0.9,es;q=0.8",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        });

        // === Cargar cookies desde cookies.json ===
        try {
            const cookies = require("./cookies.json");
            if (cookies && cookies.length > 0) {
                await browserPage.setCookie(...cookies);
                console.log("🍪 Cookies cargadas");
            }
        } catch {
            console.log("⚠️ No se encontró cookies.json");
        }

        await browserPage.goto(`https://coomer.st/artists?o=${pageNum}`, {
            waitUntil: "networkidle2",
            timeout: 60000,
        });

        await browserPage.waitForSelector("a.user-card", {
            timeout: 18000,
        });

        const artists = await browserPage.$$eval("a.user-card", cards =>
            cards.map(card => ({
                artista: card.querySelector(".user-card__name")?.textContent.trim(),
                image: card.querySelector("img")?.src || "",
                url: card.getAttribute("href"),
                platform: card.querySelector(".user-card__service")?.textContent.trim(),
            }))
        );

        console.log(`✅ Página ${pageNum}: ${artists.length} artistas`);
        await browserPage.close();
        return artists;

    } catch (err) {
        if (browserPage) {
            await browserPage.close().catch(() => {});
        }

        if (retry < MAX_RETRIES) {
            const waitTime = 8000 * (retry + 1) + Math.random() * 4000;
            console.log(`🔄 Reintentando página ${pageNum} en ${Math.round(waitTime/1000)}s... (intento ${retry + 1}/${MAX_RETRIES})`);
            await sleep(waitTime);
            return scrapePage(pageNum, retry + 1);
        }

        console.log(`❌ Error página ${pageNum} después de ${MAX_RETRIES} intentos: ${err.message}`);
        return [];
    }
}

/* ---------------- GUARDADO EN DB ---------------- */

function saveArtists(artists) {
    return new Promise((resolve) => {
        if (artists.length === 0) {
            resolve();
            return;
        }

        const sql = "INSERT IGNORE INTO artists (name, image, url, platform) VALUES (?, ?, ?, ?)";
        let pending = artists.length;

        for (const a of artists) {
            db.query(sql, [a.artista, a.image, a.url, a.platform], (err, result) => {
                if (err) {
                    console.log(`❌ Error guardando ${a.artista}: ${err.message}`);
                } else if (result.affectedRows === 1) {
                    counterNewArtists++;
                    console.log(`✅ Nuevo: ${a.artista}`);
                }
                pending--;
                if (pending === 0) resolve();
            });
        }
    });
}

/* ---------------- WORKER ---------------- */

async function worker(queue) {
    while (true) {
        const page = queue.shift();
        if (page === undefined) break;

        console.log(`📄 Procesando página ${page}`);
        const artists = await scrapePage(page);

        if (artists.length > 0) {
            await saveArtists(artists);
        }

        await sleep(randomDelay());
    }
}

/* ---------------- MAIN ---------------- */

async function main(initialPage, finalPage) {
    console.log(`🚀 Iniciando scraping desde ${initialPage} hasta ${finalPage} (concurrencia: ${CONCURRENCY})`);

    browser = await puppeteer.launch({
        executablePath: "/usr/bin/chromium",
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-blink-features=AutomationControlled",
            "--disable-features=IsolateOrigins,site-per-process",
        ],
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

    console.log(`\n✅ Finalizado. Nuevos artistas guardados: ${counterNewArtists}`);
}

module.exports = { main };
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../../DataBase/db.js");
const fs = require("fs");
let counterNewArtists = 0;
const CONCURRENCY = 5;

/* ---------------- UTILIDADES ---------------- */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}
// URL a scrapear = https://coomer.st/artists?o=(numero de pagina)
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
        const $ = cheerio.load(data);
        const posts = [];
        // selector de los elementos que contienen la información de cada artista:
        /*
        <a data-id="funkyfeetsfree" data-service="onlyfans" class="fancy-link fancy-link--kemono user-card" href="/onlyfans/user/funkyfeetsfree" data-discover="true" style="background-image: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.8)), url(&quot;//img.coomer.st/banners/onlyfans/funkyfeetsfree&quot;);"><div class="user-card__icon"><div class="user-card__user-icon"><picture class="fancy-image__picture"><img class="fancy-image__image" loading="lazy" src="//img.coomer.st/icons/onlyfans/funkyfeetsfree"></picture></div></div><div class="user-card__info"><span class="user-card__service" style="background-color: rgb(0, 140, 207);">OnlyFans</span><div class="user-card__name">funkyfeetsfree</div><div class="user-card__count"><b>0</b> favorite</div></div></a>
        selector img= #main > section > div.card-list.card-list--phone > div.card-list__items > a:nth-child(1) > div.user-card__icon > div > picture > img
        selector artista = #main > section > div.card-list.card-list--phone > div.card-list__items > a:nth-child(1) > div.user-card__info > div.user-card__name
        selector url = #main > section > div.card-list.card-list--phone > div.card-list__items > a:nth-child(1)
        selector plataforma = #main > section > div.card-list.card-list--phone > div.card-list__items > a:nth-child(1) > div.user-card__info > span
        */
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

/* ---------------- DB SAVE ---------------- */
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
/* ---------------- EXPORTS ---------------- */
module.exports = {
    main,
};
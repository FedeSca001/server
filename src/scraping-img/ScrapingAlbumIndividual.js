const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../DataBase/db.js");

/* ---------------- SELECTORES ---------------- */

const selectorCard = "div.relative.group\\/item.theItem";
const selectorUrl = "a[aria-label='download']";
const selectorImage = "img.grid-images_box-img";
const selectorTitle = "p.theName";
const selectorSize = "p.theSize";
const selectorDate = "span[class*='type-']";

/* ---------------- UTILIDADES ---------------- */

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const randomDelay = () => Math.floor(Math.random() * 1500) + 500;

/* ---------------- DATABASE ---------------- */

const dblength = () =>
    new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS total FROM albums", (err, rows) =>
            err ? reject(err) : resolve(rows[0].total)
        );
    });

const getAlbum = id =>
    new Promise((resolve, reject) => {
        db.query("SELECT * FROM albums WHERE id = ?", [id], (err, rows) =>
            err ? reject(err) : resolve(rows[0])
        );
    });

/* ---------------- DB SAVE ---------------- */

function saveCard(card) {
    const sql = `
        INSERT IGNORE INTO cards
        (album_id, title, image, url, size, date, type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            card.album_id,
            card.title,
            card.image,
            card.url,
            card.size,
            card.date,
            card.type,
        ],
        err => {
            if (err) console.error(`Error: ${err.message}`);
            else console.log(`Guardado: ${card.title}`);
        }
    );
}

/* ---------------- SCRAPING ---------------- */

const scrapePage = async (pageUrl, albumId) => {
    let page = 1;

    try {
        while (true) {
            const url = page === 1 ? pageUrl : `${pageUrl}?page=${page}`;

            console.log(`Scrapeando: ${url}`);

            const { data } = await axios.get(url, {
                timeout: 10000,
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                },
            });

            const $ = cheerio.load(data);

            $(selectorCard).each((_, el) => {
                const card = $(el);
                const href = card.find(selectorUrl).attr("href") || "";
                const className = card.find(selectorDate).attr("class") || "";
                const match = className.match(/type-([^\s]+)/);

                saveCard({
                    album_id: albumId,
                    title: card.find(selectorTitle).text().trim(),
                    url: href.startsWith("http")
                        ? href
                        : `https://bunkr.cr${href}`,
                    image: card.find(selectorImage).attr("src") || "",
                    size: card.find(selectorSize).text().trim(),
                    date: card.find("span.theDate").text().trim(),
                    type: match ? match[1] : "",
                });
            });

            // Si no existe la siguiente página, termina
            if ($(`a[href="?page=${page + 1}"]`).length === 0) break;

            page++;
        }

    } catch (err) {
        console.error(`Error al scrapear ${pageUrl}: ${err.message}`);
    }
};

/* ---------------- MAIN ---------------- */

const main = async () => {
    try {
        const total = await dblength();

        for (let i = 1; i <= total; i++) {
            const album = await getAlbum(i);
            if (!album) continue;
            await scrapePage(album.url, album.id);
            await sleep(randomDelay());
        }
    } catch (err) {
        console.error(err);
    }
};

module.exports = {
    scrapePage,
    dblength,
    getAlbum,
    main,
};
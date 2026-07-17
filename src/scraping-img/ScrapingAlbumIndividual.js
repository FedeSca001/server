const axios = require("axios");
const cheerio = require("cheerio");
const db = require("../DataBase/db.js");

/* ---------------- SELECTORES ---------------- */

const selectorCard = "div.relative.group\\/item.theItem";
const selectorUrl = "a[aria-label='download']";
const selectorImage = "img.grid-images_box-img";
const selectorTitle = "p.theName";
const selectorSize = "p.theSize";
const selectorDate = "span.theDate";
const selectorType = "span[class*='type-']";

/* ---------------- UTILIDADES ---------------- */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay() {
    return Math.floor(Math.random() * 1500) + 500;
}

/* ---------------- DATABASE ---------------- */

const dblength = () => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT COUNT(*) AS total FROM albums",
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows[0].total);
            }
        );
    });
};

const getAlbum = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM albums WHERE id = ?",
            [id],
            (err, rows) => {
                if (err) reject(err);
                else resolve(rows[0]);
            }
        );
    });
};

/* ---------------- SCRAPING ---------------- */

const scrapePage = async (page = 1) => {
    const url = `https://bunkr.cr/a/wU0KY6Ip?page=${page}`;

    try {
        const { data } = await axios.get(url, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);

        const cards = $(selectorCard);

        console.log(`Página ${page}`);
        console.log(`Cards encontradas: ${cards.length}`);

        const results = [];

        cards.each((i, el) => {
            const card = $(el);

            const album = {
                title: card.find(selectorTitle).text().trim(),
                url: card.find(selectorUrl).attr("href") || "",
                image: card.find(selectorImage).attr("src") || "",
                size: card.find(selectorSize).text().trim(),
                date: card.find(selectorDate).text().trim(),
                type: card.find(selectorType).text().trim(),
            };

            results.push(album);
        });

        console.table(results);

        return results;

    } catch (err) {
        console.error(`Error al scrapear página ${page}:`, err.message);
        return [];
    }
};

/* ---------------- MAIN ---------------- */

const main = async () => {
    try {
        const total = await dblength();

        console.log(`Álbumes en la BD: ${total}`);

        const albums = await scrapePage(1);

        console.log(`Se obtuvieron ${albums.length} elementos.`);

        /*
        for (let i = 1; i <= total; i++) {
            const album = await getAlbum(i);
            console.log(album);
            await sleep(randomDelay());
        }
        */

    } catch (err) {
        console.error(err);
    }
};

main();
module.exports = { scrapePage, dblength, getAlbum, main };
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

/* ---------------- DB SAVE ---------------- */
function saveCard(card) {
    const sql = "INSERT IGNORE INTO cards (album_id, title, image, url, size, date, type) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [card.album_id, card.title, card.image, card.url, card.size, card.date, card.type], (err, result) => {
        if (err) {
            console.error(`Error al guardar el álbum: ${err.message}`);
        } else {
            console.log(`Álbum guardado: ${card.title}`);
        }
    });
}

/* ---------------- SCRAPING ---------------- */

const scrapePage = async (pageUrl) => {
    //const pageUrl = `https://bunkr.cr/a/wU0KY6Ip?page=${page}`;

    try {
        const { data } = await axios.get(pageUrl, {
            timeout: 10000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const cards = $(selectorCard);
        cards.each((i, el) => {
            const card = $(el);
            const href = card.find(selectorUrl).attr("href") || "";
            const typeSpan = card.find(selectorDate);
            const className = typeSpan.attr("class") || "";
            const match = className.match(/type-([^\s]+)/);

            const album = {
                title: card.find(selectorTitle).text().trim(),
                url: href.startsWith("http")
                    ? href
                    : `https://bunkr.cr${href}`,
                image: card.find(selectorImage).attr("src") || "",
                size: card.find(selectorSize).text().trim(),
                date: card.find("span.theDate").text().trim(),
                type: match ? match[1] : "",
            };
            saveCard(album);
        });

    } catch (err) {
        console.error(`Error al scrapear página ${pageUrl}: ${err.message}`);
        return [];
    }
};

/* ---------------- MAIN ---------------- */

const main = async () => {
    try {
        const total = await dblength();
        console.log(`Álbumes en la BD: ${total}`);
       
        for (let i = 1; i <= total; i++) {
            const album = await getAlbum(i);
            console.log(album);
            // aqui el id = i (por cada numero de album) y se puede usar para scrapear los cards individuales
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
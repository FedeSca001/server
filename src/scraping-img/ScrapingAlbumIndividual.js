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

/* ---------------- LIMPIEZA DE DUPLICADOS ---------------- */

// Limpia duplicados por URL (útil para datos antiguos)
const cleanDuplicatesByUrl = () => {
    return new Promise((resolve, reject) => {
        db.query(`
            DELETE FROM cards 
            WHERE id NOT IN (
                SELECT * FROM (
                    SELECT MIN(id) 
                    FROM cards 
                    GROUP BY url
                ) AS subquery
            )
        `, (err, result) => {
            if (err) {
                console.error("Error limpiando duplicados:", err.message);
                reject(err);
            } else {
                if (result.affectedRows > 0) {
                    console.log(`🧹 ${result.affectedRows} duplicados eliminados por URL.`);
                }
                resolve();
            }
        });
    });
};

// Limpia duplicados de una URL específica
const deleteDuplicateByUrl = (url) => {
    return new Promise((resolve) => {
        db.query(
            "DELETE FROM cards WHERE url = ? AND id NOT IN (SELECT MIN(id) FROM cards WHERE url = ?)",
            [url, url],
            (err, result) => {
                if (err) console.error(`Error limpiando ${url}:`, err.message);
                else if (result.affectedRows > 0) {
                    console.log(`🧹 Duplicado eliminado: ${url}`);
                }
                resolve();
            }
        );
    });
};

/* ---------------- DB SAVE ---------------- */

async function saveCard(card) {
    try {
        // Limpiamos por si acaso
        await deleteDuplicateByUrl(card.url);

        const sql = `
            INSERT IGNORE INTO cards
            (album_id, title, image, url, size, date, type)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [
            card.album_id,
            card.title,
            card.image,
            card.url,
            card.size,
            card.date,
            card.type,
        ], (err) => {
            if (err) console.error(`Error guardando: ${err.message}`);
            else console.log(`✅ Guardado: ${card.title}`);
        });
    } catch (e) {
        console.error("Error en saveCard:", e.message);
    }
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
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
                },
            });

            const $ = cheerio.load(data);

            $(selectorCard).each((_, el) => {
                const cardEl = $(el);
                const href = cardEl.find(selectorUrl).attr("href") || "";
                const className = cardEl.find(selectorDate).attr("class") || "";
                const match = className.match(/type-([^\s]+)/);

                const cardData = {
                    album_id: albumId,
                    title: cardEl.find(selectorTitle).text().trim(),
                    url: href.startsWith("http") ? href : `https://bunkr.cr${href}`,
                    image: cardEl.find(selectorImage).attr("src") || "",
                    size: cardEl.find(selectorSize).text().trim(),
                    date: cardEl.find("span.theDate").text().trim(),
                    type: match ? match[1] : "",
                };

                if (cardData.url) {
                    saveCard(cardData);
                }
            });

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
        console.log("🔍 Limpiando duplicados existentes...");
        await cleanDuplicatesByUrl();   // Limpieza global al inicio

        const total = await dblength();
        console.log(`🚀 Iniciando scraping de ${total} álbumes...`);

        for (let i = 1; i <= total; i++) {
            const album = await getAlbum(i);
            if (!album) continue;

            console.log(`📂 Procesando álbum ${i}/${total}: ${album.title}`);
            await scrapePage(album.url, album.id);
            await sleep(randomDelay());
        }

        console.log("✅ Scraping y limpieza finalizados.");
    } catch (err) {
        console.error("Error en main:", err);
    }
};

module.exports = {
    scrapePage,
    dblength,
    getAlbum,
    main,
    cleanDuplicatesByUrl   // exportado por si quieres usarlo manualmente
};
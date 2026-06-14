const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const folder = path.resolve(__dirname, "../../../downloads/text");
const filePath = path.join(folder, "albums.txt");

/* ----------------- CREAR CARPETA ----------------- */

const ensureFolder = () => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "", "utf8");
    }
};

/* ----------------- GUARDAR DATOS ----------------- */

const saveAlbums = (albums) => {
    const text = albums
        .map(album => `${album.title} | ${album.image} | ${album.url}`)
        .join("\n") + "\n";

    fs.appendFileSync(filePath, text, "utf8");
};

/* ----------------- SCRAPING POR PÁGINA ----------------- */

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

            const albumUrl = $(el).attr("href");

            if (title && image) {
                albums.push({
                    title,
                    image,
                    url: albumUrl
                });

                console.log(`Album encontrado: ${title} | ${image}`);
            }
        });

        return albums;

    } catch (err) {
        console.log(`Error página ${page}: ${err.message}`);
        return [];
    }
}

/* ----------------- SCRAPING GENERAL ----------------- */

async function main() {
    ensureFolder();

    for (let page = 1; page <= 19237; page++) {
        console.log(`Procesando página ${page}`);

        const albums = await scrapePage(page);

        if (albums.length) {
            saveAlbums(albums);
        }
    }

    console.log("Finalizado");
}

/* ----------------- EXPORT ----------------- */

module.exports = {
    scrapePage,
    main,
    saveAlbums
};
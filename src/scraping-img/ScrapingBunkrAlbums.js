const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const baseUrl = "https://bunkr.si/a/";
const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const LENGTH = 8;
const CONCURRENCY = 20;

const folder = path.resolve(__dirname, "../../../downloads/text");
const filePath = path.join(folder, "albums.txt");

// scraping
const scrapingBunkr = async (url) => {
    try {
        const { data } = await axios.get(url, {
            timeout: 5000,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);

        const title = $("h1").first().text().trim();

        return title || null;
    } catch {
        return null;
    }
};

// base62
const toBase62 = (num) => {
    const base = alphabet.length;
    let str = "";

    for (let i = 0; i < LENGTH; i++) {
        str = alphabet[num % base] + str;
        num = Math.floor(num / base);
    }

    return str;
};

// generar ids sin memoria
const total = Math.pow(alphabet.length, LENGTH);
let index = 0;

// asegurar carpeta
const ensureFolder = () => {
    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, { recursive: true });
    }

    if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, "", "utf8");
    }
};

// guardar en archivo (append seguro)
const saveToFile = (data) => {
    fs.appendFileSync(
        filePath,
        `${data.title} | ${data.url}\n`,
        "utf8"
    );
};

// worker
const worker = async (seen = new Set()) => {
    while (index < total) {
        const current = index++;
        const id = toBase62(current);
        const url = `${baseUrl}${id}`;

        const title = await scrapingBunkr(url);

        if (title && !seen.has(url)) {
            seen.add(url);

            const entry = {
                title,
                url,
            };

            console.log("FOUND:", title);

            saveToFile(entry);
        }
    }
};

const findAlbums = async () => {
    console.log("Iniciando scraping...");

    ensureFolder();

    const seen = new Set();

    const workers = Array.from({ length: CONCURRENCY }).map(() =>
        worker(seen)
    );

    await Promise.all(workers);

    console.log("Terminado.");
};

module.exports = { findAlbums, scrapingBunkr };
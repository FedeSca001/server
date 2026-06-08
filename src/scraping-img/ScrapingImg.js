const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const folder = path.resolve(__dirname, "../../../downloads");
fs.mkdirSync(folder, { recursive: true });

const scrapingImagenes = async (url) => {
    console.log("\n===== SCRAPING UNIVERSAL DE IMÁGENES =====");
    console.log("URL:", url);

    try {
        const { data } = await axios.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
            },
        });

        const $ = cheerio.load(data);

        const imagenes = new Set();

        // 1. <img src>, data-src, data-original, etc.
        $("img").each((_, el) => {
            const attrs = ["src", "data-src", "data-original", "data-lazy", "data-url"];

            attrs.forEach((attr) => {
                let val = $(el).attr(attr);
                if (val) imagenes.add(val);
            });

            // srcset (muy importante)
            const srcset = $(el).attr("srcset");
            if (srcset) {
                srcset.split(",").forEach((item) => {
                    const url = item.trim().split(" ")[0];
                    if (url) imagenes.add(url);
                });
            }
        });

        // 2. background-image CSS
        $("[style]").each((_, el) => {
            const style = $(el).attr("style");
            const match = /url\(["']?(.*?)["']?\)/g.exec(style || "");
            if (match?.[1]) imagenes.add(match[1]);
        });

        // 3. convertir a URLs absolutas
        const finalImages = [...imagenes]
            .filter(Boolean)
            .map((img) => {
                try {
                    return new URL(img, url).href;
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        console.log(`Encontradas: ${finalImages.length} imágenes`);

        // 4. descargar
        for (let i = 0; i < finalImages.length; i++) {
            const imgUrl = finalImages[i];

            try {
                const response = await axios.get(imgUrl, {
                    responseType: "arraybuffer",
                });

                const ext =
                    path.extname(new URL(imgUrl).pathname) || ".jpg";

                const filePath = path.join(folder, `img_${i + 1}${ext}`);

                fs.writeFileSync(filePath, response.data);

                console.log(`✔ ${i + 1}/${finalImages.length}`);
            } catch (err) {
                console.log(`❌ Error: ${imgUrl}`);
            }
        }

        console.log("\n✅ Finalizado");

        return finalImages;
    } catch (error) {
        console.error("Error scraping:", error.message);
        return [];
    }
};

module.exports = { scrapingImagenes };
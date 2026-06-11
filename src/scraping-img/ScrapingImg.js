const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

const folder = path.resolve(__dirname, "../../../downloads");
fs.mkdirSync(folder, { recursive: true });

const scrapingImagenes = async (url, urlNumber) => {
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

        // 1. Obtener imágenes desde etiquetas <img>
        $("img").each((_, el) => {
            const attrs = [
                "src",
                "data-src",
                "data-original",
                "data-lazy",
                "data-url",
            ];

            attrs.forEach((attr) => {
                const val = $(el).attr(attr);
                if (val) {
                    imagenes.add(val);
                }
            });

            // Obtener imágenes desde srcset
            const srcset = $(el).attr("srcset");
            if (srcset) {
                srcset.split(",").forEach((item) => {
                    const img = item.trim().split(" ")[0];
                    if (img) {
                        imagenes.add(img);
                    }
                });
            }
        });

        // 2. Obtener imágenes desde background-image
        $("[style]").each((_, el) => {
            const style = $(el).attr("style");
            const match = /url\(["']?(.*?)["']?\)/.exec(style || "");

            if (match?.[1]) {
                imagenes.add(match[1]);
            }
        });

        // 3. Convertir a URLs absolutas
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

        // 4. Descargar imágenes
        for (let i = 0; i < finalImages.length; i++) {
            const imgUrl = finalImages[i];

            try {
                const response = await axios.get(imgUrl, {
                    responseType: "arraybuffer",
                });

                let ext = path.extname(new URL(imgUrl).pathname);

                if (!ext) {
                    ext = ".jpg";
                }

                // Nombre: 1_1.jpg, 1_2.png, 2_1.webp, etc.
                const fileName = `${urlNumber}_${i + 1}${ext}`;
                const filePath = path.join(folder, fileName);

                fs.writeFileSync(filePath, response.data);

                console.log(
                    `✔ ${i + 1}/${finalImages.length} -> ${fileName}`
                );
            } catch (err) {
                console.log(`❌ Error descargando: ${imgUrl}`);
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
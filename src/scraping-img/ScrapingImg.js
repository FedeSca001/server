const fs = require("fs");
const path = require("path");
const axios = require("axios");
const cheerio = require("cheerio");

// 📁 Carpeta de descarga (robusta)
const folder = path.resolve(__dirname, "../../../downloads");

// 🧱 Asegurar que exista
fs.mkdirSync(folder, { recursive: true });

const scrapingImagenes = async (url) => {
    console.log("\n===== SCRAPING DE IMÁGENES =====");
    console.log("URL:", url);

    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const imagenes = [];

        $("img").each((_, el) => {
            let src = $(el).attr("src");
            if (!src) return;

            try {
                src = new URL(src, url).href;
                imagenes.push(src);
            } catch {}
        });

        const unicas = [...new Set(imagenes)];

        console.log(`Descargando ${unicas.length} imágenes...\n`);

        for (let i = 0; i < unicas.length; i++) {
            const imgUrl = unicas[i];

            try {
                const response = await axios.get(imgUrl, {
                    responseType: "arraybuffer",
                });

                const ext = path.extname(new URL(imgUrl).pathname) || ".jpg";
                const filePath = path.join(folder, `img_${i + 1}${ext}`);

                fs.writeFileSync(filePath, response.data);

                console.log(`✔ Guardada: ${filePath}`);
            } catch (err) {
                console.log(`❌ Error con ${imgUrl}: ${err.message}`);
            }
        }

        console.log("\n✅ Descarga finalizada");

        return unicas;

    } catch (error) {
        console.error("Error:", error.message);
        return [];
    }
};

module.exports = { scrapingImagenes };
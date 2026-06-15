const puppeteer = require("puppeteer");

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scrapingVideo = async (url) => {
    if (!url) {
        console.log("❌ Debes proporcionar una URL");
        return;
    }

    console.log("\n===== SCRAPING VIDEOS (PUPPETEER) =====");
    console.log("URL:", url);

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-blink-features=AutomationControlled',
                '--disable-web-security',
                '--disable-features=IsolateOrigins,site-per-process'
            ],
            defaultViewport: null
        });

        const page = await browser.newPage();

        // Anti-detección
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36");
        
        await page.evaluateOnNewDocument(() => {
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
        });

        await page.setViewport({ width: 1920, height: 1080 });

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 60000
        });

        // Reemplazo de waitForTimeout
        await sleep(3050);

        // Scroll fuerte para Erome (carga videos dinámicos)
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await sleep(3000);

        // Scroll adicional
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await sleep(2000);

        const vids = await page.evaluate(() => {
            const set = new Set();

            // Videos y sources
            document.querySelectorAll("video, source").forEach(el => {
                if (el.src) set.add(el.src);
                if (el.currentSrc) set.add(el.currentSrc);
            });

            // Iframes
            document.querySelectorAll("iframe").forEach(el => {
                if (el.src) set.add(el.src);
            });

            // Meta tags
            document.querySelectorAll('meta[property="og:video"], meta[name="twitter:player"], meta[property="og:video:url"]').forEach(el => {
                if (el.content) set.add(el.content);
            });

            // Específico para Erome (videos en divs con data-src o similar)
            document.querySelectorAll('[data-src], [data-video-src], video-js').forEach(el => {
                const src = el.getAttribute('data-src') || el.getAttribute('data-video-src');
                if (src) set.add(src);
            });

            return [...set];
        });

        console.log(`✅ Encontrados ${vids.length} enlaces de video/imagen:`);
        vids.forEach((link, i) => console.log(`${i + 1}. ${link}`));

        return vids;

    } catch (err) {
        console.error("❌ Error scraping video:", err.message);
    } finally {
        if (browser) await browser.close();
    }
};

module.exports = { scrapingVideo };
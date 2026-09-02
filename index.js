const express = require("express");
const readline = require("readline");
const path = require("path");
const apiMotoGp = require("./src/show-results/scrapingBunkr/apiMotoGp.js")
const apiAlbumsRouter = require("./src/show-results/scrapingBunkr/apiAlbums.js");
const apiElementsCard = require("./src/show-results/scrapingBunkr/apiCards.js");
const apiFavoritos = require("./src/show-results/scrapingBunkr/apiFavoritos.js");
const BeerSystem = require("./src/beer-system/BeerSystem.js");

const commands = {
    videos: async (rl) => {
        rl.question("URL del video: ", async (url) => {
            try {
                await require("./src/Scraping-video/ScrapingVideo")(url.trim());
            } catch (e) {
                console.error(e.message);
            }
            mostrarMenu();
        });
    },

    imagenes: async (rl) => {
        rl.question("URL: ", async (url) => {
            try {
                await require("./src/scraping-img/ScrapingImg")(url.trim());
            } catch (e) {
                console.error(e.message);
            }
            mostrarMenu();
        });
    },

    iterar: async (rl) => {
        rl.question("base + iteraciones + sufijo: ", async (i) => {
            try {
                const [b, t, s] = i.split(" ");
                await require("./src/scraping-img/ScrapingIter")(b, Number(t), s);
            } catch (e) {
                console.error(e.message);
            }
            mostrarMenu();
        });
    },

    bunkr: async (rl) => {
        rl.question("inicio fin: ", async (r) => {
            try {
                const [a, b] = r.trim().split(" ").map(Number);
                const { main } = require("./src/scraping-img/ScrapingBunkrAlbums.js");
                await main(a, b);
            } catch (e) {
                console.error(e);
            }
            mostrarMenu();
        });
    },

    bunkrTitulos: async (rl) => {
        rl.question("Presiona Enter para iniciar: ", async () => {
            try {
                const { main } = require("./src/scraping-img/ScrapingAlbumIndividual.js");
                await main();
            } catch (e) {
                console.error(e);
            }
            mostrarMenu();
        });
    },

    // ====================== LIMPIAR CARDS ======================
    limpiarCards: async (rl) => {
        rl.question("¿Deseas limpiar la tabla Cards de duplicados? (S/N): ", async (r) => {
            if (!["s", "si"].includes(r.toLowerCase())) {
                console.log("Operación cancelada.");
                return mostrarMenu();
            }

            try {
                const { cleanDuplicatesByUrl } = require("./src/scraping-img/ScrapingAlbumIndividual.js");
                await cleanDuplicatesByUrl();
            } catch (error) {
                console.error("Error al limpiar cards:", error);
            } finally {
                mostrarMenu();
            }
        });
    },

    server: async () => iniciarServidor(),
    salir: async () => cerrarAplicacion()
};

const app = express();
const PORT = process.env.PORT || 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let server = null;

/* EXPRESS */
app.use(express.json());
app.get("/", (req, res) => res.send("¡Hola mundo 🌍"));
app.use("/apiAlbums", apiAlbumsRouter);
app.use("/apiElement", apiElementsCard);
app.use("/apiFavoritos", apiFavoritos);
app.use("/apiMotoGp", apiMotoGp);
app.use("/beer-system", BeerSystem);
app.use("/html/beer", express.static(path.join(__dirname, "src/html/Beer")));
app.use("/html/bunkr", express.static(path.join(__dirname, "src/html/bunkr")));
app.use("/html/motogp", express.static(path.join(__dirname, "src/html/motoGp")));
app.use((req, res) => res.status(404).json({ error: "Ruta no encontrada" }));

const iniciarServidor = () => {
    if (server) return mostrarMenu();
    server = app.listen(PORT, () => {
        console.log("Servidor en puerto:", PORT);
        mostrarMenu();
    });
};

const cerrarAplicacion = () => {
    rl.close();
    if (server) server.close(() => process.exit(0));
    else process.exit(0);
};

/* MENU */
const opciones = () => console.log(`
1. Scraping
2. Videos
3. Imagenes
4. Iterar
5. Bunkr
6. Scraping Bunkr Titulos
7. Limpiar duplicados Cards
8. Salir
`);

function mostrarMenu() {
    opciones();

    rl.question("Opcion: ", async (op) => {
        op = op.toLowerCase();
        const map = {
            "1": "server",
            "server": "server",
            "2": "videos",
            "videos": "videos",
            "3": "imagenes",
            "img": "imagenes",
            "imagenes": "imagenes",
            "4": "iterar",
            "iterar": "iterar",
            "5": "bunkr",
            "bunkr": "bunkr",
            "6": "bunkrTitulos",
            "bunkrTitulos": "bunkrTitulos",
            "7": "limpiarCards",
            "limpiar": "limpiarCards",
            "8": "salir",
            "salir": "salir",
            "exit": "salir"
        };
        const cmd = map[op];

        if (!cmd || !commands[cmd]) {
            console.log("Opcion invalida");
            return mostrarMenu();
        }

        try {
            await commands[cmd](rl);
        } catch (e) {
            console.error(e.message);
            mostrarMenu();
        }
    });
}

iniciarServidor();
mostrarMenu();
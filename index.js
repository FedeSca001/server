const express = require("express");
const readline = require("readline");

const scrapingRaceRouter = require("./src/show-results/scraping-race");
const { scrapingImagenes } = require("./src/scraping-img/ScrapingImg");
const { iterarScraping } = require("./src/scraping-img/ScrapingIter");
const { main } = require("./src/scraping-img/ScrapingBunkrAlbums");

const app = express();
const PORT = process.env.PORT || 3000;

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

let server = null;

/* ---------------- EXPRESS ---------------- */

app.use(express.json());

app.get("/", (req, res) => {
    res.send("¡Hola, mundo! 🌍");
});

app.use("/scrapingRace", scrapingRaceRouter);

app.use((req, res) => {
    res.status(404).json({
        error: "Ruta no encontrada",
    });
});

/* ---------------- SERVIDOR ---------------- */

function iniciarServidor() {
    if (server) {
        console.log(`Servidor ya iniciado en el puerto ${PORT}`);
        return mostrarMenu();
    }

    server = app.listen(PORT, () => {
        console.log(`Servidor iniciado: http://localhost:${PORT}`);
        mostrarMenu();
    });
}

function detenerServidor() {
    if (!server) {
        console.log("No hay servidor iniciado");
        return mostrarMenu();
    }

    server.close(() => {
        server = null;
        console.log("Servidor detenido");
        mostrarMenu();
    });
}

function cerrarAplicacion() {
    if (server) {
        server.close(() => {
            rl.close();
            process.exit(0);
        });
    } else {
        rl.close();
        process.exit(0);
    }
}

/* ---------------- MENÚ ---------------- */

function mostrarOpciones() {
    console.log(`
========= MENÚ =========
1. Scraping
2. Detener servidor
3. Scraping imágenes
4. Iterar URLs
5. Bunkr
6. Salir
========================
`);
}

function mostrarMenu() {
    mostrarOpciones();

    rl.question("Seleccione una opción: ", async (opcion) => {
        opcion = opcion.toLowerCase();

        try {
            switch (opcion) {
                case "1":
                case "scraping":
                    return iniciarServidor();

                case "2":
                case "detener":
                    return detenerServidor();

                case "3":
                case "img":
                case "imagenes":
                    return pedirUrlImagen();

                case "4":
                case "iterar":
                    rl.question("Introduce la baseURL, número de iteraciones y sufijo (separados por espacios): ", async (input) => {
                        try {
                            const [baseUrl, iterations, suffix] = input.split(" ");
                            await iterarScraping(baseUrl, Number(iterations), suffix);
                        } catch (err) {
                            console.error(err.message);
                        }
                        return mostrarMenu();
                    });

                case "5":
                case "bunkr":
                    rl.question(
                        "Introduce el numero inicial y final de las páginas separados por espacios: ",
                        async (respuesta) => {
                            try {
                                const [start, end] = respuesta.split(" ").map(Number);
                                await main(start, end);
                            } catch (err) {
                                console.error(err.message);
                            }
                            return mostrarMenu();
                        }
                    );

                case "6":
                case "salir":
                case "exit":
                    return cerrarAplicacion();

                default:
                    console.log("Opción no válida");
                    return mostrarMenu();
            }
        } catch (error) {
            console.error(error.message);
            mostrarMenu();
        }
    });
}

/* ---------------- ACCIONES ---------------- */

function pedirUrlImagen() {
    rl.question("Introduce la URL: ", async (url) => {
        try {
            await scrapingImagenes(url);
        } catch (err) {
            console.error(err.message);
        }

        mostrarMenu();
    });
}

function pedirIteracion() {
    rl.question(
        "BaseURL Iteraciones Sufijo (separados por espacios): ",
        async (input) => {
            try {
                const [baseUrl, iterations, suffix] = input.split(" ");

                await iterarScraping(
                    baseUrl,
                    Number(iterations),
                    suffix
                );
            } catch (err) {
                console.error(err.message);
            }

            mostrarMenu();
        }
    );
}

/* ---------------- INICIO ---------------- */

mostrarMenu();
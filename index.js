const express = require("express");
const readline = require("readline");

const scrapingRaceRouter = require("./src/show-results/scraping-race");
const {scrapingImagenes} = require("./src/scraping-img/ScrapingImg.js");
const {iterarScraping} = require("./src/scraping-img/ScrapingIter.js");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Hola, mundo! 🌍");
});

app.use("/scrapingRace", scrapingRaceRouter);

app.use((req, res) => {
  res.status(404).send({ error: "Ruta no encontrada" });
});

let server = null;
const PORT = process.env.PORT || 3000;

function mostrarMenu() {
  console.log("\n===== MENÚ =====");
  console.log("1. scraping");
  console.log("2. detener");
  console.log("3. img");
  console.log("4. Iterar");
  console.log("5. salir");
  console.log("================");

  rl.question("¿Qué quieres hacer? ", (opcion) => {
    switch (opcion.toLowerCase()) {
      case "1":
      case "scraping":
        iniciarServidor();
        break;

      case "2":
      case "detener":
        detenerServidor();
        break;

      case "3":
      case "img":
      case "Imagenes":
          rl.question("Introduce la URL: ", async (url) => {
              try {
                  await scrapingImagenes(url);
              } catch (error) {
                  console.error("Error:", error.message);
              }
              mostrarMenu();
          });
          break;

      case "4":
      case "iterar":
        rl.question("Introducir Primera parte de URL, luego numero de iteraciones y luego fin de URL: (Separados por espacios)", async (input) => {
          try {
            const [baseUrl, iterations, suffix] = input.split(" ");
            await iterarScraping(baseUrl, parseInt(iterations), suffix);
          } catch (error) {
              console.error("Error:", error.message);
          }
          mostrarMenu();
        });
        break;

      case "5":
      case "salir":
      case "exit":
        cerrarAplicacion();
        break;

      default:
        console.log("Opción no válida");
        mostrarMenu();
    }
  });
}

function iniciarServidor() {
  if (server) {
    console.log(`El servidor ya está ejecutándose en el puerto ${PORT}`);
    return mostrarMenu();
  }

  server = app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
    mostrarMenu();
  });
}

function detenerServidor() {
  if (!server) {
    console.log("No hay ningún servidor en ejecución");
    return mostrarMenu();
  }

  server.close(() => {
    console.log("Servidor detenido");
    server = null;
    mostrarMenu();
  });
}

function cerrarAplicacion() {
  if (server) {
    server.close(() => {
      console.log("Aplicación cerrada");
      rl.close();
      process.exit(0);
    });
  } else {
    console.log("Aplicación cerrada");
    rl.close();
    process.exit(0);
  }
}

mostrarMenu();
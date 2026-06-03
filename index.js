const express = require("express");
const readline = require("readline");

const scrapingRaceRouter = require("./src/show-results/scraping-race");

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
  console.log("3. salir");
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
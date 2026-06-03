const express = require("express");
const app = express();

const readline = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

const scrapingRaceRouter = require("./src/show-results/scraping-race");

app.use(express.json());

app.get("/", (req, res) => {
  res.send("¡Hola, mundo! 🌍");
});

app.use("/scrapingRace", scrapingRaceRouter);

app.use((req, res) => {
  res.status(404).send({ error: "Ruta no encontrada" });
});

readline.question("¿Deseas iniciar el servidor? (s/n) ", (answer) => {
  const accepted = ["s", "si", "y", "yes"];

  if (accepted.includes(answer.toLowerCase())) {
    const PORT = process.env.PORT || 3000;

    const server = app.listen(PORT, () => {
      console.log(`Servidor iniciado en el puerto ${PORT}`);
      console.log("Escribe 'exit' para detener el servidor.");
    });

    readline.on("line", (input) => {
      if (input.trim().toLowerCase() === "exit") {
        console.log("Deteniendo servidor...");

        server.close(() => {
          console.log("Servidor detenido.");
          readline.close();
          process.exit(0);
        });
      }
    });
  } else {
    console.log("Servidor no iniciado. Saliendo...");
    readline.close();
    process.exit(0);
  }
});
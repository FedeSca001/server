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

let PORT = process.env.PORT || 3000;

readline.on("line", (input) => {
    const newPort = Number(input);
    if (!isNaN(newPort) && newPort > 0 && newPort <= 65535) {
      PORT = newPort;
    } else if (input === "exit") {
      console.log("Saliendo del programa...");
      process.exit(0);
    }

    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
    readline.close();
  }
);
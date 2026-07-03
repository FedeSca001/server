console.log("Bienvenido al menú de scraping");
// debe buscar en la base datos scraper
const db = require("./src/db/db.js");

const input = document.getElementById("urlInput");
const btn = document.getElementById("buscarSql");
const resultado = [];
const findAlbum = async (input) => {
    db.query("SELECT * FROM albums WHERE title LIKE ?", [`%${input}%`], (err, results) => {
        resultado.push(...results);
        console.log("Resultados encontrados:", results);
    });
}

btn.addEventListener("click", () => {
    findAlbum(input.value);
});
input.addEventListener("keypress", function(event) {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
        findAlbum(input.value);
    }
});
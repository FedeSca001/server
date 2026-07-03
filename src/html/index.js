console.log("Bienvenido al menú de scraping");
// debe buscar en la base datos scraper
const db =require("./src/db/db.js");

const input = document.getElementById("urlInput");

input.addEventListener("keypress", function(event) {
    console.log("Key pressed:", event.key);
});
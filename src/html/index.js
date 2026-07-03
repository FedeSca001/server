console.log("Bienvenido al menú de scraping");
// debe buscar en la base datos scraper
const db =require("./src/db/db.js");

const input = document.getElementById("urlInput");
const resultado = [];
const findAlbum = async (input) => {
    const sql = "SELECT * FROM albums WHERE title LIKE ?";
    const searchTerm = `%${input}%`;
    db.query(sql, [searchTerm], (err, results) => {
        if (err) {
            console.error("Error al buscar en la base de datos:", err);
            return;
        }
        console.log("Resultados encontrados:", results);
        resultado.push(...results);
    });
}

input.addEventListener("keypress", function(event) {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
        findAlbum(input.value);
    }
});
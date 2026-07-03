const axios = require("axios");
const listado = document.getElementById("resultList");
const input = document.getElementById("urlInput");
const btn = document.getElementById("buscarSql");
const resultado = [];
const buscarAlbums = async (input) => {
    try {
        const response = await axios.get(`/apiAlbums/${input}`);
        resultado.push(...response.data);
        console.log("Resultados encontrados:", response.data);
        for (const album of response.data) {
            const li = document.createElement("li");
            li.textContent = `Título: ${album.title}, Imagen: ${album.image}, URL: ${album.url}`;
            listado.appendChild(li);
        }
    } catch (error) {
        console.error("Error al buscar álbum:", error.message);
    }
};

btn.addEventListener("click", () => {
    buscarAlbums(input.value);
});
input.addEventListener("keypress", function(event) {
    console.log("Key pressed:", event.key);
    if (event.key === "Enter") {
        buscarAlbums(input.value);
    }
});
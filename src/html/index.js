const listado = document.getElementById("resultList");
const input = document.getElementById("urlInput");
const btn = document.getElementById("buscarSql");

async function buscarAlbums(texto) {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/${encodeURIComponent(texto)}`);

        if (!response.ok) {
            throw new Error("Error en la petición");
        }
        const albums = await response.json();
        listado.innerHTML = "";
        for (const album of albums) {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>Título:</h3> ${album.title}<br>
                <img src="${album.image}" alt="${album.title}" width="100"><br>
                <a href="${album.url}" target="_blank">Ver álbum</a>
            `;

            listado.appendChild(li);
        }
    } catch (error) {
        console.error("Error al buscar álbum:", error);
    }
}

btn.addEventListener("click", () => {
    buscarAlbums(input.value.trim());
});

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        buscarAlbums(input.value.trim());
    }
});
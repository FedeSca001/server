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
            /*
            Necesito agrefar un <li> por cada album que encuentre en la base de datos, y dentro de ese <li> necesito agregar el titulo, la imagen y la url del album.
            */
            li.innerHTML = `
                <strong>Título:</strong> ${album.title}<br>
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
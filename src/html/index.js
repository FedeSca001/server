const listado = document.getElementById("resultList");
const input = document.getElementById("urlInput");
const btn = document.getElementById("buscarSql");
const randomBtn = document.getElementById("getRandomAlbums");
const randomList = document.getElementById("randomList");
const topElementsBtn = document.getElementById("getTopElements");
const topElementsList = document.getElementById("topElementsList");


const getTopElements = async () => {
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/top");
        const albums = await response.json();
        topElementsList.innerHTML = "";
        for (const album of albums) {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>${album.title}</h3>
                <img src="${album.image}" alt="${album.title}">
                <a href="${album.url}" target="_blank">Ver álbum</a>
            `;
            topElementsList.appendChild(li);
        }
    } catch (error) {
        console.error("Error al obtener álbumes:", error);
    }
};

const getRandomAlbums = async () => {
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/random");
        const albums = await response.json();
        console.log(albums);
        
        randomList.innerHTML = "";
        for (const album of albums) {
            const li = document.createElement("li");
        li.innerHTML = `
            <h3>${album.title}</h3>
            <img src="${album.image}" alt="${album.title}">
            <a href="${album.url}" target="_blank">Ver álbum</a>
        `;
            randomList.appendChild(li);
        }
    } catch (error) {
        console.error("Error al obtener álbumes aleatorios:", error);
    }
};

async function buscarAlbums(texto) {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/input/${encodeURIComponent(texto)}`);

        if (!response.ok) {
            throw new Error("Error en la petición");
        }
        const albums = await response.json();
        listado.innerHTML = "";
        for (const album of albums) {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>${album.title}</h3>
                <img src="${album.image}" alt="${album.title}">
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

randomBtn.addEventListener("click", () => {
    getRandomAlbums();
});

topElementsBtn.addEventListener("click", () => {
    getTopElements();
});
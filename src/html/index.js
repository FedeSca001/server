const listado = document.getElementById("resultList");
const btn = document.getElementById("buscarSql");
const listaElementsCard = document.getElementById("elementsList");
const btnElementsCard = document.getElementById("buscarElemento");
const input = document.getElementById("urlInput");
const elementInput = document.getElementById("elementInput");
const randomBtn = document.getElementById("getRandomAlbums");
const randomList = document.getElementById("randomList");
const topElementsBtn = document.getElementById("getTopElements");
const topElementsList = document.getElementById("topElementsList");
const moreElementsBtn = document.getElementById("moreElements");

let offset = 0;
let albums = [];

/* ---------------- TOP ALBUMS ---------------- */

const renderTopAlbums = () => {
    topElementsList.innerHTML = "";

    for (const album of albums) {
        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${album.title}</h3>
            <img src="${album.image}" alt="${album.title}">
            <a href="${album.url}" target="_blank">Ver álbum</a>
            <button class="btn btn-danger" onclick="deleteAlbum(${album.id})">Eliminar</button>
        `;
        topElementsList.appendChild(li);
    }
};

const getTopElements = async () => {
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/top");

        albums = await response.json();
        offset = 16;

        renderTopAlbums();
    } catch (error) {
        console.error("Error al obtener álbumes:", error);
    }
};

const getMoreTopElements = async () => {
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiAlbums/top-more/${offset}`
        );

        const nuevosAlbums = await response.json();

        if (nuevosAlbums.length === 0) {
            alert("No hay más álbumes.");
            return;
        }

        albums.push(...nuevosAlbums);
        offset += 16;

        renderTopAlbums();
    } catch (error) {
        console.error("Error al obtener más álbumes:", error);
    }
};

/* ---------------- RANDOM ---------------- */

const getRandomAlbums = async () => {
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/random");
        const albums = await response.json();

        randomList.innerHTML = "";

        for (const album of albums) {
            const li = document.createElement("li");
            li.innerHTML = `
                <h3>${album.title}</h3>
                <img src="${album.image}" alt="${album.title}">
                <a href="${album.url}" target="_blank">Ver álbum</a>
                <button class="btn btn-danger" onclick="deleteAlbum(${album.id})">Eliminar</button>
            `;
            randomList.appendChild(li);
        }
    } catch (error) {
        console.error("Error al obtener álbumes aleatorios:", error);
    }
};

/* ---------------- SEARCH ---------------- */

const buscarAlbums = async (texto) => {
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiAlbums/album-input/${texto}`
        );

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
                <button class="btn btn-danger" onclick="deleteAlbum(${album.id})">Eliminar</button>
            `;
            listado.appendChild(li);
        }
    } catch (error) {
        console.error("Error al buscar álbum:", error);
    }
};

const buscarElementosCards = async (txt) => {
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiElement/card-title/${txt}`
        );

        const elementCard = await response.json();

        listaElementsCard.innerHTML = "";

        if (!elementCard) return;

        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${elementCard.title}</h3>
            <img src="${elementCard.image}" alt="${elementCard.title}">
            <a href="${elementCard.url}" target="_blank">Ver elemento</a>
        `;

        listaElementsCard.appendChild(li);

    } catch (error) {
        console.error("Error al buscar Elemento en card:", error);
    }
};

/* ---------------- DELETE ---------------- */

const deleteAlbum = async (id) => {
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiAlbums/delete/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Error al eliminar álbum");
        }

        if (input.value.trim() !== "") {
            await buscarAlbums(input.value.trim());
        }

        if (albums.length > 0) {
            albums = albums.filter(album => album.id !== id);
            renderTopAlbums();
        }

    } catch (error) {
        console.error("Error al eliminar álbum:", error);
    }
};

/* ---------------- EVENTS ---------------- */

btn.addEventListener("click", () => {
    buscarAlbums(input.value.trim());
});

input.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        buscarAlbums(input.value.trim());
    }
});

btnElementsCard.addEventListener("click", () => {
    buscarElementosCards(elementInput.value.trim());
});

elementInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        buscarElementosCards(elementInput.value.trim());
    }
});

randomBtn.addEventListener("click", getRandomAlbums);
topElementsBtn.addEventListener("click", getTopElements);
moreElementsBtn.addEventListener("click", getMoreTopElements);
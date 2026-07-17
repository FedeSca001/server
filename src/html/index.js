const listado = document.getElementById("resultList");
const input = document.getElementById("urlInput");
const btn = document.getElementById("buscarSql");
const randomBtn = document.getElementById("getRandomAlbums");
const randomList = document.getElementById("randomList");
const topElementsBtn = document.getElementById("getTopElements");
const topElementsList = document.getElementById("topElementsList");
const moreElementsBtn = document.getElementById("moreElements");

let offset = 16;
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

async function buscarAlbums(texto) {
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
}

/* ---------------- DELETE ---------------- */

const deleteAlbum = async (id) => {
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiAlbums/delete/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!response.ok) {
            throw new Error("Error al eliminar álbum");
        }

        await buscarAlbums(input.value.trim());
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

randomBtn.addEventListener("click", () => {
    getRandomAlbums();
});

topElementsBtn.addEventListener("click", () => {
    getTopElements();
});

moreElementsBtn.addEventListener("click", () => {
    getMoreTopElements();
});

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

async function buscarAlbums(texto) {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/album-input/${texto}`);

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
}

const deleteAlbum = async (id) => {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/delete/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Error al eliminar álbum");
        }

        await buscarAlbums(input.value.trim());
    } catch (error) {
        console.error("Error al eliminar álbum:", error);
    }
};

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

moreElementsBtn.addEventListener("click", () => {
    getMoreTopElements();
});
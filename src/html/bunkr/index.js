const listado = document.getElementById("resultList");
const btn = document.getElementById("buscarSql");
const listaElementsCard = document.getElementById("elementsList");
const btnElementsCard = document.getElementById("buscarElemento");
const input = document.getElementById("urlInput");
const elementInput = document.getElementById("elementInput");
const filterSelect = document.getElementById("filterSelect");
const sortType = document.getElementById("sortType");
const randomBtn = document.getElementById("getRandomAlbums");
const randomList = document.getElementById("randomList");
const topElementsBtn = document.getElementById("getTopElements");
const topElementsList = document.getElementById("topElementsList");
const moreElementsBtn = document.getElementById("moreElements");
const countCards = document.getElementById("countCards");
const countAlbums = document.getElementById("countAlbums");
const aside = document.getElementById("aside");
const toggleAside = document.getElementById("toggleAside");
const favoritosAlbumsList = document.getElementById("favoritos-list-albums");
const favoritosCardsList = document.getElementById("favoritos-list-cards");

const spinnerCarga = `<div class="spinner"></div>`;

// ======================
// ESTADO SEPARADO
// ======================
let favoritos = [];
let cards = [];
let originalCards = [];
let topAlbums = [];
let searchAlbums = [];
let randomAlbums = [];
let offset = 0;

// ======================
// UTILIDADES
// ======================
const actualizarContador = (elemento, cantidad, texto) => {
    elemento.textContent = `${texto}: ${cantidad}`;
};

const mostrarError = (contenedor, mensaje = "Error al cargar datos") => {
    contenedor.innerHTML = `<li class="error">${mensaje}</li>`;
};

const esFavorito = (tipo, id) => {
    return favoritos.some(f => f.tipo === tipo && f.referencia_id === id);
};

const botonFavorito = (tipo, id) => {
    return esFavorito(tipo, id)
        ? `<button class="btn-fav" data-tipo="${tipo}" data-id="${id}" data-action="delete">⭐</button>`
        : `<button class="btn-fav" data-tipo="${tipo}" data-id="${id}" data-action="add">☆</button>`;
};

// ======================
// RENDER
// ======================
const crearCardAlbum = album => `
    <h3>${album.title}</h3>
    <img src="${album.image}" alt="${album.title}">
    <a href="${album.url}" target="_blank">Ver álbum</a>
    
    <div class="card-actions">
        ${botonFavorito("album", album.id)}
        <button class="btn-delete-album" data-id="${album.id}">✕</button>
    </div>
`;

const renderAlbums = (lista, contenedor) => {
    contenedor.innerHTML = "";
    if (!lista.length) {
        contenedor.innerHTML = `<li class="empty">No hay resultados</li>`;
        return;
    }
    lista.forEach(album => {
        const li = document.createElement("li");
        li.innerHTML = crearCardAlbum(album);
        contenedor.appendChild(li);
    });
};

const renderCards = lista => {
    listaElementsCard.innerHTML = "";
    if (!lista.length) {
        listaElementsCard.innerHTML = `<li class="empty">No hay resultados</li>`;
        actualizarContador(countCards, 0, "Elementos");
        return;
    }
    lista.forEach(card => {
        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${card.title}</h3>
            <img src="${card.image}" alt="${card.title}">
            <p>Tipo: ${card.type} | Tamaño: ${card.size} | Fecha: ${card.date}</p>
            <a href="${card.url}" target="_blank">Ver elemento</a>
            
            <div class="card-actions">
                ${botonFavorito("card", card.id)}
            </div>
        `;
        listaElementsCard.appendChild(li);
    });
    actualizarContador(countCards, lista.length, "Elementos");
};

const renderFavoritos = () => {
    favoritosAlbumsList.innerHTML = "";
    favoritosCardsList.innerHTML = "";

    favoritos.forEach(favorito => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${favorito.url}" target="_blank">${favorito.title}</a>
            <button class="btn-delete-fav" data-id="${favorito.id}">✕</button>
        `;
        if (favorito.tipo === "album") {
            favoritosAlbumsList.appendChild(li);
        } else {
            favoritosCardsList.appendChild(li);
        }
    });
};

// ======================
// API - ÁLBUMES
// ======================
const getTopElements = async () => {
    topElementsList.innerHTML = spinnerCarga;
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/top");
        if (!response.ok) throw new Error("Error en la petición");
        topAlbums = await response.json();
        offset = 16;
        renderAlbums(topAlbums, topElementsList);
        actualizarContador(countAlbums, topAlbums.length, "Álbumes");
    } catch (error) {
        console.error(error);
        mostrarError(topElementsList);
    }
};

const getMoreTopElements = async () => {
    topElementsList.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/top-more/${offset}`);
        if (!response.ok) throw new Error("Error en la petición");
        const nuevosAlbums = await response.json();

        if (!nuevosAlbums.length) {
            renderAlbums(topAlbums, topElementsList);
            alert("No hay más álbumes.");
            return;
        }

        topAlbums.push(...nuevosAlbums);
        offset += 16;
        renderAlbums(topAlbums, topElementsList);
        actualizarContador(countAlbums, topAlbums.length, "Álbumes");
    } catch (error) {
        console.error(error);
        mostrarError(topElementsList);
    }
};

const getRandomAlbums = async () => {
    randomList.innerHTML = spinnerCarga;
    try {
        const response = await fetch("http://192.168.1.148:3000/apiAlbums/random");
        if (!response.ok) throw new Error("Error en la petición");
        randomAlbums = await response.json();
        renderAlbums(randomAlbums, randomList);
    } catch (error) {
        console.error(error);
        mostrarError(randomList);
    }
};

const buscarAlbums = async texto => {
    if (!texto) return;
    listado.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/album-input/${encodeURIComponent(texto)}`);
        if (!response.ok) throw new Error("Error en la petición");
        searchAlbums = await response.json();
        renderAlbums(searchAlbums, listado);
        actualizarContador(countAlbums, searchAlbums.length, "Álbumes");
    } catch (error) {
        console.error(error);
        mostrarError(listado);
        actualizarContador(countAlbums, 0, "Álbumes");
    }
};

// ======================
// API - ELEMENTOS (CARDS)
// ======================
const buscarElementosCards = async texto => {
    listaElementsCard.innerHTML = spinnerCarga;
    try {
        const response = await fetch(
            `http://192.168.1.148:3000/apiElement/card-title/${encodeURIComponent(texto)}?filter=${encodeURIComponent(filterSelect.value)}`
        );
        if (!response.ok) throw new Error("Error en la petición");
        const datos = await response.json();
        cards = Array.isArray(datos) ? [...datos] : [datos];
        originalCards = [...cards];
        renderCards(cards);
    } catch (error) {
        console.error(error);
        mostrarError(listaElementsCard);
        actualizarContador(countCards, 0, "Elementos");
    }
};

const sortCards = () => {
    switch (sortType.value) {
        case "all":
            cards = [...originalCards];
            break;
        case "size":
            cards.sort((a, b) => Number(b.size) - Number(a.size));
            break;
        case "nombre":
            cards.sort((a, b) => a.title.localeCompare(b.title));
            break;
        case "Video":
            cards.sort((a, b) => {
                if (a.type === "Video" && b.type !== "Video") return -1;
                if (a.type !== "Video" && b.type === "Video") return 1;
                return a.title.localeCompare(b.title);
            });
            break;
        case "img":
            cards.sort((a, b) => {
                if (a.type === "Image" && b.type !== "Image") return -1;
                if (a.type !== "Image" && b.type === "Image") return 1;
                return a.title.localeCompare(b.title);
            });
            break;
    }
    renderCards(cards);
};

// ======================
// ELIMINAR ÁLBUM
// ======================
const deleteAlbum = async id => {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiAlbums/delete/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Error al eliminar");

        topAlbums = topAlbums.filter(a => a.id !== id);
        searchAlbums = searchAlbums.filter(a => a.id !== id);
        randomAlbums = randomAlbums.filter(a => a.id !== id);

        if (topAlbums.length) renderAlbums(topAlbums, topElementsList);
        if (searchAlbums.length) renderAlbums(searchAlbums, listado);
        if (randomAlbums.length) renderAlbums(randomAlbums, randomList);

        if (input.value.trim()) {
            await buscarAlbums(input.value.trim());
        }
    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar el álbum");
    }
};

// ======================
// FAVORITOS
// ======================
const getFavoritos = async () => {
    try {
        const response = await fetch("http://192.168.1.148:3000/apiFavoritos");
        if (!response.ok) throw new Error("Error obteniendo favoritos");
        favoritos = await response.json();
        renderFavoritos();
        actualizarVistaFavoritos();
    } catch (error) {
        console.error(error);
    }
};

const addFavorito = async (tipo, referencia_id) => {
    try {
        if (esFavorito(tipo, referencia_id)) return;

        const response = await fetch("http://192.168.1.148:3000/apiFavoritos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tipo, referencia_id })
        });
        if (!response.ok) throw new Error("Error al añadir favorito");

        await getFavoritos();
    } catch (error) {
        console.error(error);
        alert("No se pudo añadir a favoritos");
    }
};

const deleteFavorito = async id => {
    try {
        const response = await fetch(`http://192.168.1.148:3000/apiFavoritos/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) throw new Error("Error al eliminar favorito");
        await getFavoritos();
    } catch (error) {
        console.error(error);
        alert("No se pudo eliminar el favorito");
    }
};

const deleteFavoritoByReferencia = async (tipo, referencia_id) => {
    const favorito = favoritos.find(f => f.tipo === tipo && f.referencia_id === referencia_id);
    if (!favorito) return;
    await deleteFavorito(favorito.id);
};

const actualizarVistaFavoritos = () => {
    if (topAlbums.length) renderAlbums(topAlbums, topElementsList);
    if (searchAlbums.length) renderAlbums(searchAlbums, listado);
    if (randomAlbums.length) renderAlbums(randomAlbums, randomList);
    if (cards.length) renderCards(cards);
};

// ======================
// EVENT DELEGATION
// ======================
document.addEventListener("click", e => {
    if (e.target.classList.contains("btn-fav")) {
        const tipo = e.target.dataset.tipo;
        const id = Number(e.target.dataset.id);
        const action = e.target.dataset.action;

        if (action === "add") {
            addFavorito(tipo, id);
        } else {
            deleteFavoritoByReferencia(tipo, id);
        }
    }

    if (e.target.classList.contains("btn-delete-album")) {
        const id = Number(e.target.dataset.id);
        if (confirm("¿Eliminar este álbum?")) {
            deleteAlbum(id);
        }
    }

    if (e.target.classList.contains("btn-delete-fav")) {
        const id = Number(e.target.dataset.id);
        deleteFavorito(id);
    }
});

// ======================
// EVENTOS
// ======================
btn.addEventListener("click", () => {
    buscarAlbums(input.value.trim());
});

input.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        buscarAlbums(input.value.trim());
    }
});

btnElementsCard.addEventListener("click", () => {
    buscarElementosCards(elementInput.value.trim());
});

elementInput.addEventListener("keypress", e => {
    if (e.key === "Enter") {
        buscarElementosCards(elementInput.value.trim());
    }
});

toggleAside.addEventListener("click", e => {
    e.stopPropagation();
    aside.classList.toggle("open");
});

aside.addEventListener("click", e => {
    e.stopPropagation();
});

document.addEventListener("click", () => {
    aside.classList.remove("open");
});

document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        aside.classList.remove("open");
    }
});

sortType.addEventListener("change", sortCards);
randomBtn.addEventListener("click", getRandomAlbums);
topElementsBtn.addEventListener("click", getTopElements);
moreElementsBtn.addEventListener("click", getMoreTopElements);

window.addEventListener("DOMContentLoaded", getFavoritos);
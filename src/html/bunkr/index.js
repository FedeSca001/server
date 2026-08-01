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
const API_ALBUMS = "http://192.168.1.148:3000/apiAlbums";
const API_ELEMENTS = "http://192.168.1.148:3000/apiElement";
const API_FAVORITOS = "http://192.168.1.148:3000/apiFavoritos";
const spinnerCarga = `<div class="spinner"></div>`;
let favoritos = [];
let cards = [];
let originalCards = [];
let topAlbums = [];
let searchAlbums = [];
let randomAlbums = [];
let offset = 0;
const actualizarContador = (elemento, cantidad, texto) => {
    if (elemento) {
        elemento.textContent = `${texto}: ${cantidad}`;
    }
};
const mostrarError = (contenedor, mensaje = "Error al cargar datos") => {
    contenedor.innerHTML = `<li class="error">${mensaje}</li>`;
};
const esFavorito = (tipo, id) => {
    return favoritos.some(f => f.tipo === tipo && Number(f.referencia_id) === Number(id));
};
const botonFavorito = (tipo, id) => {
    if (esFavorito(tipo, id)) {
        return `<button type="button" class="btn-fav" data-tipo="${tipo}" data-id="${id}" data-action="delete">⭐</button>`;
    }
    return `<button type="button" class="btn-fav" data-tipo="${tipo}" data-id="${id}" data-action="add">☆</button>`;
};
const crearCardAlbum = album => `
    <h3>${album.title ?? "Sin título"}</h3>
    <img src="${album.image ?? ""}" alt="${album.title ?? "Álbum"}">
    <a href="${album.url ?? "#"}" target="_blank" rel="noopener noreferrer">Ver álbum</a>
    <div class="card-actions">
        ${botonFavorito("album", album.id)}
        <button type="button" class="btn-delete-album" data-id="${album.id}">✕</button>
    </div>
`;
const renderAlbums = (lista, contenedor) => {
    contenedor.innerHTML = "";
    if (!Array.isArray(lista) || !lista.length) {
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
    if (!Array.isArray(lista) || !lista.length) {
        listaElementsCard.innerHTML = `<li class="empty">No hay resultados</li>`;
        actualizarContador(countCards, 0, "Elementos");
        return;
    }
    lista.forEach(card => {
        const li = document.createElement("li");
        li.innerHTML = `
            <h3>${card.title ?? "Sin título"}</h3>
            <img src="${card.image ?? ""}" alt="${card.title ?? "Elemento"}">
            <p>Tipo: ${card.type ?? "-"} | Tamaño: ${card.size ?? "-"} | Fecha: ${card.date ?? "-"}</p>
            <a href="${card.url ?? "#"}" target="_blank" rel="noopener noreferrer">Ver elemento</a>
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
    const favoritosAlbums = favoritos.filter(f => f.tipo === "album");
    const favoritosCards = favoritos.filter(f => f.tipo === "card");
    if (!favoritosAlbums.length) {
        favoritosAlbumsList.innerHTML = `<li class="empty">No hay álbumes favoritos</li>`;
    }
    if (!favoritosCards.length) {
        favoritosCardsList.innerHTML = `<li class="empty">No hay elementos favoritos</li>`;
    }
    favoritosAlbums.forEach(favorito => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${favorito.url ?? "#"}" target="_blank" rel="noopener noreferrer">${favorito.title ?? "Sin título"}</a>
            <button type="button" class="btn-delete-fav" data-id="${favorito.id}">✕</button>
        `;
        favoritosAlbumsList.appendChild(li);
    });
    favoritosCards.forEach(favorito => {
        const li = document.createElement("li");
        li.innerHTML = `
            <a href="${favorito.url ?? "#"}" target="_blank" rel="noopener noreferrer">${favorito.title ?? "Sin título"}</a>
            <button type="button" class="btn-delete-fav" data-id="${favorito.id}">✕</button>
        `;
        favoritosCardsList.appendChild(li);
    });
};
const getTopElements = async () => {
    topElementsList.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`${API_ALBUMS}/top`);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        topAlbums = await response.json();
        offset = 16;
        renderAlbums(topAlbums, topElementsList);
        actualizarContador(countAlbums, topAlbums.length, "Álbumes");
    } catch (error) {
        console.error("Error obteniendo top de álbumes:", error);
        mostrarError(topElementsList);
    }
};
const getMoreTopElements = async () => {
    topElementsList.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`${API_ALBUMS}/top-more/${offset}`);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        const nuevosAlbums = await response.json();
        if (!Array.isArray(nuevosAlbums) || !nuevosAlbums.length) {
            renderAlbums(topAlbums, topElementsList);
            alert("No hay más álbumes.");
            return;
        }
        topAlbums.push(...nuevosAlbums);
        offset += 16;
        renderAlbums(topAlbums, topElementsList);
        actualizarContador(countAlbums, topAlbums.length, "Álbumes");
    } catch (error) {
        console.error("Error obteniendo más álbumes:", error);
        mostrarError(topElementsList);
    }
};
const getRandomAlbums = async () => {
    randomList.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`${API_ALBUMS}/random`);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        randomAlbums = await response.json();
        renderAlbums(randomAlbums, randomList);
    } catch (error) {
        console.error("Error obteniendo álbumes aleatorios:", error);
        mostrarError(randomList);
    }
};
const buscarAlbums = async texto => {
    if (!texto) {
        listado.innerHTML = `<li class="empty">Escribe un álbum para buscar</li>`;
        actualizarContador(countAlbums, 0, "Álbumes");
        return;
    }
    listado.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`${API_ALBUMS}/album-input/${encodeURIComponent(texto)}`);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        searchAlbums = await response.json();
        renderAlbums(searchAlbums, listado);
        actualizarContador(countAlbums, searchAlbums.length, "Álbumes");
    } catch (error) {
        console.error("Error buscando álbumes:", error);
        mostrarError(listado);
        actualizarContador(countAlbums, 0, "Álbumes");
    }
};
const buscarElementosCards = async texto => {
    if (!texto) {
        listaElementsCard.innerHTML = `<li class="empty">Escribe un elemento para buscar</li>`;
        actualizarContador(countCards, 0, "Elementos");
        return;
    }
    listaElementsCard.innerHTML = spinnerCarga;
    try {
        const response = await fetch(`${API_ELEMENTS}/card-title/${encodeURIComponent(texto)}?filter=${encodeURIComponent(filterSelect.value)}`);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        const datos = await response.json();
        cards = Array.isArray(datos) ? [...datos] : [datos];
        originalCards = [...cards];
        renderCards(cards);
    } catch (error) {
        console.error("Error buscando elementos:", error);
        mostrarError(listaElementsCard);
        actualizarContador(countCards, 0, "Elementos");
    }
};
const sortCards = () => {
    cards = [...originalCards];
    switch (sortType.value) {
        case "size":
            cards.sort((a, b) => Number(b.size || 0) - Number(a.size || 0));
            break;
        case "nombre":
            cards.sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "es"));
            break;
        case "Video":
            cards.sort((a, b) => {
                if (a.type === "Video" && b.type !== "Video") return -1;
                if (a.type !== "Video" && b.type === "Video") return 1;
                return String(a.title || "").localeCompare(String(b.title || ""), "es");
            });
            break;
        case "img":
            cards.sort((a, b) => {
                if (a.type === "Image" && b.type !== "Image") return -1;
                if (a.type !== "Image" && b.type === "Image") return 1;
                return String(a.title || "").localeCompare(String(b.title || ""), "es");
            });
            break;
        case "all":
        default:
            break;
    }
    renderCards(cards);
};
const deleteAlbum = async id => {
    try {
        const response = await fetch(`${API_ALBUMS}/delete/${id}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        topAlbums = topAlbums.filter(a => Number(a.id) !== Number(id));
        searchAlbums = searchAlbums.filter(a => Number(a.id) !== Number(id));
        randomAlbums = randomAlbums.filter(a => Number(a.id) !== Number(id));
        renderAlbums(topAlbums, topElementsList);
        renderAlbums(searchAlbums, listado);
        renderAlbums(randomAlbums, randomList);
        if (input.value.trim()) {
            await buscarAlbums(input.value.trim());
        }
    } catch (error) {
        console.error("Error eliminando álbum:", error);
        alert("No se pudo eliminar el álbum");
    }
};
const getFavoritos = async () => {
    try {
        const response = await fetch(API_FAVORITOS);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        const datos = await response.json();
        favoritos = Array.isArray(datos) ? datos : [];
        renderFavoritos();
        actualizarVistaFavoritos();
    } catch (error) {
        console.error("Error obteniendo favoritos:", error);
    }
};
const addFavorito = async (tipo, referencia_id) => {
    try {
        if (esFavorito(tipo, referencia_id)) {
            return;
        }
        const response = await fetch(API_FAVORITOS, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tipo,
                referencia_id
            })
        });
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}`);
        }
        await getFavoritos();
    } catch (error) {
        console.error("Error añadiendo favorito:", error);
        alert("No se pudo añadir a favoritos");
    }
};
const deleteFavorito = async id => {
    try {
        const favoritoId = Number(id);
        if (!Number.isInteger(favoritoId) || favoritoId <= 0) {
            console.error("ID de favorito inválido:", id);
            return;
        }
        const response = await fetch(`${API_FAVORITOS}/${favoritoId}`, {
            method: "DELETE"
        });
        const respuesta = await response.text();
        console.log("DELETE favorito:", favoritoId, "HTTP:", response.status, "Respuesta:", respuesta);
        if (!response.ok) {
            throw new Error(`Error HTTP ${response.status}: ${respuesta}`);
        }
        await getFavoritos();
    } catch (error) {
        console.error("Error eliminando favorito:", error);
        alert("No se pudo eliminar el favorito");
    }
};
const deleteFavoritoByReferencia = async (tipo, referencia_id) => {
    const favorito = favoritos.find(f => f.tipo === tipo && Number(f.referencia_id) === Number(referencia_id));
    if (!favorito) {
        console.warn("No se encontró el favorito:", tipo, referencia_id);
        return;
    }
    await deleteFavorito(favorito.id);
};
const actualizarVistaFavoritos = () => {
    if (topAlbums.length) {
        renderAlbums(topAlbums, topElementsList);
    }
    if (searchAlbums.length) {
        renderAlbums(searchAlbums, listado);
    }
    if (randomAlbums.length) {
        renderAlbums(randomAlbums, randomList);
    }
    if (cards.length) {
        renderCards(cards);
    }
};
document.addEventListener("click", e => {
    const btnFavorito = e.target.closest(".btn-fav");
    if (btnFavorito) {
        const tipo = btnFavorito.dataset.tipo;
        const id = Number(btnFavorito.dataset.id);
        const action = btnFavorito.dataset.action;
        if (action === "add") {
            addFavorito(tipo, id);
        } else if (action === "delete") {
            deleteFavoritoByReferencia(tipo, id);
        }
        return;
    }
    const btnDeleteAlbum = e.target.closest(".btn-delete-album");
    if (btnDeleteAlbum) {
        const id = Number(btnDeleteAlbum.dataset.id);
        if (confirm("¿Eliminar este álbum?")) {
            deleteAlbum(id);
        }
        return;
    }
    const btnDeleteFav = e.target.closest(".btn-delete-fav");
    if (btnDeleteFav) {
        const id = Number(btnDeleteFav.dataset.id);
        console.log("Eliminando favorito con ID:", id);
        deleteFavorito(id);
        return;
    }
});
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
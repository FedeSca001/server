const calendarioList = document.getElementById("calendarioList");
const ClasificaciontList = document.getElementById("ClasificaciontList");

const spinnerCarga = `<div class="spinner"></div>`;

// Función para cargar la clasificación
const renderClasificacion = async () => {
    ClasificaciontList.innerHTML = spinnerCarga;
    try {
        //const response = await fetch("http://localhost:3000/apiMotoGp/clasificacion");
        const response = await fetch("http://192.168.1.148:3000/apiMotoGp/clasificacion");

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const clasificacion = await response.json();
        ClasificaciontList.innerHTML = "";
        const puntosLider = clasificacion[0].puntos;

        for (const piloto of clasificacion) {
            const diferencia = puntosLider - piloto.puntos;
            const li = document.createElement("li");
            li.innerHTML = `
                <p class="pilotoPosition">${piloto.posicion}</p>
                <p class="pilotoNombre">${piloto.piloto}</p>
                <p class="pilotoPuntos">${piloto.puntos} pts</p>
                <p class="pilotoDistancia">${diferencia === 0 ? "-" : "-" + diferencia}</p>
            `;
            ClasificaciontList.appendChild(li);
        }

    } catch (error) {
        console.error(error);
        ClasificaciontList.innerHTML = `<h2>${error.message}</h2>`;
    }
};

// Ejecutar al cargar la página
renderClasificacion();
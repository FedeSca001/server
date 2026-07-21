const calendarioList = document.getElementById("calendarioList");
const ClasificaciontList = document.getElementById("ClasificaciontList");

const spinnerCarga = `<div class="spinner"></div>`;

// Función para cargar la clasificación
const renderCalendario = async () => {
    // Mostrar spinner mientras carga
    ClasificaciontList.innerHTML = spinnerCarga;

    try {
        //const response = await fetch("http://192.168.1.148:3000/apiMotoGp/clasificacion");
        const response = await fetch("http://localhost:3000/apiMotoGp/clasificacion");
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }

        const clasificacion = await response.json();
        // Limpiar el spinner
        ClasificaciontList.innerHTML = "";

        // Pintar la clasificación
        for (const piloto of clasificacion) {
            const li = document.createElement("li");

            li.innerHTML = `
                <p class="pilotoPosition">${piloto.posicion}</p>
                <p class="pilotoNombre">${piloto.piloto}</p>
                <p class="pilotoPuntos">${piloto.puntos} puntos</p>
            `;

            ClasificaciontList.appendChild(li);
        }
    } catch (error) {
        console.error(error);
        ClasificaciontList.innerHTML = `<h2>${error.message}</h2>`;
    }
};

// Ejecutar al cargar la página
renderCalendario();
const calendarioList = document.getElementById("calendarioList");
const ClasificaciontList = document.getElementById("ClasificaciontList");

const spinnerCarga = `<div class="spinner"></div>`;

// ===============================
// CLASIFICACIÓN
// ===============================
const renderClasificacion = async () => {
    ClasificaciontList.innerHTML = spinnerCarga;
    try {
        // const response = await fetch("http://localhost:3000/apiMotoGp/clasificacion");
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
                <p class="pilotoDistancia">
                    ${diferencia === 0 ? "" : "-" + diferencia}
                </p>
            `;
            ClasificaciontList.appendChild(li);
        }
    } catch (error) {
        console.error(error);
        ClasificaciontList.innerHTML = `<h2>${error.message}</h2>`;
    }
};

// ===============================
// CALENDARIO
// ===============================
const renderCalendar = async () => {
    calendarioList.innerHTML = spinnerCarga;

    try {
        //const response = await fetch("http://localhost:3000/apimotogp/calendario");
        const response = await fetch("http://192.168.1.148:3000/apiMotoGp/calendario");

        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        const resultado = await response.json();
        calendarioList.innerHTML = "";

        for (const gp of resultado.data) {
            const li = document.createElement("li");
            li.innerHTML = `
                <div class="gpCard">
                    <h2>${gp.granPremio}</h2>
                    <img src="${gp.imgCircuito}" alt="${gp.circuito}">
                    <p><strong>Fecha:</strong> ${gp.fecha}</p>
                    <p><strong>Circuito:</strong> ${gp.circuito}</p>
                    <h3>Podio</h3>
                    <ul>
                        ${gp.podium.map(piloto => `
                            <li>
                                <strong>${piloto.position}</strong> -
                                ${piloto.piloto}
                                <img src="${piloto.bandera}" alt="" width="20">
                            </li>
                        `).join("")}
                    </ul>
                    <h3>MotoGP</h3>
                    <ul>
                        ${gp.competiciones.motoGp.map(carrera => `
                            <li>
                                ${carrera.dia} -
                                ${carrera.descripcion}
                                (${carrera.hora})
                            </li>
                        `).join("")}
                    </ul>
                </div>
            `;
            calendarioList.appendChild(li);
        }

    } catch (error) {
        console.error(error);
        calendarioList.innerHTML = `<h2>${error.message}</h2>`;
    }
};

// ===============================
// INICIAR
// ===============================
renderClasificacion();
renderCalendar();
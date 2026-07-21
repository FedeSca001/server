const calendarioList=document.getElementById("calendarioList");
const ClasificaciontList=document.getElementById("ClasificaciontList");
const spinnerCarga=`<div class="spinner"></div>`;
const gpModal=document.getElementById("gpModal");
const modalBody=document.getElementById("modalBody");
const cerrarModal=document.getElementById("cerrarModal");

const cerrar=()=>{
    document.body.style.overflow="";
    gpModal.classList.add("hidden");
};

cerrarModal.onclick=cerrar;

gpModal.onclick=e=>{
    if(e.target===gpModal)cerrar();
};

document.addEventListener("keydown",e=>{
    if(e.key==="Escape")cerrar();
});

const crearCategoria=(titulo,carreras)=>`
<h3>${titulo}</h3>
<div class="horario">
${carreras.map(c=>`
<div class="fila">
<span class="dia">${c.dia}</span>
<a class="descripcion" href="${c.link}" target="_blank">${c.descripcion}</a>
<span class="hora">${c.hora}</span>
</div>`).join("")}
</div>`;

const abrirModal=gp=>{
    document.body.style.overflow="hidden";
    modalBody.innerHTML=`
    <img src="${gp.imgCircuito}" alt="${gp.circuito}">
    <h2>${gp.granPremio}</h2>
    <p><strong>📅 Fecha:</strong> ${gp.fecha}</p>
    <p><strong>📍 Circuito:</strong> ${gp.circuito}</p>
    <h3>Podio</h3>
    <ul class="podio">
    ${gp.podium.map(p=>`
    <li>
    <strong>${p.position}</strong>
    <span>${p.piloto}</span>
    <img src="${p.bandera}" alt="${p.piloto}">
    </li>`).join("")}
    </ul>
    ${crearCategoria("MotoGP",gp.competiciones.motoGp)}
    ${crearCategoria("Moto2",gp.competiciones.moto2)}
    ${crearCategoria("Moto3",gp.competiciones.moto3)}
    `;
    gpModal.classList.remove("hidden");
};

const renderClasificacion=async()=>{
    ClasificaciontList.innerHTML=spinnerCarga;
    try{
        // const response=await fetch("http://localhost:3000/apiMotoGp/clasificacion");
        const response=await fetch("http://192.168.1.148:3000/apiMotoGp/clasificacion");
        if(!response.ok)throw new Error(`Error ${response.status}: ${response.statusText}`);
        const clasificacion=await response.json();
        ClasificaciontList.innerHTML="";
        const puntosLider=clasificacion[0].puntos;
        for(const piloto of clasificacion){
            const diferencia=puntosLider-piloto.puntos;
            const li=document.createElement("li");
            li.innerHTML=`
            <p class="pilotoPosition">${piloto.posicion}</p>
            <p class="pilotoNombre">${piloto.piloto}</p>
            <p class="pilotoPuntos">${piloto.puntos} pts</p>
            <p class="pilotoDistancia">${diferencia===0?"":"-"+diferencia}</p>`;
            ClasificaciontList.appendChild(li);
        }
    }catch(error){
        console.error(error);
        ClasificaciontList.innerHTML=`<h2>${error.message}</h2>`;
    }
};
const renderCalendar=async()=>{
    calendarioList.innerHTML=spinnerCarga;
    try{
        // const response=await fetch("http://localhost:3000/apiMotoGp/calendario");
        const response=await fetch("http://192.168.1.148:3000/apiMotoGp/calendario");
        if(!response.ok)throw new Error(`Error ${response.status}: ${response.statusText}`);
        const {data}=await response.json();
        calendarioList.innerHTML="";
        data.forEach(gp=>{
            const li=document.createElement("li");
            li.innerHTML=`
            <div class="gpCard">
                <img src="${gp.imgCircuito}" alt="${gp.circuito}">
                <h2>${gp.granPremio}</h2>
                <p><strong>📅</strong> ${gp.fecha}</p>
                <p><strong>📍</strong> ${gp.circuito}</p>
                <h3>Podio</h3>
                <ul class="podio">
                    ${gp.podium.map(piloto=>`
                    <li>
                        <strong>${piloto.position}</strong>
                        <span>${piloto.piloto}</span>
                        <img src="${piloto.bandera}" alt="${piloto.piloto}">
                    </li>`).join("")}
                </ul>
                <h3>MotoGP</h3>
                <div class="horario">
                    ${gp.competiciones.motoGp.map(carrera=>`
                    <div class="fila">
                        <span class="dia">${carrera.dia}</span>
                        <span class="descripcion">${carrera.descripcion}</span>
                        <span class="hora">${carrera.hora}</span>
                    </div>`).join("")}
                </div>
            </div>`;
            li.addEventListener("click",()=>abrirModal(gp));
            calendarioList.appendChild(li);
        });
    }catch(error){
        console.error(error);
        calendarioList.innerHTML=`<h2>${error.message}</h2>`;
    }
};

renderClasificacion();
renderCalendar();
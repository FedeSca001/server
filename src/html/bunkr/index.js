const listado=document.getElementById("resultList");
const btn=document.getElementById("buscarSql");
const listaElementsCard=document.getElementById("elementsList");
const btnElementsCard=document.getElementById("buscarElemento");
const input=document.getElementById("urlInput");
const elementInput=document.getElementById("elementInput");
const filterSelect=document.getElementById("filterSelect");
const sortType=document.getElementById("sortType");
const randomBtn=document.getElementById("getRandomAlbums");
const randomList=document.getElementById("randomList");
const topElementsBtn=document.getElementById("getTopElements");
const topElementsList=document.getElementById("topElementsList");
const moreElementsBtn=document.getElementById("moreElements");
const countCards=document.getElementById("countCards");
const countAlbums=document.getElementById("countAlbums");

const spinnerCarga=`<div class="spinner"></div>`;

let cards=[];
let originalCards=[];
let albums=[];
let offset=0;

const actualizarContador=(elemento,cantidad,texto)=>{
    elemento.textContent=`${texto}: ${cantidad}`;
};

const crearCardAlbum=album=>`
<h3>${album.title}</h3>
<img src="${album.image}" alt="${album.title}">
<a href="${album.url}" target="_blank">Ver álbum</a>
<button onclick="deleteAlbum(${album.id})">✕</button>`;

const renderAlbums=(lista,contenedor)=>{
    contenedor.innerHTML="";
    lista.forEach(album=>{
        const li=document.createElement("li");
        li.innerHTML=crearCardAlbum(album);
        contenedor.appendChild(li);
    });
    actualizarContador(countAlbums,lista.length,"Álbumes");
};

const renderCards=lista=>{
    listaElementsCard.innerHTML="";
    lista.forEach(card=>{
        const li=document.createElement("li");
        li.innerHTML=`
<h3>${card.title}</h3>
<img src="${card.image}" alt="${card.title}">
<p>Tipo: ${card.type} | Tamaño: ${card.size} | Fecha: ${card.date}</p>
<a href="${card.url}" target="_blank">Ver elemento</a>`;
        listaElementsCard.appendChild(li);
    });
    actualizarContador(countCards,lista.length,"Elementos");
};

const getTopElements=async()=>{
    topElementsList.innerHTML=spinnerCarga;
    try{
        const response=await fetch("http://192.168.1.148:3000/apiAlbums/top");
        albums=await response.json();
        offset=16;
        renderAlbums(albums,topElementsList);
    }catch(error){
        console.error(error);
        topElementsList.innerHTML="";
    }
};

const getMoreTopElements=async()=>{
    topElementsList.innerHTML=spinnerCarga;
    try{
        const response=await fetch(`http://192.168.1.148:3000/apiAlbums/top-more/${offset}`);
        const nuevosAlbums=await response.json();
        if(!nuevosAlbums.length){
            renderAlbums(albums,topElementsList);
            return alert("No hay más álbumes.");
        }
        albums.push(...nuevosAlbums);
        offset+=16;
        renderAlbums(albums,topElementsList);
    }catch(error){
        console.error(error);
        topElementsList.innerHTML="";
    }
};

const getRandomAlbums=async()=>{
    randomList.innerHTML=spinnerCarga;
    try{
        const response=await fetch("http://192.168.1.148:3000/apiAlbums/random");
        const datos=await response.json();
        renderAlbums(datos,randomList);
    }catch(error){
        console.error(error);
        randomList.innerHTML="";
    }
};

const buscarAlbums=async texto=>{
    listado.innerHTML=spinnerCarga;
    try{
        const response=await fetch(`http://192.168.1.148:3000/apiAlbums/album-input/${encodeURIComponent(texto)}`);
        const datos=await response.json();
        renderAlbums(datos,listado);
    }catch(error){
        console.error(error);
        listado.innerHTML="";
        actualizarContador(countAlbums,0,"Álbumes");
    }
};
const buscarElementosCards=async texto=>{
    listaElementsCard.innerHTML=spinnerCarga;
    try{
        const response=await fetch(`http://192.168.1.148:3000/apiElement/card-title/${encodeURIComponent(texto)}?filter=${encodeURIComponent(filterSelect.value)}`);
        if(!response.ok)throw new Error("Error en la petición");
        const datos=await response.json();
        cards=Array.isArray(datos)?[...datos]:[datos];
        originalCards=[...cards];
        console.log(cards[0])
        renderCards(cards);
    }catch(error){
        console.error(error);
        listaElementsCard.innerHTML="";
        actualizarContador(countCards,0,"Elementos");
    }
};

const sortCards=()=>{
    switch(sortType.value){
        case"all":
            cards=[...originalCards];
            break;
        case"size":
            cards.sort((a,b)=>Number(b.size)-Number(a.size));
            break;
        case"nombre":
            cards.sort((a,b)=>a.title.localeCompare(b.title));
            break;
        case"Video":
            cards.sort((a,b)=>
                a.type==="Video"&&b.type!=="Video"?-1:
                a.type!=="Video"&&b.type==="Video"?1:
                a.title.localeCompare(b.title)
            );
            break;
        case"img":
            cards.sort((a,b)=>
                a.type==="Image"&&b.type!=="Image"?-1:
                a.type!=="Image"&&b.type==="Image"?1:
                a.title.localeCompare(b.title)
            );
            break;
    }
    renderCards(cards);
};

const deleteAlbum=async id=>{
    try{
        const response=await fetch(`http://192.168.1.148:3000/apiAlbums/delete/${id}`,{
            method:"DELETE"
        });
        if(!response.ok)throw new Error("Error al eliminar");
        if(input.value.trim()){
            await buscarAlbums(input.value.trim());
        }
        albums=albums.filter(album=>album.id!==id);
        renderAlbums(albums,topElementsList);
    }catch(error){
        console.error(error);
    }
};

btn.addEventListener("click",()=>{
    buscarAlbums(input.value.trim());
});

input.addEventListener("keypress",e=>{
    if(e.key==="Enter"){
        buscarAlbums(input.value.trim());
    }
});

btnElementsCard.addEventListener("click",()=>{
    buscarElementosCards(elementInput.value.trim());
});

elementInput.addEventListener("keypress",e=>{
    if(e.key==="Enter"){
        buscarElementosCards(elementInput.value.trim());
    }
});

sortType.addEventListener("change",sortCards);

randomBtn.addEventListener("click",getRandomAlbums);

topElementsBtn.addEventListener("click",getTopElements);

moreElementsBtn.addEventListener("click",getMoreTopElements);
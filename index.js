const express=require("express");
const readline=require("readline");
const scrapingRaceRouter=require("./src/show-results/scraping-race");
const {scrapingImagenes}=require("./src/scraping-img/ScrapingImg");
const {iterarScraping}=require("./src/scraping-img/ScrapingIter");
const {main}=require("./src/scraping-img/ScrapingBunkrAlbums");
const app=express();
const PORT=process.env.PORT||3000;
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
let server=null;

/* EXPRESS */
app.use(express.json());
app.get("/",(req,res)=>res.send("¡Hola mundo 🌍"));
app.use("/scrapingRace",scrapingRaceRouter);
app.use((req,res)=>res.status(404).json({error:"Ruta no encontrada"}));

/* SERVER */
const iniciarServidor=()=>{
    if(server)return mostrarMenu();
    server=app.listen(PORT,()=>{console.log("Servidor en puerto:",PORT);mostrarMenu();});
};

const detenerServidor=()=>{
    if(!server)return mostrarMenu();
    server.close(()=>{server=null;console.log("Servidor detenido");mostrarMenu();});
};

const cerrarAplicacion=()=>{
    rl.close();
    if(server)server.close(()=>process.exit(0));
    else process.exit(0);
};

/* MENU */
const opciones=()=>console.log(`
1.Scraping
2.Detener
3.Imagenes
4.Iterar
5.Bunkr
6.Salir
`);

function mostrarMenu(){
    opciones();
    rl.question("Opcion: ",async(op)=>{
        op=op.toLowerCase();
        try{
            switch(op){

                case"1":
                case"scraping":
                    return iniciarServidor();

                case"2":
                case"detener":
                    return detenerServidor();

                case"3":
                case"img":
                case"imagenes":
                    return rl.question("URL: ",async url=>{
                        try{await scrapingImagenes(url);}catch(e){console.error(e.message);}
                        mostrarMenu();
                    });

                case"4":
                case"iterar":
                    return rl.question("Introducir primera parte de la url, luego el numero de iteraciones y finalmente el sufijo: ",async i=>{
                        try{
                            const[b,t,s]=i.split(" ");
                            await iterarScraping(b,Number(t),s);
                        }catch(e){console.error(e.message);}
                        mostrarMenu();
                    });

                case"5":
                case"bunkr":
                    return rl.question("Introducir rango de inicio y fin separados por un espacio: ",async r=>{
                        try{
                            const[a,b]=r.trim().split(" ").map(Number);
                            if(Number.isNaN(a)||Number.isNaN(b))return mostrarMenu();
                            await main(a,b);
                        }catch(e){console.error(e.message);}
                        mostrarMenu();
                    });

                case"6":
                case"salir":
                case"exit":
                    return cerrarAplicacion();

                default:
                    console.log("Opcion invalida");
                    return mostrarMenu();
            }
        }catch(e){
            console.error(e.message);
            mostrarMenu();
        }
    });
}
/* START */
mostrarMenu();
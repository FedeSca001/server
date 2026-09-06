const express=require("express");
const router=express.Router();
const db=require("../../DataBase/db.js");
/*---------------- QUERIES ----------------*/
const getElementbyTitle=(title,filter="all")=>{
    return new Promise((resolve,reject)=>{
        let sql="SELECT * FROM cards WHERE title LIKE ?";
        const params=[`%${title}%`];
        if(filter!=="all"){
            sql+=" AND type = ?";
            params.push(filter);
        }
        db.query(sql,params,(err,results)=>{
            if(err){
                return reject(err);
            }
            resolve(results);
        });
    });
};

const getElementByName=name=>{
    return new Promise((resolve,reject)=>{
        const sql="SELECT * FROM cards WHERE title = ?";
        const params=[name];
        db.query(sql,params,(err,results)=>{
            if(err){
                return reject(err);
            }
            resolve(results);
        });
    });
};

/*---------------- ROUTES ----------------*/
router.get("/card-title/:title",async(req,res)=>{
    try{
        const {title}=req.params;
        const filter=req.query.filter||"all";
        const cards=await getElementbyTitle(title,filter);
        console.log(`[GET /card-title/${title}] ${cards.length} cards encontradas | filtro: ${filter}`);
        res.json(cards);
    }catch(err){
        console.error(err);
        if(!res.headersSent){
            res.status(500).json({
                error:"Internal server error"
            });
        }
    }
});
router.get("/card-name/:name",async(req,res)=>{
    try{
        const {name}=req.params;
        const cards=await getElementByName(name);
        console.log(`[GET /card-name/${name}] ${cards.length} cards encontradas`);
        res.json(cards);
    }catch(err){
        console.error(err);
        if(!res.headersSent){
            res.status(500).json({
                error:"Internal server error"
            });
        }
    }
});
module.exports=router;
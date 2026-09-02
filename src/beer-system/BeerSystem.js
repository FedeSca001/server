console.log('hola BEER');
const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

/* ---------------- QUERIES ---------------- */

const getRecetas = async ()=>{
    return new Promise((resolve, reject)=>{
        db.query(
            "SELECT * FROM recetas",
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(results);
                    resolve(results);
                }
            }
        );
    });
}


/* ---------------- ROUTES ---------------- */

router.get("/", async (req, res) => {
    try {
        getRecetas();
    } catch (error) {
        res.json({ error: err.message});
    }
});

module.exports = router;
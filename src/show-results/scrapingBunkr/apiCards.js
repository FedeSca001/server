const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

/*---------------- QUERIES ---------------- */

const getElementbyTitle = (title) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM cards WHERE title LIKE ?",
            [`%${title}%`],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results); // devuelve todos los resultados
                }
                console.log(results)
            }
        );
    });
};

/* ---------------- ROUTES ---------------- */

router.get("/card-title/:title", async (req, res) => {
    try {
        const card = await getElementbyTitle(req.params.title);
        res.json(card);
        console.log(`[GET /card-title/${title}] ${results.length} cards encontradas | IDs: ${results.map(c => c.id).join(", ")}`);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
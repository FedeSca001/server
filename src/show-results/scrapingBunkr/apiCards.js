const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

/*---------------- QUERIES ----------------*/

const getElementbyTitle = (title) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM cards WHERE title LIKE ?",
            [`%${title}%`],
            (err, results) => {
                if (err) {
                    return reject(err);
                }

                resolve(results);
            }
        );
    });
};

/*---------------- ROUTES ----------------*/

router.get("/card-title/:title", async (req, res) => {
    try {
        const card = await getElementbyTitle(req.params.title);

        console.log(
            `[GET /card-title/${req.params.title}] ${card.length} cards encontradas | IDs: ${card.map(c => c.id).join(", ")}`
        );

        res.json(card);
    } catch (err) {
        console.error(err);

        if (!res.headersSent) {
            res.status(500).json({
                error: "Internal server error"
            });
        }
    }
});

module.exports = router;
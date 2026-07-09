const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");


/* ---------------- DB QUERIES ---------------- */
const findArtist = async (input) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM artists WHERE name LIKE ?", [`%${input}%`], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

/* ----------------ROUTES---------------- */
router.get("/coomer-input/:_input", async (req, res) => {
    try {
        const results = await findArtist(req.params._input);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../db/db.js");

const findAlbum = async (input) => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM albums WHERE title LIKE ?", [`%${input}%`], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

router.get("/:_input", async (req, res) => {
    try {
        const results = await findAlbum(req.params._input);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const db = require("../DataBase/db.js");

const topElements = async () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM albums ORDER BY id DESC LIMIT 10", (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

const randomElements = async () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT * FROM albums ORDER BY RAND() LIMIT 10", (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};

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
router.get("/top", async (req, res) => {
    try {
        const results = await topElements();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
router.get("/random", async (req, res) => {
    try {
        const results = await randomElements();
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
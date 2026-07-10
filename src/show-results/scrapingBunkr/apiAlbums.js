const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

const topElements = async () => {
    return new Promise((resolve, reject) => {// SELECT * FROM albums ORDER BY id DESC LIMIT 12;
        db.query("SELECT * FROM albums ORDER BY id DESC LIMIT 16;", (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
const randomElements = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS total FROM albums", (err, rows) => {
            if (err) return reject(err);

            const total = rows[0].total;
            const offset = Math.floor(Math.random() * (total - 16));

            db.query(
                "SELECT * FROM albums LIMIT 16 OFFSET ?",
                [offset],
                (err, results) => {
                    if (err) reject(err);
                    else resolve(results);
                }
            );
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
const deleteAlbum = async (id) => {
    return new Promise((resolve, reject) => {
        db.query("DELETE FROM albums WHERE id = ?", [id], (err, results) => {
            if (err) {
                reject(err);
            } else {
                resolve(results);
            }
        });
    });
};
/* ---------------- ROUTES ---------------- */
router.get("/album-input/:_input", async (req, res) => {
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

router.delete("/delete/:id", async (req, res) => {
    try {
        const results = await deleteAlbum(req.params.id);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
module.exports = router;
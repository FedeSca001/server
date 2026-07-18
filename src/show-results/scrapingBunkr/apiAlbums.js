const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

const LIMIT = 16;

/* ---------------- QUERIES ---------------- */

const topElements = async () => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM albums ORDER BY id DESC LIMIT ?",
            [LIMIT],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(
                        `[GET /top] ${results.length} álbumes`
                    );
                    resolve(results);
                }
            }
        );
    });
};

const moreTopElements = async (offset) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM albums ORDER BY id DESC LIMIT ? OFFSET ?",
            [LIMIT, offset],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(
                        `[GET /top-more/${offset}] ${results.length} álbumes`
                    );
                    resolve(results);
                }
            }
        );
    });
};

const randomElements = () => {
    return new Promise((resolve, reject) => {
        db.query("SELECT COUNT(*) AS total FROM albums", (err, rows) => {
            if (err) return reject(err);

            const total = rows[0].total;
            const offset = Math.floor(Math.random() * Math.max(1, total - LIMIT));

            db.query(
                "SELECT * FROM albums LIMIT ? OFFSET ?",
                [LIMIT, offset],
                (err, results) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log(
                            `[GET /random] ${results.length} álbumes | Offset: ${offset}`
                        );
                        resolve(results);
                    }
                }
            );
        });
    });
};

const findAlbum = async (input) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM albums WHERE title LIKE ?",
            [`%${input}%`],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(
                        `[GET /album-input/${input}] ${results.length} álbumes encontrados`
                    );
                    resolve(results);
                }
            }
        );
    });
};

const deleteAlbum = async (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM albums WHERE id = ?",
            [id],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(
                        `[DELETE /delete/${id}] Filas eliminadas: ${results.affectedRows}`
                    );
                    resolve(results);
                }
            }
        );
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

router.get("/top-more/:offset", async (req, res) => {
    try {
        const offset = parseInt(req.params.offset) || 0;
        const results = await moreTopElements(offset);
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
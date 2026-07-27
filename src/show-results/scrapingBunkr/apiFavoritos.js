const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

/* ---------------- QUERIES ---------------- */

const getFavoritos = () => {
    return new Promise((resolve, reject) => {
        const sql = `
            SELECT 
                f.id,
                f.tipo,
                f.referencia_id,
                f.fecha,
                CASE 
                    WHEN f.tipo = 'album' THEN a.title
                    WHEN f.tipo = 'card' THEN c.title
                END AS title,
                CASE 
                    WHEN f.tipo = 'album' THEN a.url
                    WHEN f.tipo = 'card' THEN c.url
                END AS url,
                CASE 
                    WHEN f.tipo = 'album' THEN a.image
                    WHEN f.tipo = 'card' THEN c.image
                END AS image
            FROM favoritos f
            LEFT JOIN albums a ON f.tipo = 'album' AND f.referencia_id = a.id
            LEFT JOIN cards c ON f.tipo = 'card' AND f.referencia_id = c.id
            ORDER BY f.fecha DESC
        `;

        db.query(sql, (err, results) => {
            if (err) {
                return reject(err);
            }
            console.log(`[GET /apiFavoritos] ${results.length} favoritos`);
            resolve(results);
        });
    });
};

const addFavorito = (tipo, referencia_id) => {
    return new Promise((resolve, reject) => {
        const sql = `
            INSERT INTO favoritos (tipo, referencia_id)
            VALUES (?, ?)
        `;

        db.query(sql, [tipo, referencia_id], (err, results) => {
            if (err) {
                // Si ya existe (por el UNIQUE KEY)
                if (err.code === "ER_DUP_ENTRY") {
                    return resolve({ alreadyExists: true, message: "Ya está en favoritos" });
                }
                return reject(err);
            }
            console.log(`[POST /apiFavoritos] Favorito añadido → tipo: ${tipo}, id: ${referencia_id}`);
            resolve(results);
        });
    });
};

const deleteFavorito = (id) => {
    return new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM favoritos WHERE id = ?",
            [id],
            (err, results) => {
                if (err) {
                    return reject(err);
                }
                console.log(`[DELETE /apiFavoritos/${id}] Filas eliminadas: ${results.affectedRows}`);
                resolve(results);
            }
        );
    });
};

/* ---------------- ROUTES ---------------- */

// GET todos los favoritos (con title + url + image)
router.get("/", async (req, res) => {
    try {
        const results = await getFavoritos();
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// POST añadir favorito
router.post("/", async (req, res) => {
    try {
        const { tipo, referencia_id } = req.body;

        if (!tipo || !referencia_id) {
            return res.status(400).json({ error: "Faltan campos: tipo y referencia_id" });
        }

        if (!["album", "card"].includes(tipo)) {
            return res.status(400).json({ error: "tipo debe ser 'album' o 'card'" });
        }

        const result = await addFavorito(tipo, referencia_id);

        if (result.alreadyExists) {
            return res.status(200).json(result);
        }

        res.status(201).json({
            message: "Favorito añadido correctamente",
            id: result.insertId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE favorito por id
router.delete("/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await deleteFavorito(id);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Favorito no encontrado" });
        }

        res.json({ message: "Favorito eliminado correctamente" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
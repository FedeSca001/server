const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");
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
            LEFT JOIN albums a
                ON f.tipo = 'album'
                AND f.referencia_id = a.id
            LEFT JOIN cards c
                ON f.tipo = 'card'
                AND f.referencia_id = c.id
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
                if (err.code === "ER_DUP_ENTRY") {
                    return resolve({
                        alreadyExists: true,
                        message: "Ya está en favoritos"
                    });
                }
                return reject(err);
            }
            console.log(`[POST /apiFavoritos] Favorito añadido → tipo: ${tipo}, id: ${referencia_id}`);
            resolve(results);
        });
    });
};
const deleteFavorito = id => {
    return new Promise((resolve, reject) => {
        const sql = "DELETE FROM favoritos WHERE id = ?";
        db.query(sql, [id], (err, results) => {
            if (err) {
                return reject(err);
            }
            console.log(`[DELETE /apiFavoritos/${id}] Filas eliminadas: ${results.affectedRows}`);
            resolve(results);
        });
    });
};
router.get("/", async (req, res) => {
    try {
        const results = await getFavoritos();
        res.status(200).json(results);
    } catch (err) {
        console.error("[GET /apiFavoritos] Error:", err);
        res.status(500).json({
            error: "Error obteniendo favoritos",
            details: err.message
        });
    }
});
router.post("/", async (req, res) => {
    try {
        const { tipo, referencia_id } = req.body;
        if (!tipo || referencia_id === undefined || referencia_id === null) {
            return res.status(400).json({
                error: "Faltan campos: tipo y referencia_id"
            });
        }
        if (!["album", "card"].includes(tipo)) {
            return res.status(400).json({
                error: "tipo debe ser 'album' o 'card'"
            });
        }
        const referenciaId = Number(referencia_id);
        if (!Number.isInteger(referenciaId) || referenciaId <= 0) {
            return res.status(400).json({
                error: "referencia_id debe ser un número entero válido"
            });
        }
        const result = await addFavorito(tipo, referenciaId);
        if (result.alreadyExists) {
            return res.status(200).json(result);
        }
        return res.status(201).json({
            message: "Favorito añadido correctamente",
            id: result.insertId
        });
    } catch (err) {
        console.error("[POST /apiFavoritos] Error:", err);
        return res.status(500).json({
            error: "Error añadiendo favorito",
            details: err.message
        });
    }
});
router.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID de favorito inválido"
            });
        }
        console.log(`[DELETE /apiFavoritos/${id}] Solicitud recibida`);
        const result = await deleteFavorito(id);
        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: "Favorito no encontrado",
                id
            });
        }
        return res.status(200).json({
            message: "Favorito eliminado correctamente",
            id
        });
    } catch (err) {
        console.error(`[DELETE /apiFavoritos/${req.params.id}] Error:`, err);
        return res.status(500).json({
            error: "Error eliminando favorito",
            details: err.message
        });
    }
});
module.exports = router;
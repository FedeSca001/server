const express = require("express");
const router = express.Router();
const db = require("../../DataBase/db.js");

/*---------------- QUERIES ---------------- */
/*
MariaDB [scraper]> DESCRIBE cards;
+----------+--------------+------+-----+---------+----------------+
| Field    | Type         | Null | Key | Default | Extra          |
+----------+--------------+------+-----+---------+----------------+
| id       | int(11)      | NO   | PRI | NULL    | auto_increment |
| album_id | int(11)      | NO   | MUL | NULL    |                |
| title    | varchar(255) | YES  |     | NULL    |                |
| url      | text         | YES  | UNI | NULL    |                |
| image    | text         | YES  |     | NULL    |                |
| size     | varchar(50)  | YES  |     | NULL    |                |
| date     | varchar(50)  | YES  |     | NULL    |                |
| type     | varchar(50)  | YES  |     | NULL    |                |
+----------+--------------+------+-----+---------+----------------+
8 rows in set (0,001 sec)

*/

const getElementbyTitle = (title) => {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM cards WHERE title = ?",
            [title],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results[0]);
                }
            }
        );
    });
}

/* ---------------- ROUTES ---------------- */

router.get("/card-title/:title", async (req, res) => {
    try {
        const card = await getElementbyTitle(req.params.title);
        res.json(card);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
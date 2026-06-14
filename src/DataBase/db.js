const mysql = require("mysql2");

// Crear conexión a la base de datos
const db = mysql.createConnection({
    host: "localhost",
    user: "scraper_user",
    password: "123456_asd",
    database: "scraper"
});

// Conectar
db.connect((err) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:", err.message);
        return;
    }

    console.log("✅ Conectado a MariaDB");
});

module.exports = db;
// Crear conexión a la base de datos
const mysql = require("mysql2");

const db = mysql.createPool({
    host: "127.0.0.1",
    user: "scraper_user",
    password: "123456_asd",
    database: "scraper",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});


// Conectar
db.connect((err) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:");
        console.error(err); // <-- importante para ver el error real completo
        return;
    }

    console.log("✅ Conectado a MariaDB");
});

module.exports = db;
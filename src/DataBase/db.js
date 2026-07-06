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

// test opcional (correcto con pool)
db.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Error conectando a la base de datos:");
        console.error(err);
        return;
    }

    console.log("✅ Conectado a MariaDB (pool)"+ connection.threadId);
    connection.release();
});

module.exports = db;
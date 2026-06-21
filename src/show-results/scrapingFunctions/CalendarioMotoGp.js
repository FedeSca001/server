const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../../DataBase/db.js");

const url = "https://www.marca.com/motor/motogp/calendario.html?intcmp=MENUMIGA&s_kw=calendario#";

const updateCalendario = async () => {
  try {
    const { data } = await axios.get(url, {
      responseType: "arraybuffer",
    });
    const html = Buffer.from(data, "binary").toString("latin1");
    const $ = cheerio.load(html);
    const calendario = [];
    $(".gran-premio__element").each((index, element) => {
      const granPremio = $(element)
        .find(".gran-premio__title-item a")
        .text()
        .trim();

      const fecha = $(element)
        .find(".gran-premio__date")
        .text()
        .trim();

      const circuito = $(element)
        .find(".gran-premio__circuit-name")
        .text()
        .trim();

      const imgCircuito = $(element)
        .find(".gran-premio__img-circuit")
        .attr("src");

      // Podio MotoGP
      const podium = [];

      $(element)
        .find(".category-motogp .gran-premio__podium-item")
        .each((i, podiumItem) => {
          const position = $(podiumItem)
            .find(".gran-premio__podium-data")
            .text()
            .trim();

          const piloto = $(podiumItem)
            .text()
            .replace(position, "")
            .trim();

          const bandera = $(podiumItem)
            .find("img")
            .attr("src");

          podium.push({
            position,
            piloto,
            bandera,
          });
        });

      // Horarios
      const competiciones = {
        motoGp: [],
        moto2: [],
        moto3: [],
      };

      let currentDay = null;

      $(element)
        .find(".gran-premio__schedule")
        .children()
        .each((i, child) => {
          if ($(child).is("dt")) {
            currentDay = $(child).text().trim();
          } else if ($(child).is("dd")) {
            const link = $(child).find("a").attr("href");
            const descripcion = $(child).find("a").text().trim();
            const hora = $(child).find(".hora").text().trim();

            if (competiciones.motoGp.length < 6) {
              competiciones.motoGp.push({
                dia: currentDay,
                descripcion,
                link,
                hora,
              });
            } else if (competiciones.moto2.length < 5) {
              competiciones.moto2.push({
                dia: currentDay,
                descripcion,
                link,
                hora,
              });
            } else {
              competiciones.moto3.push({
                dia: currentDay,
                descripcion,
                link,
                hora,
              });
            }
          }
        });

      calendario.push({
        index,
        granPremio,
        fecha,
        circuito,
        imgCircuito,
        podium,
        competiciones,
      });
    });

    return calendario;
  } catch (error) {
    console.error("Error al obtener el calendario MotoGP:", error);

    return {
      error: "Error al obtener el calendario MotoGP",
      detalle: error.message,
    };
  }
};

router.get("/", async (req, res) => {
  const data = await updateCalendario();
  if (data.error) return res.status(500).json(data);

  const conn = await db.promise().getConnection();

  try {
    await conn.beginTransaction();

    for (const item of data) {

      const [gpResult] = await conn.query(
        `INSERT INTO grandes_premios (nombre, fecha, circuito, img_circuito)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
         circuito=VALUES(circuito),
         img_circuito=VALUES(img_circuito)`,
        [
          item.granPremio.trim(),
          item.fecha.trim(),
          item.circuito,
          item.imgCircuito
        ]
      );

      const gpId = gpResult.insertId;

      await conn.query("DELETE FROM podios WHERE gp_id=?", [gpId]);
      await conn.query("DELETE FROM horarios WHERE gp_id=?", [gpId]);

      if (item.podium.length) {
        const podioValues = item.podium.map(p => [
          gpId,
          p.position,
          p.piloto,
          p.bandera
        ]);

        await conn.query(
          "INSERT INTO podios (gp_id, posicion, piloto, bandera) VALUES ?",
          [podioValues]
        );
      }

      for (const cat of ["motoGp", "moto2", "moto3"]) {
        if (!item.competiciones[cat].length) continue;

        const horariosValues = item.competiciones[cat].map(c => [
          gpId,
          cat,
          c.dia,
          c.descripcion,
          c.hora,
          c.link
        ]);

        await conn.query(
          "INSERT INTO horarios (gp_id, categoria, dia, descripcion, hora, link) VALUES ?",
          [horariosValues]
        );
      }
    }

    await conn.commit();
    conn.release();

    return res.json({ ok: true, total: data.length });

  } catch (err) {
    await conn.rollback();
    conn.release();
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
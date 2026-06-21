const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
//const db = require("../../DataBase/db.js");

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

  try {
    for (const item of data) {
      await db.promise().query(
        `
        INSERT INTO grandes_premios(nombre,fecha,circuito,img_circuito)
        VALUES(?,?,?,?)
        ON DUPLICATE KEY UPDATE
        circuito=VALUES(circuito),
        img_circuito=VALUES(img_circuito)
        `,
        [item.granPremio, item.fecha, item.circuito, item.imgCircuito]
      );

      const [[gp]] = await db.promise().query(
        "SELECT id FROM grandes_premios WHERE nombre=? AND fecha=?",
        [item.granPremio, item.fecha]
      );

      await db.promise().query("DELETE FROM podios WHERE gp_id=?", [gp.id]);
      await db.promise().query("DELETE FROM horarios WHERE gp_id=?", [gp.id]);

      for (const p of item.podium) {
        await db.promise().query(
          "INSERT INTO podios(gp_id,posicion,piloto,bandera) VALUES(?,?,?,?)",
          [gp.id, p.position, p.piloto, p.bandera]
        );
      }

      for (const categoria of ["motoGp", "moto2", "moto3"]) {
        for (const c of item.competiciones[categoria]) {
          await db.promise().query(
            "INSERT INTO horarios(gp_id,categoria,dia,descripcion,hora,link) VALUES(?,?,?,?,?,?)",
            [gp.id, categoria, c.dia, c.descripcion, c.hora, c.link]
          );
        }
      }
    }

    res.json({ ok: true, total: data.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
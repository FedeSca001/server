const express = require("express");
const router = express.Router();
const cheerio = require("cheerio");
const axios = require("axios");
const db = require("../../DataBase/db.js");

const url = "https://www.marca.com/motor/motogp/calendario.html?intcmp=MENUMIGA&s_kw=calendario#";

const updateCalendario = async () => {
  try {
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    const $ = cheerio.load(Buffer.from(data, "binary").toString("latin1"));

    const calendario = [];

    $(".gran-premio__element").each((index, el) => {
      const $el = $(el);

      const granPremio = $el.find(".gran-premio__title-item a").text().trim();
      const fecha = $el.find(".gran-premio__date").text().trim();
      const circuito = $el.find(".gran-premio__circuit-name").text().trim();
      const imgCircuito = $el.find(".gran-premio__img-circuit").attr("src");

      const podium = [];
      $el.find(".category-motogp .gran-premio__podium-item").each((_, p) => {
        const $p = $(p);
        const position = $p.find(".gran-premio__podium-data").text().trim();
        podium.push({
          position,
          piloto: $p.text().replace(position, "").trim(),
          bandera: $p.find("img").attr("src")
        });
      });

      const competiciones = { motoGp: [], moto2: [], moto3: [] };
      let currentDay = null;

      $el.find(".gran-premio__schedule").children().each((_, c) => {
        const $c = $(c);

        if ($c.is("dt")) currentDay = $c.text().trim();

        if ($c.is("dd")) {
          const item = {
            dia: currentDay,
            descripcion: $c.find("a").text().trim(),
            link: $c.find("a").attr("href"),
            hora: $c.find(".hora").text().trim()
          };

          if (competiciones.motoGp.length < 6) competiciones.motoGp.push(item);
          else if (competiciones.moto2.length < 5) competiciones.moto2.push(item);
          else competiciones.moto3.push(item);
        }
      });

      calendario.push({
        index,
        granPremio,
        fecha,
        circuito,
        imgCircuito,
        podium,
        competiciones
      });
    });

    return calendario;
  } catch (e) {
    return { error: true, detalle: e.message };
  }
};

router.get("/", async (req, res) => {
  const data = await updateCalendario();
  if (data.error) return res.status(500).json(data);

  try {
    for (const item of data) {
      await db.promise().query(
        `INSERT INTO grandes_premios(nombre,fecha,circuito,img_circuito)
         VALUES(?,?,?,?)
         ON DUPLICATE KEY UPDATE circuito=VALUES(circuito), img_circuito=VALUES(img_circuito)`,
        [item.granPremio, item.fecha, item.circuito, item.imgCircuito]
      );

      const [rows] = await db.promise().query(
        "SELECT id FROM grandes_premios WHERE nombre=? AND fecha=?",
        [item.granPremio, item.fecha]
      );

      if (!rows.length) continue;
      const gpId = rows[0].id;

      await db.promise().query("DELETE FROM podios WHERE gp_id=?", [gpId]);
      await db.promise().query("DELETE FROM horarios WHERE gp_id=?", [gpId]);

      for (const p of item.podium) {
        await db.promise().query(
          "INSERT INTO podios(gp_id,posicion,piloto,bandera) VALUES(?,?,?,?)",
          [gpId, p.position, p.piloto, p.bandera]
        );
      }

      for (const cat of ["motoGp", "moto2", "moto3"]) {
        for (const c of item.competiciones[cat]) {
          await db.promise().query(
            "INSERT INTO horarios(gp_id,categoria,dia,descripcion,hora,link) VALUES(?,?,?,?,?,?)",
            [gpId, cat, c.dia, c.descripcion, c.hora, c.link]
          );
        }
      }
    }

    res.json({ ok: true, total: data.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
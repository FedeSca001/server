const cheerio = require("cheerio");

/*const getRace = async () => {
  try {
    const response = await fetch("https://www.motogp.com/en/calendar");
    const html = await response.text();
    const $ = cheerio.load(html);

    const races = [];

    $(".event-item").each((index, element) => {
      const raceName = $(element).find(".event-name").text().trim();
      const raceDate = $(element).find(".event-date").text().trim();

      races.push({ name: raceName, date: raceDate });
    });

    return races;

  } catch (error) {
    console.error("Error al obtener las carreras:", error);
    throw error;
  }
};
*/
const getRace = async () => {
  console.log("hola funciones");

  return [
    { name: "Test Race", date: "2026-01-01" }
  ];
};

module.exports = { getRace };
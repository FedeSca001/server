Servidor casero
Tura: http://192.168.1.140:3000/
EN SQL BUSCAR DUPLICADOS
SELECT url
    -> FROM cards
    -> GROUP BY url
    -> HAVING COUNT(*) > 1;

SELECT id FROM albums WHERE url LIKE 'https://bunkr.cr/a/xrFAw8tZ';
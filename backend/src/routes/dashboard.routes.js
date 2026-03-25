const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Resumen general dashboard
router.get("/resumen", async (req, res) => {
  try {
    const totalHerramientas = await pool.query(`
      SELECT COUNT(*) AS total
      FROM herramientas
    `);

    const disponibles = await pool.query(`
      SELECT COUNT(*) AS total
      FROM herramientas
      WHERE estado = 'disponible'
    `);

    const enReparacion = await pool.query(`
      SELECT COUNT(*) AS total
      FROM herramientas
      WHERE estado = 'en_reparacion'
    `);

    const enObra = await pool.query(`
      SELECT COUNT(*) AS total
      FROM herramientas
      WHERE estado = 'en_obra'
    `);

    res.json({
      total_herramientas: Number(totalHerramientas.rows[0].total || 0),
      disponibles: Number(disponibles.rows[0].total || 0),
      en_reparacion: Number(enReparacion.rows[0].total || 0),
      en_obra: Number(enObra.rows[0].total || 0),
    });
  } catch (error) {
    console.error("ERROR GET /api/dashboard/resumen:", error.message);
    res.status(500).json({
      error: "Error al cargar resumen",
      detalle: error.message,
    });
  }
});

// Conteo por bodega
router.get("/bodegas", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        b.id,
        b.nombre,
        b.tipo,
        COUNT(DISTINCT h.id) AS total_herramientas,
        COUNT(DISTINCT c.id) AS total_contenedores
      FROM bodegas b
      LEFT JOIN herramientas h ON h.bodega_id = b.id
      LEFT JOIN contenedores c ON c.bodega_id = b.id
      GROUP BY b.id, b.nombre, b.tipo
      ORDER BY b.nombre ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/dashboard/bodegas:", error.message);
    res.status(500).json({
      error: "Error al cargar conteo por bodega",
      detalle: error.message,
    });
  }
});

module.exports = router;
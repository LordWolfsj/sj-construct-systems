const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const enReparacion30Dias = await pool.query(`
      SELECT
        r.id,
        r.herramienta_id,
        h.codigo_interno,
        h.nombre,
        r.fecha_envio,
        CURRENT_DATE - r.fecha_envio AS dias_en_reparacion
      FROM reparaciones r
      JOIN herramientas h ON h.id = r.herramienta_id
      WHERE r.estado = 'en_reparacion'
        AND r.fecha_envio <= CURRENT_DATE - INTERVAL '30 days'
      ORDER BY r.fecha_envio ASC
    `);

    const muchasReparaciones = await pool.query(`
      SELECT
        h.id AS herramienta_id,
        h.codigo_interno,
        h.nombre,
        COUNT(r.id) AS total_reparaciones
      FROM herramientas h
      JOIN reparaciones r ON r.herramienta_id = h.id
      GROUP BY h.id, h.codigo_interno, h.nombre
      HAVING COUNT(r.id) >= 3
      ORDER BY COUNT(r.id) DESC
    `);

    const obrasSinHerramientas = await pool.query(`
      SELECT
        o.id,
        o.nombre,
        o.encargado
      FROM obras o
      LEFT JOIN bodegas b ON b.obra_id = o.id
      LEFT JOIN herramientas h ON h.bodega_id = b.id
      GROUP BY o.id, o.nombre, o.encargado
      HAVING COUNT(h.id) = 0
      ORDER BY o.nombre
    `);

    const herramientasBaja = await pool.query(`
      SELECT
        id,
        codigo_interno,
        nombre,
        estado
      FROM herramientas
      WHERE estado = 'baja'
      ORDER BY id DESC
    `);

    res.json({
      enReparacion30Dias: enReparacion30Dias.rows,
      muchasReparaciones: muchasReparaciones.rows,
      obrasSinHerramientas: obrasSinHerramientas.rows,
      herramientasBaja: herramientasBaja.rows,
    });
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener alertas",
      detalle: error.message,
    });
  }
});

module.exports = router;
const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar movimientos
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        m.id,
        m.herramienta_id,
        h.numero_serie,
        m.bodega_origen,
        m.bodega_destino,
        m.usuario_id,
        m.observacion,
        m.fecha,
        h.codigo_interno,
        h.nombre AS herramienta,
        bo.nombre AS bodega_origen_nombre,
        bd.nombre AS bodega_destino_nombre
      FROM movimientos m
      LEFT JOIN herramientas h ON h.id = m.herramienta_id
      LEFT JOIN bodegas bo ON bo.id = m.bodega_origen
      LEFT JOIN bodegas bd ON bd.id = m.bodega_destino
      ORDER BY m.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/movimientos:", error.message);
    res.status(500).json({
      error: "Error al listar movimientos",
      detalle: error.message,
    });
  }
});

// Crear movimiento
router.post("/", async (req, res) => {
  try {
    const {
      herramienta_id,
      bodega_origen,
      bodega_destino,
      usuario_id,
      observacion,
    } = req.body;

    if (!herramienta_id || !bodega_origen || !bodega_destino) {
      return res.status(400).json({
        error: "Herramienta, bodega origen y bodega destino son obligatorios",
      });
    }

    const herramientaResult = await pool.query(
      `
      SELECT id, nombre, codigo_interno, bodega_id, estado
      FROM herramientas
      WHERE id = $1
      `,
      [herramienta_id]
    );

    if (herramientaResult.rows.length === 0) {
      return res.status(404).json({ error: "Herramienta no encontrada" });
    }

    const herramienta = herramientaResult.rows[0];

    if (Number(herramienta.bodega_id) !== Number(bodega_origen)) {
      return res.status(400).json({
        error: "La bodega origen no coincide con la bodega actual de la herramienta",
      });
    }

    if (herramienta.estado === "baja") {
      return res.status(400).json({
        error: "No se puede mover una herramienta dada de baja",
      });
    }

    await pool.query("BEGIN");

    await pool.query(
      `
      INSERT INTO movimientos (
        herramienta_id,
        bodega_origen,
        bodega_destino,
        usuario_id,
        observacion,
        fecha
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [
        herramienta_id,
        bodega_origen,
        bodega_destino,
        usuario_id || null,
        observacion || null,
      ]
    );

    const bodegaDestinoResult = await pool.query(
      `SELECT nombre, tipo FROM bodegas WHERE id = $1`,
      [bodega_destino]
    );

    let nuevoEstado = "disponible";

    if (bodegaDestinoResult.rows.length > 0) {
      const destino = bodegaDestinoResult.rows[0];
      nuevoEstado = destino.tipo === "OBRA" ? "en_obra" : "disponible";
    }

    await pool.query(
      `
      UPDATE herramientas
      SET bodega_id = $1,
          estado = $2
      WHERE id = $3
      `,
      [bodega_destino, nuevoEstado, herramienta_id]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      ok: true,
      mensaje: "Movimiento registrado correctamente",
    });
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("ERROR POST /api/movimientos:", error.message);
    res.status(500).json({
      error: "Error al registrar movimiento",
      detalle: error.message,
    });
  }
});

module.exports = router;
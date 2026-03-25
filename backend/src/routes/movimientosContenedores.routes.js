const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar movimientos de contenedores
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        mc.id,
        mc.contenedor_id,
        mc.bodega_origen,
        mc.bodega_destino,
        mc.usuario_id,
        mc.observacion,
        mc.fecha,
        c.numero_manual,
        c.codigo_interno,
        c.tipo,
        bo.nombre AS bodega_origen_nombre,
        bd.nombre AS bodega_destino_nombre
      FROM movimientos_contenedores mc
      LEFT JOIN contenedores c ON c.id = mc.contenedor_id
      LEFT JOIN bodegas bo ON bo.id = mc.bodega_origen
      LEFT JOIN bodegas bd ON bd.id = mc.bodega_destino
      ORDER BY mc.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/movimientos-contenedores:", error.message);
    res.status(500).json({
      error: "Error al listar movimientos de contenedores",
      detalle: error.message,
    });
  }
});

// Crear movimiento de contenedor
router.post("/", async (req, res) => {
  try {
    const {
      contenedor_id,
      bodega_origen,
      bodega_destino,
      usuario_id,
      observacion,
    } = req.body;

    if (!contenedor_id || !bodega_origen || !bodega_destino) {
      return res.status(400).json({
        error: "Contenedor, bodega origen y bodega destino son obligatorios",
      });
    }

    const contenedorResult = await pool.query(
      `
      SELECT id, bodega_id, codigo_interno, numero_manual, tipo
      FROM contenedores
      WHERE id = $1
      `,
      [contenedor_id]
    );

    if (contenedorResult.rows.length === 0) {
      return res.status(404).json({ error: "Contenedor no encontrado" });
    }

    const contenedor = contenedorResult.rows[0];

    if (Number(contenedor.bodega_id) !== Number(bodega_origen)) {
      return res.status(400).json({
        error: "La bodega origen no coincide con la bodega actual del contenedor",
      });
    }

    await pool.query("BEGIN");

    await pool.query(
      `
      INSERT INTO movimientos_contenedores (
        contenedor_id,
        bodega_origen,
        bodega_destino,
        usuario_id,
        observacion,
        fecha
      )
      VALUES ($1, $2, $3, $4, $5, NOW())
      `,
      [
        contenedor_id,
        bodega_origen,
        bodega_destino,
        usuario_id || null,
        observacion || null,
      ]
    );

    await pool.query(
      `
      UPDATE contenedores
      SET bodega_id = $1
      WHERE id = $2
      `,
      [bodega_destino, contenedor_id]
    );

    await pool.query("COMMIT");

    res.status(201).json({
      ok: true,
      mensaje: "Movimiento de contenedor registrado correctamente",
    });
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("ERROR POST /api/movimientos-contenedores:", error.message);
    res.status(500).json({
      error: "Error al registrar movimiento de contenedor",
      detalle: error.message,
    });
  }
});

module.exports = router;
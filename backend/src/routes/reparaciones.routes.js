const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar reparaciones
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.*,
        h.codigo_interno,
        h.nombre AS herramienta,
        h.numero_serie
      FROM reparaciones r
      LEFT JOIN herramientas h ON h.id = r.herramienta_id
      ORDER BY r.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/reparaciones:", error.message);
    res.status(500).json({
      error: "Error al listar reparaciones",
      detalle: error.message,
    });
  }
});

// Crear reparación
router.post("/", async (req, res) => {
  try {
    const {
      herramienta_id,
      proveedor,
      descripcion_falla,
      fecha_envio,
      decision_final,
      observaciones,
    } = req.body;

    if (!herramienta_id || !proveedor || !descripcion_falla || !fecha_envio) {
      return res.status(400).json({
        error: "Herramienta, proveedor, falla y fecha de envío son obligatorios",
      });
    }

    const herramientaResult = await pool.query(
      `
      SELECT id, estado
      FROM herramientas
      WHERE id = $1
      `,
      [herramienta_id]
    );

    if (herramientaResult.rows.length === 0) {
      return res.status(404).json({ error: "Herramienta no encontrada" });
    }

    await pool.query("BEGIN");

    const reparacionResult = await pool.query(
      `
      INSERT INTO reparaciones (
        herramienta_id,
        proveedor,
        proveedor_id,
        descripcion_falla,
        fecha_envio,
        decision_final,
        observaciones,
        estado
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
      `,
      [
        herramienta_id,
        proveedor,
        null,
        descripcion_falla,
        fecha_envio,
        decision_final || "reparar",
        observaciones || null,
        "en_reparacion",
      ]
    );

    await pool.query(
      `
      UPDATE herramientas
      SET estado = 'en_reparacion'
      WHERE id = $1
      `,
      [herramienta_id]
    );

    await pool.query("COMMIT");

    res.status(201).json(reparacionResult.rows[0]);
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("ERROR POST /api/reparaciones:", error.message);
    res.status(500).json({
      error: "Error al registrar reparación",
      detalle: error.message,
    });
  }
});

// Cerrar reparación
router.put("/:id/cerrar", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      fecha_retorno,
      costo_reparacion,
      observaciones_cierre,
      decision_cierre,
    } = req.body;

    const reparacionResult = await pool.query(
      `
      SELECT *
      FROM reparaciones
      WHERE id = $1
      `,
      [id]
    );

    if (reparacionResult.rows.length === 0) {
      return res.status(404).json({ error: "Reparación no encontrada" });
    }

    const reparacion = reparacionResult.rows[0];

    await pool.query("BEGIN");

    const nuevoEstadoReparacion =
      decision_cierre === "dar_baja" ? "no_reparable" : "reparada";

    await pool.query(
      `
      UPDATE reparaciones
      SET
        fecha_retorno = $1,
        costo_reparacion = $2,
        observaciones_cierre = $3,
        estado = $4,
        decision_cierre = $5
      WHERE id = $6
      `,
      [
        fecha_retorno || null,
        costo_reparacion || null,
        observaciones_cierre || null,
        nuevoEstadoReparacion,
        decision_cierre || "reparada",
        id,
      ]
    );

    const nuevoEstadoHerramienta =
      decision_cierre === "dar_baja" ? "baja" : "disponible";

    await pool.query(
      `
      UPDATE herramientas
      SET estado = $1
      WHERE id = $2
      `,
      [nuevoEstadoHerramienta, reparacion.herramienta_id]
    );

    await pool.query("COMMIT");

    res.json({
      ok: true,
      mensaje: "Reparación cerrada correctamente",
    });
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("ERROR PUT /api/reparaciones/:id/cerrar:", error.message);
    res.status(500).json({
      error: "Error al cerrar reparación",
      detalle: error.message,
    });
  }
});

module.exports = router;
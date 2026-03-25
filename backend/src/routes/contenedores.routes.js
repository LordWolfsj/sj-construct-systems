const express = require("express");
const router = express.Router();
const pool = require("../config/database");

function obtenerPrefijo(tipo) {
  switch (tipo) {
    case "Oficina":
      return "OF";
    case "Bodega":
      return "BO";
    case "Baño":
      return "BA";
    case "Duchas":
      return "DU";
    case "Mixto":
      return "MX";
    default:
      return "OT";
  }
}

// Listar contenedores
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        c.*,
        b.nombre AS bodega_nombre
      FROM contenedores c
      LEFT JOIN bodegas b ON b.id = c.bodega_id
      ORDER BY c.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/contenedores:", error.message);
    res.status(500).json({
      error: "Error al listar contenedores",
      detalle: error.message,
    });
  }
});

// Crear contenedor
router.post("/", async (req, res) => {
  try {
    const {
      numero_manual,
      tipo,
      bodega_id,
      detalle_exterior,
      detalle_interior,
    } = req.body;

    if (!numero_manual || !tipo || !bodega_id) {
      return res.status(400).json({
        error: "Número manual, tipo y bodega son obligatorios",
      });
    }

    const prefijo = obtenerPrefijo(tipo);

    const ultimo = await pool.query(
      `
      SELECT codigo_interno
      FROM contenedores
      WHERE codigo_interno LIKE $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [`${prefijo}%`]
    );

    let correlativo = 1;

    if (ultimo.rows.length > 0) {
      const codigoAnterior = ultimo.rows[0].codigo_interno;
      const numero = parseInt(codigoAnterior.replace(prefijo, ""), 10);
      if (!isNaN(numero)) {
        correlativo = numero + 1;
      }
    }

    const codigoInterno = `${prefijo}${String(correlativo).padStart(2, "0")}`;

    const result = await pool.query(
      `
      INSERT INTO contenedores (
        numero_manual,
        codigo_interno,
        tipo,
        bodega_id,
        detalle_exterior,
        detalle_interior
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
      `,
      [
        numero_manual,
        codigoInterno,
        tipo,
        bodega_id,
        detalle_exterior || null,
        detalle_interior || null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ERROR POST /api/contenedores:", error.message);
    res.status(500).json({
      error: "Error al crear contenedor",
      detalle: error.message,
    });
  }
});

// Editar contenedor
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      numero_manual,
      tipo,
      bodega_id,
      detalle_exterior,
      detalle_interior,
    } = req.body;

    if (!numero_manual || !tipo || !bodega_id) {
      return res.status(400).json({
        error: "Número manual, tipo y bodega son obligatorios",
      });
    }

    const result = await pool.query(
      `
      UPDATE contenedores
      SET
        numero_manual = $1,
        tipo = $2,
        bodega_id = $3,
        detalle_exterior = $4,
        detalle_interior = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        numero_manual,
        tipo,
        bodega_id,
        detalle_exterior || null,
        detalle_interior || null,
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contenedor no encontrado" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error("ERROR PUT /api/contenedores/:id:", error.message);
    res.status(500).json({
      error: "Error al editar contenedor",
      detalle: error.message,
    });
  }
});

// Eliminar contenedor
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `
      DELETE FROM contenedores
      WHERE id = $1
      RETURNING *
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Contenedor no encontrado" });
    }

    res.json({
      ok: true,
      mensaje: "Contenedor eliminado correctamente",
    });
  } catch (error) {
    console.error("ERROR DELETE /api/contenedores/:id:", error.message);
    res.status(500).json({
      error: "Error al eliminar contenedor",
      detalle: error.message,
    });
  }
});

module.exports = router;
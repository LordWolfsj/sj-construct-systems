const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar herramientas
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        h.*,
        b.nombre AS bodega
      FROM herramientas h
      LEFT JOIN bodegas b ON h.bodega_id = b.id
      ORDER BY h.id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/herramientas:", error.message);
    res.status(500).json({
      error: "Error al listar herramientas",
      detalle: error.message,
    });
  }
});

// Crear herramienta
router.post("/", async (req, res) => {
  try {
    const {
      nombre,
      categoria_id,
      marca,
      modelo,
      numero_serie,
      bodega_id,
      fecha_compra,
      costo_compra,
      observaciones,
    } = req.body;

    if (!nombre || !bodega_id) {
      return res.status(400).json({
        error: "Nombre y bodega son obligatorios",
      });
    }

    // Verificar que la bodega exista
    const bodegaResult = await pool.query(
      `
      SELECT id, nombre, tipo
      FROM bodegas
      WHERE id = $1
      `,
      [bodega_id]
    );

    if (bodegaResult.rows.length === 0) {
      return res.status(404).json({
        error: "Bodega no encontrada",
      });
    }

    const bodegaSeleccionada = bodegaResult.rows[0];

    // Estado inicial según tipo de bodega
    const estadoInicial =
      bodegaSeleccionada.tipo === "CENTRAL" ? "disponible" : "en_obra";

    // Validar herramienta duplicada por modelo + número de serie
    const herramientaExistente = await pool.query(
      `
      SELECT id, codigo_interno, nombre, marca, modelo, numero_serie
      FROM herramientas
      WHERE LOWER(COALESCE(modelo, '')) = LOWER(COALESCE($1, ''))
        AND LOWER(COALESCE(numero_serie, '')) = LOWER(COALESCE($2, ''))
      LIMIT 1
      `,
      [modelo || "", numero_serie || ""]
    );

    if (herramientaExistente.rows.length > 0) {
      return res.status(400).json({
        error: "Ya existe una herramienta creada con el mismo modelo y número de serie",
        detalle: `Herramienta existente: ${herramientaExistente.rows[0].codigo_interno} - ${herramientaExistente.rows[0].nombre}`,
      });
    }

    // Obtener último código interno
    const ultimoCodigo = await pool.query(`
      SELECT codigo_interno
      FROM herramientas
      WHERE codigo_interno IS NOT NULL
      ORDER BY id DESC
      LIMIT 1
    `);

    let nuevoNumero = 1;

    if (ultimoCodigo.rows.length > 0 && ultimoCodigo.rows[0].codigo_interno) {
      const match = ultimoCodigo.rows[0].codigo_interno.match(/(\d+)$/);
      if (match) {
        nuevoNumero = Number(match[1]) + 1;
      }
    }

    const codigoInterno = `EL-${String(nuevoNumero).padStart(4, "0")}`;

    // Insertar herramienta
    const result = await pool.query(
      `
      INSERT INTO herramientas (
        codigo_interno,
        nombre,
        categoria_id,
        marca,
        modelo,
        numero_serie,
        bodega_id,
        fecha_compra,
        costo_compra,
        observaciones,
        estado
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *
      `,
      [
        codigoInterno,
        nombre,
        categoria_id || null,
        marca || null,
        modelo || null,
        numero_serie || null,
        bodega_id,
        fecha_compra || null,
        costo_compra || null,
        observaciones || null,
        estadoInicial,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("ERROR POST /api/herramientas:", error.message);
    res.status(500).json({
      error: "Error al crear herramienta",
      detalle: error.message,
    });
  }
});

module.exports = router;
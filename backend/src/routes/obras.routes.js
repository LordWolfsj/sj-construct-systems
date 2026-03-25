const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar obras
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT *
      FROM obras
      ORDER BY id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/obras:", error.message);
    res.status(500).json({
      error: "Error al listar obras",
      detalle: error.message,
    });
  }
});

// Crear obra y su bodega asociada
router.post("/", async (req, res) => {
  try {
    const { nombre, direccion, encargado, fecha_inicio } = req.body;

    if (!nombre || !direccion || !encargado || !fecha_inicio) {
      return res.status(400).json({
        error: "Nombre, dirección, encargado y fecha de inicio son obligatorios",
      });
    }

    const obraResult = await pool.query(
      `
      INSERT INTO obras (nombre, direccion, encargado, fecha_inicio)
      VALUES ($1, $2, $3, $4)
      RETURNING *
      `,
      [nombre, direccion, encargado, fecha_inicio]
    );

    const obra = obraResult.rows[0];

    const nombreBodega = obra.nombre.toLowerCase().startsWith("bodega ")
      ? obra.nombre
      : `Bodega ${obra.nombre}`;

    await pool.query(
      `
      INSERT INTO bodegas (nombre, obra_id, tipo)
      VALUES ($1, $2, $3)
      `,
      [nombreBodega, obra.id, "OBRA"]
    );

    res.status(201).json(obra);
  } catch (error) {
    console.error("ERROR POST /api/obras:", error.message);
    res.status(500).json({
      error: "Error al crear obra/bodega",
      detalle: error.message,
    });
  }
});

module.exports = router;
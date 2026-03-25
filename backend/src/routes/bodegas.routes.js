const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, obra_id
      FROM bodegas
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al listar bodegas",
      detalle: error.message,
    });
  }
});

module.exports = router;
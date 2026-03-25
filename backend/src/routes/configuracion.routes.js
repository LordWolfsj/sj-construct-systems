const express = require("express");
const router = express.Router();
const pool = require("../config/database");

router.post("/reset", async (req, res) => {
  try {
    const { clave_admin } = req.body;

    if (!clave_admin) {
      return res.status(400).json({
        error: "Debes ingresar la clave de administrador",
      });
    }

    if (clave_admin !== "admin123") {
      return res.status(403).json({
        error: "Clave de administrador incorrecta",
      });
    }

    await pool.query("BEGIN");

    // 1. tablas hijas primero
    await pool.query("DELETE FROM movimientos_contenedores");
    await pool.query("DELETE FROM movimientos");
    await pool.query("DELETE FROM reparaciones");

    // 2. tablas principales relacionadas
    await pool.query("DELETE FROM contenedores");
    await pool.query("DELETE FROM herramientas");

    // 3. borrar bodegas de obra, dejando la central
    await pool.query(`
      DELETE FROM bodegas
      WHERE tipo <> 'CENTRAL'
    `);

    // 4. borrar obras
    await pool.query("DELETE FROM obras");

    // 5. opcional: reiniciar secuencias
    await pool.query("ALTER SEQUENCE movimientos_contenedores_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE movimientos_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE reparaciones_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE contenedores_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE herramientas_id_seq RESTART WITH 1");
    await pool.query("ALTER SEQUENCE obras_id_seq RESTART WITH 1");

    await pool.query("COMMIT");

    res.json({
      ok: true,
      mensaje: "Sistema reiniciado correctamente",
    });
  } catch (error) {
    await pool.query("ROLLBACK").catch(() => {});
    console.error("ERROR POST /api/configuracion/reset:", error.message);
    res.status(500).json({
      error: "Error al resetear el sistema",
      detalle: error.message,
    });
  }
});

module.exports = router;
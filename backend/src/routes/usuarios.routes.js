const express = require("express");
const router = express.Router();
const pool = require("../config/database");

// Listar usuarios
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, username, rol, activo, fecha_creacion
      FROM usuarios
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    console.error("ERROR GET /api/usuarios:", error.message);
    res.status(500).json({
      success: false,
      message: "Error al listar usuarios",
      detalle: error.message,
    });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
      return res.status(400).json({
        success: false,
        message: "Usuario y contraseña son obligatorios",
      });
    }

    const result = await pool.query(
      `
      SELECT id, nombre, username, password, rol, activo
      FROM usuarios
      WHERE username = $1 AND password = $2 AND activo = true
      `,
      [usuario, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    const user = result.rows[0];

    return res.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        username: user.username,
        rol: user.rol,
      },
    });
  } catch (error) {
    console.error("ERROR POST /api/usuarios/login:", error.message);
    return res.status(500).json({
      success: false,
      message: "Error en el servidor",
      detalle: error.message,
    });
  }
});

module.exports = router;
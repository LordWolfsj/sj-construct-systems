const pool = require("../config/database");

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Usuario y contraseña son obligatorios" });
    }

    const result = await pool.query(
      `
      SELECT id, nombre, username, rol, activo
      FROM usuarios
      WHERE username = $1
        AND password = $2
        AND activo = true
      `,
      [username, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Credenciales incorrectas" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Error al iniciar sesión",
      detalle: error.message,
    });
  }
};

const listarUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, nombre, username, rol, activo, fecha_creacion
      FROM usuarios
      ORDER BY id ASC
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al listar usuarios",
      detalle: error.message,
    });
  }
};

const crearUsuario = async (req, res) => {
  try {
    const { nombre, username, password, rol } = req.body;

    if (!nombre || !username || !password || !rol) {
      return res.status(400).json({ error: "Todos los campos son obligatorios" });
    }

    const existe = await pool.query(
      `SELECT id FROM usuarios WHERE username = $1`,
      [username]
    );

    if (existe.rows.length > 0) {
      return res.status(409).json({ error: "El nombre de usuario ya existe" });
    }

    const result = await pool.query(
      `
      INSERT INTO usuarios (nombre, username, password, rol)
      VALUES ($1, $2, $3, $4)
      RETURNING id, nombre, username, rol, activo, fecha_creacion
      `,
      [nombre, username, password, rol]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({
      error: "Error al crear usuario",
      detalle: error.message,
    });
  }
};

const toggleUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      `
      UPDATE usuarios
      SET activo = NOT activo
      WHERE id = $1
      `,
      [id]
    );

    res.json({ ok: true, mensaje: "Estado del usuario actualizado" });
  } catch (error) {
    res.status(500).json({
      error: "Error al cambiar estado del usuario",
      detalle: error.message,
    });
  }
};

module.exports = {
  login,
  listarUsuarios,
  crearUsuario,
  toggleUsuario,
};
const pool = require("../config/database");

const resetearSistema = async (req, res) => {
  try {
    const { clave_admin } = req.body;

    if (!clave_admin) {
      return res.status(400).json({ error: "Debes ingresar la clave de administrador" });
    }

    // por ahora clave fija simple
    if (clave_admin !== "admin123") {
      return res.status(403).json({ error: "Clave de administrador incorrecta" });
    }

    await pool.query("SELECT resetear_sistema()");

    res.json({ ok: true, mensaje: "Sistema reiniciado correctamente" });
  } catch (error) {
    res.status(500).json({
      error: "Error al resetear el sistema",
      detalle: error.message,
    });
  }
};

module.exports = {
  resetearSistema,
};
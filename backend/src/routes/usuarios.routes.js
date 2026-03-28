router.post("/login", async (req, res) => {
  try {
    const { usuario, password } = req.body;

    // ejemplo básico (ajústalo a tu lógica real)
    const result = await pool.query(
      "SELECT * FROM usuarios WHERE usuario = $1 AND password = $2",
      [usuario, password]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Credenciales incorrectas",
      });
    }

    return res.json({
      success: true,
      user: result.rows[0],
    });

  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
      message: "Error en el servidor",
    });
  }
});
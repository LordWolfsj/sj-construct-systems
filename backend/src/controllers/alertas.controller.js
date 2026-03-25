const alertasService = require("../services/alertas.service");

const getAlertas = async (req, res) => {
  try {
    const data = await alertasService.getAlertas();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener alertas",
      detalle: error.message,
    });
  }
};

module.exports = {
  getAlertas,
};
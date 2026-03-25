const dashboardService = require('../services/dashboard.service');

const getResumen = async (req, res) => {
  try {
    const resumen = await dashboardService.getResumenDashboard();
    res.json(resumen);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener resumen del dashboard',
      detalle: error.message
    });
  }
};

const getPorBodega = async (req, res) => {
  try {
    const data = await dashboardService.getHerramientasPorBodega();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener herramientas por bodega',
      detalle: error.message
    });
  }
};

const getPorObra = async (req, res) => {
  try {
    const data = await dashboardService.getHerramientasPorObra();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener herramientas por obra',
      detalle: error.message
    });
  }
};

const getUltimosMovimientos = async (req, res) => {
  try {
    const data = await dashboardService.getUltimosMovimientos();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: 'Error al obtener últimos movimientos',
      detalle: error.message
    });
  }
};

module.exports = {
  getResumen,
  getPorBodega,
  getPorObra,
  getUltimosMovimientos
};;
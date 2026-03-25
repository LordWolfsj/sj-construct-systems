const movimientosService = require('../services/movimientos.service');

const getMovimientos = async (req, res) => {
  try {
    const movimientos = await movimientosService.getAllMovimientos();
    res.json(movimientos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener movimientos' });
  }
};

const createMovimiento = async (req, res) => {
  try {
    const {
      herramienta_id,
      bodega_origen,
      bodega_destino,
      usuario_id,
      observacion
    } = req.body;

    if (!herramienta_id || !bodega_origen || !bodega_destino || !usuario_id) {
      return res.status(400).json({
        error: 'herramienta_id, bodega_origen, bodega_destino y usuario_id son obligatorios'
      });
    }

    const movimiento = await movimientosService.createMovimiento({
      herramienta_id,
      bodega_origen,
      bodega_destino,
      usuario_id,
      observacion
    });

    res.status(201).json({
      message: 'Movimiento registrado correctamente',
      data: movimiento
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar movimiento',
      detalle: error.message
    });
  }
};

module.exports = {
  getMovimientos,
  createMovimiento
};
const herramientasService = require('../services/herramientas.service');

const getHerramientas = async (req, res) => {
  try {
    const herramientas = await herramientasService.getAllHerramientas();
    res.json(herramientas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener herramientas' });
  }
};

const createHerramienta = async (req, res) => {
  try {
    const {
      nombre,
      categoria_id,
      marca,
      modelo,
      numero_serie,
      bodega_id,
      fecha_compra,
      costo_compra,
      observaciones
    } = req.body;

    if (!nombre || !categoria_id || !bodega_id) {
      return res.status(400).json({
        error: 'nombre, categoria_id y bodega_id son obligatorios'
      });
    }

    const nuevaHerramienta = await herramientasService.createHerramienta({
      nombre,
      categoria_id,
      marca,
      modelo,
      numero_serie,
      bodega_id,
      fecha_compra,
      costo_compra,
      observaciones
    });

    res.status(201).json({
      message: 'Herramienta creada correctamente',
      data: nuevaHerramienta
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al crear herramienta',
      detalle: error.message
    });
  }
};

module.exports = {
  getHerramientas,
  createHerramienta
};
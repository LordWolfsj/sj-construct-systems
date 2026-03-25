const obrasService = require('../services/obras.service');

const getObras = async (req, res) => {
  try {
    const obras = await obrasService.getAllObras();
    res.json(obras);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener obras' });
  }
};

const createObra = async (req, res) => {
  try {
    const { nombre, direccion, encargado, fecha_inicio } = req.body;

    if (!nombre || !direccion || !encargado || !fecha_inicio) {
      return res.status(400).json({
        error: 'Todos los campos son obligatorios'
      });
    }

    const nuevaObra = await obrasService.createObra({
      nombre,
      direccion,
      encargado,
      fecha_inicio
    });

    res.status(201).json({
      message: 'Obra creada correctamente',
      data: nuevaObra
    });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear obra' });
  }
};

module.exports = {
  getObras,
  createObra
};
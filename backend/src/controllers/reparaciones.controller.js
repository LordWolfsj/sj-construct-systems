const reparacionesService = require('../services/reparaciones.service');

const getReparaciones = async (req, res) => {
  try {
    const reparaciones = await reparacionesService.getAllReparaciones();
    res.json(reparaciones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reparaciones' });
  }
};

const createReparacion = async (req, res) => {
  try {
    const {
      herramienta_id,
      proveedor_id,
      descripcion_falla,
      fecha_envio,
      decision_final,
      observaciones
    } = req.body;

    if (!herramienta_id || !proveedor_id || !descripcion_falla || !fecha_envio) {
      return res.status(400).json({
        error: 'herramienta_id, proveedor_id, descripcion_falla y fecha_envio son obligatorios'
      });
    }

    const reparacion = await reparacionesService.createReparacion({
      herramienta_id,
      proveedor_id,
      descripcion_falla,
      fecha_envio,
      decision_final,
      observaciones
    });

    res.status(201).json({
      message: 'Reparación registrada correctamente',
      data: reparacion
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al registrar reparación',
      detalle: error.message
    });
  }
};

const cerrarReparada = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha_retorno, costo_reparacion, observaciones } = req.body;

    if (!fecha_retorno || costo_reparacion === undefined) {
      return res.status(400).json({
        error: 'fecha_retorno y costo_reparacion son obligatorios'
      });
    }

    const reparacion = await reparacionesService.cerrarComoReparada({
      reparacion_id: id,
      fecha_retorno,
      costo_reparacion,
      observaciones
    });

    res.json({
      message: 'Reparación cerrada como reparada',
      data: reparacion
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al cerrar reparación',
      detalle: error.message
    });
  }
};

const cerrarNoReparable = async (req, res) => {
  try {
    const { id } = req.params;
    const { observaciones } = req.body;

    const reparacion = await reparacionesService.cerrarComoNoReparable({
      reparacion_id: id,
      observaciones
    });

    res.json({
      message: 'Reparación cerrada como no reparable',
      data: reparacion
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error al cerrar reparación no reparable',
      detalle: error.message
    });
  }
};

module.exports = {
  getReparaciones,
  createReparacion,
  cerrarReparada,
  cerrarNoReparable
};
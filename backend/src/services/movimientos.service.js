const pool = require('../config/database');

const getAllMovimientos = async () => {
  const result = await pool.query(`
    SELECT
      m.id,
      m.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      bo.nombre AS bodega_origen,
      bd.nombre AS bodega_destino,
      u.nombre AS usuario,
      m.observacion,
      m.fecha
    FROM movimientos m
    JOIN herramientas h ON m.herramienta_id = h.id
    LEFT JOIN bodegas bo ON m.bodega_origen = bo.id
    LEFT JOIN bodegas bd ON m.bodega_destino = bd.id
    JOIN usuarios u ON m.usuario_id = u.id
    ORDER BY m.id DESC
  `);

  return result.rows;
};

const createMovimiento = async ({
  herramienta_id,
  bodega_origen,
  bodega_destino,
  usuario_id,
  observacion
}) => {
  await pool.query(
    `
    SELECT registrar_movimiento(
      $1::INTEGER,
      $2::INTEGER,
      $3::INTEGER,
      $4::INTEGER,
      $5::TEXT
    )
    `,
    [
      herramienta_id,
      bodega_origen,
      bodega_destino,
      usuario_id,
      observacion
    ]
  );

  const result = await pool.query(`
    SELECT
      m.id,
      m.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      bo.nombre AS bodega_origen,
      bd.nombre AS bodega_destino,
      u.nombre AS usuario,
      m.observacion,
      m.fecha
    FROM movimientos m
    JOIN herramientas h ON m.herramienta_id = h.id
    LEFT JOIN bodegas bo ON m.bodega_origen = bo.id
    LEFT JOIN bodegas bd ON m.bodega_destino = bd.id
    JOIN usuarios u ON m.usuario_id = u.id
    ORDER BY m.id DESC
    LIMIT 1
  `);

  return result.rows[0];
};

module.exports = {
  getAllMovimientos,
  createMovimiento
};
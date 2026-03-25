const pool = require('../config/database');

const getAllReparaciones = async () => {
  const result = await pool.query(`
    SELECT
      r.id,
      r.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      p.nombre AS proveedor,
      r.descripcion_falla,
      r.fecha_envio,
      r.fecha_retorno,
      r.costo_reparacion,
      r.estado,
      r.decision_final,
      r.observaciones
    FROM reparaciones r
    JOIN herramientas h ON r.herramienta_id = h.id
    JOIN proveedores p ON r.proveedor_id = p.id
    ORDER BY r.id DESC
  `);

  return result.rows;
};

const createReparacion = async ({
  herramienta_id,
  proveedor_id,
  descripcion_falla,
  fecha_envio,
  decision_final,
  observaciones
}) => {
  await pool.query(
    `
    SELECT registrar_reparacion(
      $1::INTEGER,
      $2::INTEGER,
      $3::TEXT,
      $4::DATE,
      $5::VARCHAR,
      $6::TEXT
    )
    `,
    [
      herramienta_id,
      proveedor_id,
      descripcion_falla,
      fecha_envio,
      decision_final,
      observaciones
    ]
  );

  const result = await pool.query(`
    SELECT
      r.id,
      r.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      p.nombre AS proveedor,
      r.descripcion_falla,
      r.fecha_envio,
      r.fecha_retorno,
      r.costo_reparacion,
      r.estado,
      r.decision_final,
      r.observaciones
    FROM reparaciones r
    JOIN herramientas h ON r.herramienta_id = h.id
    JOIN proveedores p ON r.proveedor_id = p.id
    ORDER BY r.id DESC
    LIMIT 1
  `);

  return result.rows[0];
};

const cerrarComoReparada = async ({
  reparacion_id,
  fecha_retorno,
  costo_reparacion,
  observaciones
}) => {
  await pool.query(
    `
    SELECT cerrar_reparacion_como_reparada(
      $1::INTEGER,
      $2::DATE,
      $3::NUMERIC,
      $4::TEXT
    )
    `,
    [reparacion_id, fecha_retorno, costo_reparacion, observaciones]
  );

  const result = await pool.query(`
    SELECT
      r.id,
      r.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      r.fecha_retorno,
      r.costo_reparacion,
      r.estado,
      r.observaciones
    FROM reparaciones r
    JOIN herramientas h ON r.herramienta_id = h.id
    WHERE r.id = $1
  `, [reparacion_id]);

  return result.rows[0];
};

const cerrarComoNoReparable = async ({ reparacion_id, observaciones }) => {
  await pool.query(
    `
    SELECT cerrar_reparacion_como_no_reparable(
      $1::INTEGER,
      $2::TEXT
    )
    `,
    [reparacion_id, observaciones]
  );

  const result = await pool.query(`
    SELECT
      r.id,
      r.herramienta_id,
      h.codigo_interno,
      h.nombre AS herramienta,
      r.estado,
      r.decision_final,
      r.observaciones
    FROM reparaciones r
    JOIN herramientas h ON r.herramienta_id = h.id
    WHERE r.id = $1
  `, [reparacion_id]);

  return result.rows[0];
};

module.exports = {
  getAllReparaciones,
  createReparacion,
  cerrarComoReparada,
  cerrarComoNoReparable
};
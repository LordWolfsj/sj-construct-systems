const pool = require('../config/database');

const getAllHerramientas = async () => {
  const result = await pool.query(`
    SELECT
      h.id,
      h.codigo_interno,
      h.nombre,
      h.marca,
      h.modelo,
      h.numero_serie,
      h.estado,
      h.bodega_id,
      b.nombre AS bodega,
      c.nombre AS categoria
    FROM herramientas h
    LEFT JOIN bodegas b ON h.bodega_id = b.id
    LEFT JOIN categorias c ON h.categoria_id = c.id
    ORDER BY h.id DESC
  `);

  return result.rows;
};

const createHerramienta = async ({
  nombre,
  categoria_id,
  marca,
  modelo,
  numero_serie,
  bodega_id,
  fecha_compra,
  costo_compra,
  observaciones
}) => {

  await pool.query(
    `
    SELECT registrar_herramienta(
      $1::VARCHAR,
      $2::INTEGER,
      $3::VARCHAR,
      $4::VARCHAR,
      $5::VARCHAR,
      $6::INTEGER,
      $7::DATE,
      $8::NUMERIC,
      $9::TEXT
    )
    `,
    [
      nombre,
      categoria_id,
      marca,
      modelo,
      numero_serie,
      bodega_id,
      fecha_compra,
      costo_compra,
      observaciones
    ]
  );

  const result = await pool.query(`
    SELECT *
    FROM herramientas
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};

module.exports = {
  getAllHerramientas,
  createHerramienta
};
const pool = require('../config/database');

const getAllObras = async () => {
  const result = await pool.query(`
    SELECT id, nombre, direccion, encargado, fecha_inicio
    FROM obras
    ORDER BY id DESC
  `);

  return result.rows;
};

const createObra = async ({ nombre, direccion, encargado, fecha_inicio }) => {
  await pool.query(
    `SELECT registrar_obra($1::VARCHAR, $2::TEXT, $3::VARCHAR, $4::DATE)`,
    [nombre, direccion, encargado, fecha_inicio]
  );

  const result = await pool.query(`
    SELECT id, nombre, direccion, encargado, fecha_inicio
    FROM obras
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};

module.exports = {
  getAllObras,
  createObra
};
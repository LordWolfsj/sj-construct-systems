const pool = require('../config/database');

const getResumenDashboard = async () => {
  const result = await pool.query(`
    SELECT
      COUNT(*) AS total_herramientas,
      COUNT(*) FILTER (WHERE estado = 'disponible') AS disponibles,
      COUNT(*) FILTER (WHERE estado = 'en_obra') AS en_obra,
      COUNT(*) FILTER (WHERE estado = 'en_reparacion') AS en_reparacion,
      COUNT(*) FILTER (WHERE estado = 'baja') AS baja,
      COALESCE(SUM(costo_compra), 0) AS inversion_compras,
      (
        SELECT COALESCE(SUM(costo_reparacion), 0)
        FROM reparaciones
        WHERE costo_reparacion IS NOT NULL
      ) AS gasto_reparaciones
    FROM herramientas
  `);

  return result.rows[0];
};

const getHerramientasPorBodega = async () => {
  const result = await pool.query(`
    SELECT
      b.nombre AS bodega,
      COUNT(h.id) AS cantidad
    FROM bodegas b
    LEFT JOIN herramientas h ON h.bodega_id = b.id
    GROUP BY b.nombre
    ORDER BY b.nombre
  `);

  return result.rows;
};

const getHerramientasPorObra = async () => {
  const result = await pool.query(`
    SELECT
      COALESCE(o.nombre, 'Sin Obra') AS obra,
      COUNT(h.id) AS cantidad
    FROM herramientas h
    LEFT JOIN bodegas b ON h.bodega_id = b.id
    LEFT JOIN obras o ON b.obra_id = o.id
    GROUP BY o.nombre
    ORDER BY obra
  `);

  return result.rows;
};

const getUltimosMovimientos = async () => {
  const result = await pool.query(`
    SELECT
      m.id,
      h.codigo_interno,
      h.nombre AS herramienta,
      bo.nombre AS bodega_origen,
      bd.nombre AS bodega_destino,
      m.observacion,
      m.fecha
    FROM movimientos m
    JOIN herramientas h ON m.herramienta_id = h.id
    LEFT JOIN bodegas bo ON m.bodega_origen = bo.id
    LEFT JOIN bodegas bd ON m.bodega_destino = bd.id
    ORDER BY m.fecha DESC
    LIMIT 10
  `);

  return result.rows;
};

module.exports = {
  getResumenDashboard,
  getHerramientasPorBodega,
  getHerramientasPorObra,
  getUltimosMovimientos
};
/**
 * Corrige activos cuyo traslado a Bodega quedó solo en audit_trail
 * (bug TypeORM: save() no anulaba sucursal_id con relación cargada).
 *
 * Uso: node scripts/repair-traslados-bodega.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { Client } = require('pg');

(async () => {
  const c = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'mindfit_ops',
  });
  await c.connect();

  const pendientes = await c.query(`
    SELECT DISTINCT a.id
    FROM audit_trail at
    INNER JOIN activos a ON a.id = CAST(at.row_pk AS INT)
    WHERE at.table_name = 'activos'
      AND at.new_data->>'destino' = 'Bodega Central'
      AND a.sucursal_id IS NOT NULL
      AND a.deleted_at IS NULL
  `);

  const ids = pendientes.rows.map((r) => r.id);
  if (!ids.length) {
    console.log('[repair] No hay activos pendientes de corrección.');
    await c.end();
    return;
  }

  const res = await c.query(
    `
    UPDATE activos
    SET sucursal_id = NULL,
        piso_asignado = NULL,
        codigo_qr_token = NULL,
        updated_at = NOW()
    WHERE id = ANY($1::int[])
    RETURNING id, nombre, codigo_inventario
  `,
    [ids],
  );

  console.log(`[repair] Corregidos ${res.rowCount} activo(s):`);
  for (const row of res.rows) {
    console.log(`  - #${row.id} ${row.codigo_inventario} ${row.nombre}`);
  }
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

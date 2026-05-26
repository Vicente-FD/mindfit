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

  const col = await c.query(`
    SELECT is_nullable FROM information_schema.columns
    WHERE table_name = 'activos' AND column_name = 'sucursal_id'
  `);
  const bodega = await c.query(`
    SELECT id, nombre, sucursal_id, codigo_inventario
    FROM activos WHERE deleted_at IS NULL AND sucursal_id IS NULL
  `);
  const lf = await c.query(`
    SELECT id, nombre, sucursal_id FROM activos
    WHERE deleted_at IS NULL AND nombre ILIKE '%Cinta Correr%'
  `);
  const audits = await c.query(`
    SELECT id, row_pk, old_data, new_data, time_stamp
    FROM audit_trail WHERE table_name = 'activos'
    ORDER BY time_stamp DESC LIMIT 8
  `);

  console.log('sucursal_id nullable:', col.rows[0]?.is_nullable);
  console.log('count bodega (sucursal_id IS NULL):', bodega.rows.length);
  console.log('bodega rows:', bodega.rows);
  console.log('cinta correr:', lf.rows);
  console.log('recent audits:', JSON.stringify(audits.rows, null, 2));
  await c.end();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});

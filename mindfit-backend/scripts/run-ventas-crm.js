/**
 * Ejecuta la migración ERP/CRM ventas contra PostgreSQL usando .env.
 *
 * Uso:
 *   node scripts/run-ventas-crm.js
 */
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

async function run() {
  const client = new Client({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER || process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || process.env.DB_DATABASE || 'mindfit_ops',
  });

  await client.connect();
  console.log('[ventas-crm] Conectado a PostgreSQL');

  try {
    const sqlPath = path.join(__dirname, '..', 'database', 'ventas-crm.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    await client.query(sql);
    console.log('[ventas-crm] SQL ejecutado OK');

    const checks = await client.query(`
      SELECT
        (SELECT COUNT(*)::int
         FROM information_schema.tables
         WHERE table_schema='public'
           AND table_name IN ('clientes','oportunidades','cotizaciones_ventas','cotizacion_ventas_detalles')
        ) AS tablas,
        (SELECT COUNT(*)::int
         FROM information_schema.columns
         WHERE table_name='activos'
           AND column_name IN ('apto_para_venta','precio_venta_clp')
        ) AS activos_cols,
        (SELECT COUNT(*)::int
         FROM information_schema.columns
         WHERE table_name='repuestos'
           AND column_name IN ('apto_para_venta','precio_venta_clp')
        ) AS repuestos_cols;
    `);
    console.log('[ventas-crm] Verificación:', checks.rows[0]);

    if (checks.rows[0]?.tablas !== 4) {
      console.warn('[ventas-crm] Aviso: faltan tablas esperadas');
    }
    if (checks.rows[0]?.activos_cols !== 2) {
      console.warn('[ventas-crm] Aviso: faltan columnas comerciales en activos');
    }
    if (checks.rows[0]?.repuestos_cols !== 2) {
      console.warn('[ventas-crm] Aviso: faltan columnas comerciales en repuestos');
    }
  } finally {
    await client.end();
  }
}

run().catch((e) => {
  console.error('[ventas-crm] ERROR', e?.message || e);
  process.exit(1);
});


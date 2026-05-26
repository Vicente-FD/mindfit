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
  const sql = fs.readFileSync(
    path.join(__dirname, '..', 'database', 'activos-bodega-cotizaciones-v2.sql'),
    'utf8',
  );
  await client.query(sql);
  console.log('[activos-bodega] Migración v2 OK');
  await client.end();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});

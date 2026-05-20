/**
 * Repara datos legacy ANTES de que TypeORM synchronize arranque.
 * Ejecutar: node scripts/fix-db.js
 */
const { Client } = require('pg');
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
  console.log('[fix-db] Conectado a PostgreSQL');

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS marcas (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL UNIQUE,
        sigla VARCHAR(5) NOT NULL UNIQUE
      );
    `);

    await client.query(`
      ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS sigla VARCHAR(5);
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS estado_sesion VARCHAR(20) DEFAULT 'desconectado';
      ALTER TABLE activos ADD COLUMN IF NOT EXISTS marca_id INT;
      ALTER TABLE activos ADD COLUMN IF NOT EXISTS codigo_inventario VARCHAR(32);
    `);

    await client.query(`
      ALTER TABLE activos ALTER COLUMN codigo_qr_token DROP NOT NULL;
    `).catch(() => {});

    await client.query(`
      ALTER TABLE activos ALTER COLUMN codigo_inventario DROP NOT NULL;
    `).catch(() => {});

    await client.query(`
      UPDATE activos
      SET codigo_qr_token = codigo_inventario
      WHERE (codigo_qr_token IS NULL OR codigo_qr_token = '')
        AND codigo_inventario IS NOT NULL
        AND codigo_inventario <> '';
    `);

    await client.query(`
      UPDATE activos
      SET codigo_inventario = LEFT(codigo_qr_token, 32)
      WHERE (codigo_inventario IS NULL OR codigo_inventario = '')
        AND codigo_qr_token IS NOT NULL
        AND codigo_qr_token <> '';
    `);

    await client.query(`
      UPDATE activos
      SET
        codigo_qr_token = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12)),
        codigo_inventario = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12))
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = '';
    `);

    await client.query(`
      UPDATE sucursales SET sigla = 'LF' WHERE nombre ILIKE '%La Florida%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'LC' WHERE nombre ILIKE '%Las Condes%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'VM' WHERE nombre ILIKE '%Viña del Mar%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'CC' WHERE nombre ILIKE '%Central%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'GN' WHERE sigla IS NULL OR sigla = '';
      UPDATE usuarios SET estado_sesion = 'desconectado' WHERE estado_sesion IS NULL;
    `);

    const check = await client.query(`
      SELECT COUNT(*)::int AS n FROM activos
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = '';
    `);
    const remaining = check.rows[0]?.n ?? 0;
    if (remaining > 0) {
      console.warn(`[fix-db] Aviso: ${remaining} activos aún sin codigo_qr_token`);
    } else {
      console.log('[fix-db] Activos: codigo_qr_token y codigo_inventario OK');
    }

    console.log('[fix-db] Reparación completada');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('[fix-db] Error:', err.message);
  process.exit(1);
});

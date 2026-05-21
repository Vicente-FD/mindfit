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
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS clasificacion VARCHAR(30) DEFAULT 'maquina';
    `);
    await client.query(`
      UPDATE ordenes_trabajo SET clasificacion = 'maquina' WHERE clasificacion IS NULL;
    `);
    await client.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    `);

    await client.query(`
      CREATE SEQUENCE IF NOT EXISTS ot_case_number_seq START 1;
    `);
    await client.query(`
      SELECT setval(
        'ot_case_number_seq',
        COALESCE((
          SELECT MAX((regexp_match(codigo_ot, '^OT-[0-9]+-([0-9]+)$'))[1]::int)
          FROM ordenes_trabajo
        ), 0),
        true
      );
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

    const bodegaExists = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'bodega_stock'
    `);
    if ((bodegaExists.rowCount ?? 0) > 0) {
      const hasSucursal = await client.query(`
        SELECT 1 FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'bodega_stock' AND column_name = 'sucursal_id'
      `);
      const dup = await client.query(`
        SELECT 1 FROM bodega_stock GROUP BY repuesto_id HAVING COUNT(*) > 1 LIMIT 1
      `);
      if ((hasSucursal.rowCount ?? 0) > 0 || (dup.rowCount ?? 0) > 0) {
        console.log('[fix-db] Migrando bodega_stock a inventario global...');
        await client.query(`DROP TABLE IF EXISTS tmp_bodega_global`);
        await client.query(`
          CREATE TEMP TABLE tmp_bodega_global AS
          SELECT repuesto_id,
            SUM(cantidad_actual)::int AS cantidad_actual,
            MIN(cantidad_minima_alerta)::int AS cantidad_minima_alerta
          FROM bodega_stock GROUP BY repuesto_id
        `);
        await client.query(`DELETE FROM bodega_stock`);
        await client.query(`ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS uq_sucursal_repuesto`).catch(() => {});
        await client.query(`ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS bodega_stock_sucursal_id_fkey`).catch(() => {});
        const idx = await client.query(`
          SELECT indexname FROM pg_indexes
          WHERE tablename = 'bodega_stock' AND indexdef ILIKE '%UNIQUE%'
            AND indexdef ILIKE '%repuesto_id%' AND indexname <> 'uq_bodega_repuesto'
        `);
        for (const row of idx.rows) {
          await client.query(`DROP INDEX IF EXISTS "${row.indexname}"`);
        }
        await client.query(`DROP INDEX IF EXISTS idx_bodega_sucursal`);
        if ((hasSucursal.rowCount ?? 0) > 0) {
          await client.query(`ALTER TABLE bodega_stock DROP COLUMN IF EXISTS sucursal_id`);
        }
        await client.query(`
          DO $$ BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'uq_bodega_repuesto') THEN
              ALTER TABLE bodega_stock ADD CONSTRAINT uq_bodega_repuesto UNIQUE (repuesto_id);
            END IF;
          END $$;
        `).catch(() => {});
        await client.query(`
          INSERT INTO bodega_stock (repuesto_id, cantidad_actual, cantidad_minima_alerta)
          SELECT repuesto_id, cantidad_actual, cantidad_minima_alerta FROM tmp_bodega_global
        `);
        console.log('[fix-db] Bodega central consolidada');
      }
    }

    await client.query(`
      ALTER TABLE ordenes_trabajo DROP CONSTRAINT IF EXISTS ordenes_trabajo_estado_check;
    `);
    await client.query(`
      ALTER TABLE ordenes_trabajo ADD CONSTRAINT ordenes_trabajo_estado_check
      CHECK (estado IN (
        'pendiente', 'asignada', 'en_proceso', 'finalizada', 'aprobada', 'rechazada'
      ));
    `).catch(() => {});

    console.log('[fix-db] Reparación completada');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('[fix-db] Error:', err.message);
  process.exit(1);
});

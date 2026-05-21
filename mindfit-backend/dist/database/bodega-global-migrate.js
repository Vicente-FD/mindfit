"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runBodegaGlobalPreMigrate = runBodegaGlobalPreMigrate;
const pg_1 = require("pg");
async function runBodegaGlobalPreMigrate(config) {
    const client = new pg_1.Client(config);
    await client.connect();
    try {
        const tableExists = await client.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'bodega_stock'
    `);
        if (tableExists.rowCount === 0) {
            return;
        }
        const hasSucursal = await columnExists(client, 'bodega_stock', 'sucursal_id');
        const dupCheck = await client.query(`
      SELECT repuesto_id, COUNT(*)::int AS n
      FROM bodega_stock
      GROUP BY repuesto_id
      HAVING COUNT(*) > 1
      LIMIT 1
    `);
        const hasDuplicates = (dupCheck.rowCount ?? 0) > 0;
        if (!hasSucursal && !hasDuplicates) {
            await ensureUniqueRepuesto(client);
            return;
        }
        console.log('[bodega-migrate] Consolidando stock a bodega central...');
        await client.query(`DROP TABLE IF EXISTS tmp_bodega_global`);
        await client.query(`
      CREATE TEMP TABLE tmp_bodega_global AS
      SELECT
        repuesto_id,
        SUM(cantidad_actual)::int AS cantidad_actual,
        MIN(cantidad_minima_alerta)::int AS cantidad_minima_alerta
      FROM bodega_stock
      GROUP BY repuesto_id
    `);
        await client.query(`DELETE FROM bodega_stock`);
        await client.query(`
      ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS uq_sucursal_repuesto
    `).catch(() => { });
        await client.query(`
      ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS bodega_stock_sucursal_id_fkey
    `).catch(() => { });
        await dropTypeOrmUniqueIndexesOnRepuesto(client);
        await client.query(`DROP INDEX IF EXISTS idx_bodega_sucursal`);
        if (hasSucursal) {
            await client.query(`
        ALTER TABLE bodega_stock DROP COLUMN IF EXISTS sucursal_id
      `);
        }
        await ensureUniqueRepuesto(client);
        await client.query(`
      INSERT INTO bodega_stock (repuesto_id, cantidad_actual, cantidad_minima_alerta)
      SELECT repuesto_id, cantidad_actual, cantidad_minima_alerta
      FROM tmp_bodega_global
    `);
        console.log('[bodega-migrate] Bodega central lista');
    }
    finally {
        await client.end();
    }
}
async function columnExists(client, table, column) {
    const res = await client.query(`
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
    `, [table, column]);
    return (res.rowCount ?? 0) > 0;
}
async function dropTypeOrmUniqueIndexesOnRepuesto(client) {
    const indexes = await client.query(`
    SELECT indexname FROM pg_indexes
    WHERE tablename = 'bodega_stock'
      AND indexdef ILIKE '%UNIQUE%'
      AND indexdef ILIKE '%repuesto_id%'
      AND indexname NOT IN ('uq_bodega_repuesto')
  `);
    for (const row of indexes.rows) {
        const name = row.indexname;
        await client.query(`DROP INDEX IF EXISTS "${name}"`);
    }
}
async function ensureUniqueRepuesto(client) {
    await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'uq_bodega_repuesto'
      ) THEN
        ALTER TABLE bodega_stock
        ADD CONSTRAINT uq_bodega_repuesto UNIQUE (repuesto_id);
      END IF;
    END $$;
  `).catch(() => { });
}
//# sourceMappingURL=bodega-global-migrate.js.map
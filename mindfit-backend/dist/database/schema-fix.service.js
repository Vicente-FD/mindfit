"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var SchemaFixService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchemaFixService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const ot_codigo_sequence_1 = require("../ordenes-trabajo/ot-codigo.sequence");
let SchemaFixService = SchemaFixService_1 = class SchemaFixService {
    dataSource;
    logger = new common_1.Logger(SchemaFixService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        await this.ensureOtSchema();
        await this.backfillCodigosInventario();
        await this.backfillSucursalSiglas();
        await this.backfillEstadoSesion();
    }
    async ensureOtSchema() {
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS clasificacion VARCHAR(30) DEFAULT 'maquina';
    `);
        await this.dataSource.query(`
      UPDATE ordenes_trabajo SET clasificacion = 'maquina' WHERE clasificacion IS NULL;
    `);
        await this.dataSource.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'ordenes_trabajo_clasificacion_check'
        ) THEN
          ALTER TABLE ordenes_trabajo
          ADD CONSTRAINT ordenes_trabajo_clasificacion_check
          CHECK (clasificacion IN ('maquina', 'infraestructura'));
        END IF;
      END $$;
    `).catch(() => { });
        await (0, ot_codigo_sequence_1.syncOtCaseSequence)((sql) => this.dataSource.query(sql));
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    `);
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS fecha_aprobacion TIMESTAMPTZ;
    `);
        await this.dataSource.query(`
      ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      ALTER TABLE activos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
      ALTER TABLE sucursales ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
    `);
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo
      ADD COLUMN IF NOT EXISTS costo_materiales NUMERIC(14, 2) NOT NULL DEFAULT 0;
    `);
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo DROP CONSTRAINT IF EXISTS ordenes_trabajo_estado_check;
    `);
        await this.dataSource.query(`
      ALTER TABLE ordenes_trabajo ADD CONSTRAINT ordenes_trabajo_estado_check
      CHECK (estado IN (
        'pendiente', 'asignada', 'en_proceso', 'finalizada', 'aprobada', 'rechazada'
      ));
    `).catch(() => { });
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS repuestos (
        id SERIAL PRIMARY KEY,
        sku VARCHAR(50) NOT NULL UNIQUE,
        nombre VARCHAR(150) NOT NULL,
        descripcion TEXT,
        costo_unitario NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS bodega_stock (
        id SERIAL PRIMARY KEY,
        repuesto_id INT NOT NULL REFERENCES repuestos(id) ON DELETE RESTRICT,
        cantidad_actual INT NOT NULL DEFAULT 0 CHECK (cantidad_actual >= 0),
        cantidad_minima_alerta INT NOT NULL DEFAULT 5 CHECK (cantidad_minima_alerta >= 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        CONSTRAINT uq_bodega_repuesto UNIQUE (repuesto_id)
      );
    `);
        await this.migrateBodegaToGlobal();
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS orden_trabajo_repuestos (
        id SERIAL PRIMARY KEY,
        orden_trabajo_id INT NOT NULL REFERENCES ordenes_trabajo(id) ON DELETE CASCADE,
        repuesto_id INT NOT NULL REFERENCES repuestos(id) ON DELETE RESTRICT,
        cantidad_usada INT NOT NULL CHECK (cantidad_usada > 0),
        costo_unitario_aplicado NUMERIC(12, 2) NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        await this.dataSource.query(`
      CREATE INDEX IF NOT EXISTS idx_ot_repuestos_ot ON orden_trabajo_repuestos (orden_trabajo_id);
    `);
        await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS planes_preventivos (
        id SERIAL PRIMARY KEY,
        titulo VARCHAR(200) NOT NULL,
        descripcion TEXT,
        activo_id INT NOT NULL REFERENCES activos(id) ON DELETE RESTRICT,
        intervalo_dias INT NOT NULL,
        proxima_fecha_ejecucion DATE NOT NULL,
        activo BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
        this.logger.log('Esquema OT (clasificación + secuencia) verificado');
    }
    async migrateBodegaToGlobal() {
        const tableExists = await this.dataSource.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'bodega_stock'
    `);
        if (!tableExists.length)
            return;
        const hasSucursal = await this.columnExists('bodega_stock', 'sucursal_id');
        const dupRows = await this.dataSource.query(`
      SELECT 1 FROM bodega_stock GROUP BY repuesto_id HAVING COUNT(*) > 1 LIMIT 1
    `);
        if (!hasSucursal && !dupRows.length)
            return;
        this.logger.log('Migrando bodega_stock a inventario global...');
        await this.dataSource.query(`DROP TABLE IF EXISTS tmp_bodega_global`);
        await this.dataSource.query(`
      CREATE TEMP TABLE tmp_bodega_global AS
      SELECT
        repuesto_id,
        SUM(cantidad_actual)::int AS cantidad_actual,
        MIN(cantidad_minima_alerta)::int AS cantidad_minima_alerta
      FROM bodega_stock
      GROUP BY repuesto_id;
    `);
        await this.dataSource.query(`DELETE FROM bodega_stock`);
        await this.dataSource.query(`
      ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS uq_sucursal_repuesto;
      ALTER TABLE bodega_stock DROP CONSTRAINT IF EXISTS bodega_stock_sucursal_id_fkey;
    `).catch(() => { });
        const orphanIdx = await this.dataSource.query(`
      SELECT indexname FROM pg_indexes
      WHERE tablename = 'bodega_stock'
        AND indexdef ILIKE '%UNIQUE%'
        AND indexdef ILIKE '%repuesto_id%'
        AND indexname NOT IN ('uq_bodega_repuesto')
    `);
        for (const row of orphanIdx) {
            await this.dataSource
                .query(`DROP INDEX IF EXISTS "${row.indexname}"`)
                .catch(() => { });
        }
        await this.dataSource.query(`
      DROP INDEX IF EXISTS idx_bodega_sucursal;
    `);
        if (hasSucursal) {
            await this.dataSource.query(`
        ALTER TABLE bodega_stock DROP COLUMN IF EXISTS sucursal_id;
      `);
        }
        await this.dataSource.query(`
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
        await this.dataSource.query(`
      INSERT INTO bodega_stock (repuesto_id, cantidad_actual, cantidad_minima_alerta)
      SELECT repuesto_id, cantidad_actual, cantidad_minima_alerta
      FROM tmp_bodega_global;
    `);
        this.logger.log('Bodega central global lista');
    }
    async backfillCodigosInventario() {
        const hasQr = await this.columnExists('activos', 'codigo_qr_token');
        if (!hasQr)
            return;
        await this.dataSource.query(`
      UPDATE activos
      SET codigo_qr_token = codigo_inventario
      WHERE (codigo_qr_token IS NULL OR codigo_qr_token = '')
        AND codigo_inventario IS NOT NULL
        AND codigo_inventario <> ''
    `);
        await this.dataSource.query(`
      UPDATE activos
      SET codigo_inventario = LEFT(codigo_qr_token, 32)
      WHERE (codigo_inventario IS NULL OR codigo_inventario = '')
        AND codigo_qr_token IS NOT NULL
        AND codigo_qr_token <> ''
    `);
        await this.dataSource.query(`
      UPDATE activos
      SET
        codigo_qr_token = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12)),
        codigo_inventario = UPPER(SUBSTRING(REPLACE(uuid_activo::text, '-', '') FROM 1 FOR 12))
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = ''
    `);
        const remaining = await this.dataSource.query(`
      SELECT COUNT(*)::int AS n FROM activos
      WHERE codigo_qr_token IS NULL OR codigo_qr_token = ''
    `);
        if (remaining[0]?.n > 0) {
            this.logger.warn(`Quedan ${remaining[0].n} activos sin código QR; revise manualmente`);
        }
        else {
            this.logger.log('Códigos de activos (QR + inventario) backfill completado');
        }
    }
    async backfillSucursalSiglas() {
        const hasColumn = await this.columnExists('sucursales', 'sigla');
        if (!hasColumn)
            return;
        await this.dataSource.query(`
      UPDATE sucursales SET sigla = 'LF' WHERE nombre ILIKE '%La Florida%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'LC' WHERE nombre ILIKE '%Las Condes%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'VM' WHERE nombre ILIKE '%Viña del Mar%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'CC' WHERE nombre ILIKE '%Central%' AND (sigla IS NULL OR sigla = '');
      UPDATE sucursales SET sigla = 'GN' WHERE sigla IS NULL OR sigla = '';
    `);
    }
    async backfillEstadoSesion() {
        const hasColumn = await this.columnExists('usuarios', 'estado_sesion');
        if (!hasColumn)
            return;
        await this.dataSource.query(`
      UPDATE usuarios SET estado_sesion = 'desconectado' WHERE estado_sesion IS NULL;
    `);
    }
    async columnExists(table, column) {
        const rows = await this.dataSource.query(`
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2
      `, [table, column]);
        return rows.length > 0;
    }
};
exports.SchemaFixService = SchemaFixService;
exports.SchemaFixService = SchemaFixService = SchemaFixService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], SchemaFixService);
//# sourceMappingURL=schema-fix.service.js.map
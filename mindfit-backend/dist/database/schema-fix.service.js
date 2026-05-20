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
let SchemaFixService = SchemaFixService_1 = class SchemaFixService {
    dataSource;
    logger = new common_1.Logger(SchemaFixService_1.name);
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async onModuleInit() {
        await this.backfillCodigosInventario();
        await this.backfillSucursalSiglas();
        await this.backfillEstadoSesion();
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
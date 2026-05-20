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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CodigoInventarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const activo_entity_1 = require("../entities/activo.entity");
const marca_entity_1 = require("../entities/marca.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const CATEGORIA_CODIGO = {
    [enums_1.CategoriaActivo.CARDIO]: '01',
    [enums_1.CategoriaActivo.FUERZA]: '02',
    [enums_1.CategoriaActivo.CLIMATIZACION]: '03',
    [enums_1.CategoriaActivo.INFRAESTRUCTURA]: '04',
    [enums_1.CategoriaActivo.BOMBA_AGUA]: '05',
};
let CodigoInventarioService = class CodigoInventarioService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async generarCodigo(manager, sucursalId, marcaId, categoria, fechaCompra) {
        const sucursal = await manager.findOne(sucursal_entity_1.Sucursal, {
            where: { id: sucursalId },
        });
        if (!sucursal?.sigla) {
            throw new common_1.BadRequestException('La sucursal no tiene sigla configurada');
        }
        const marca = await manager.findOne(marca_entity_1.Marca, { where: { id: marcaId } });
        if (!marca?.sigla) {
            throw new common_1.BadRequestException('La marca no tiene sigla configurada');
        }
        const year = this.resolveYear(fechaCompra);
        const catCode = CATEGORIA_CODIGO[categoria];
        const prefix = `${sucursal.sigla}-${marca.sigla}-${year}-${catCode}-`;
        const rows = await manager
            .createQueryBuilder(activo_entity_1.Activo, 'a')
            .select('a.codigoInventario', 'codigo')
            .where('a.codigoInventario LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('a.codigoInventario', 'DESC')
            .setLock('pessimistic_write')
            .limit(1)
            .getRawMany();
        let correlativo = 1;
        if (rows.length > 0 && rows[0].codigo) {
            const parts = rows[0].codigo.split('-');
            const last = parseInt(parts[parts.length - 1], 10);
            if (!Number.isNaN(last)) {
                correlativo = last + 1;
            }
        }
        if (correlativo > 99) {
            throw new common_1.BadRequestException('Límite de correlativo alcanzado para esta combinación');
        }
        return `${prefix}${String(correlativo).padStart(2, '0')}`;
    }
    resolveYear(fechaCompra) {
        if (fechaCompra) {
            const d = new Date(fechaCompra);
            if (!Number.isNaN(d.getTime())) {
                return String(d.getFullYear()).slice(-2);
            }
        }
        return String(new Date().getFullYear()).slice(-2);
    }
};
exports.CodigoInventarioService = CodigoInventarioService;
exports.CodigoInventarioService = CodigoInventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], CodigoInventarioService);
//# sourceMappingURL=codigo-inventario.service.js.map
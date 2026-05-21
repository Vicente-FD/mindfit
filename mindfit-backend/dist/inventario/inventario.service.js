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
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const repuesto_entity_1 = require("../entities/repuesto.entity");
const bodega_stock_entity_1 = require("../entities/bodega-stock.entity");
const orden_trabajo_repuesto_entity_1 = require("../entities/orden-trabajo-repuesto.entity");
let InventarioService = class InventarioService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    findAllRepuestos() {
        return this.dataSource.getRepository(repuesto_entity_1.Repuesto).find({
            order: { nombre: 'ASC' },
        });
    }
    async findRepuesto(id) {
        const r = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).findOne({
            where: { id },
        });
        if (!r)
            throw new common_1.NotFoundException(`Repuesto ${id} no encontrado`);
        return r;
    }
    async createRepuesto(dto) {
        const exists = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).findOne({
            where: { sku: dto.sku.trim() },
        });
        if (exists) {
            throw new common_1.ConflictException(`SKU ${dto.sku} ya existe`);
        }
        const repuesto = this.dataSource.getRepository(repuesto_entity_1.Repuesto).create({
            sku: dto.sku.trim(),
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            costoUnitario: String(dto.costoUnitario),
        });
        const saved = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).save(repuesto);
        await this.asegurarStock(saved.id);
        return saved;
    }
    async updateRepuesto(id, dto) {
        const repuesto = await this.findRepuesto(id);
        if (dto.sku != null)
            repuesto.sku = dto.sku.trim();
        if (dto.nombre != null)
            repuesto.nombre = dto.nombre.trim();
        if (dto.descripcion !== undefined) {
            repuesto.descripcion = dto.descripcion?.trim() ?? null;
        }
        if (dto.costoUnitario != null) {
            repuesto.costoUnitario = String(dto.costoUnitario);
        }
        return this.dataSource.getRepository(repuesto_entity_1.Repuesto).save(repuesto);
    }
    findStock(filters = {}) {
        const qb = this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .leftJoinAndSelect('bs.repuesto', 'repuesto')
            .orderBy('repuesto.nombre', 'ASC');
        if (filters.busqueda?.trim()) {
            const q = `%${filters.busqueda.trim().toLowerCase()}%`;
            qb.andWhere(`(LOWER(repuesto.sku) LIKE :q OR LOWER(repuesto.nombre) LIKE :q)`, { q });
        }
        return qb.getMany();
    }
    async getKpis() {
        const rows = await this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .leftJoin('bs.repuesto', 'repuesto')
            .select([
            'COUNT(DISTINCT repuesto.id)::int AS total_sku',
            'COALESCE(SUM(bs.cantidad_actual * repuesto.costo_unitario), 0)::numeric AS valorizacion',
            `SUM(CASE WHEN bs.cantidad_actual <= bs.cantidad_minima_alerta THEN 1 ELSE 0 END)::int AS alertas_reorden`,
        ])
            .getRawOne();
        return {
            totalSku: rows?.total_sku ?? 0,
            valorizacionInventario: Number(rows?.valorizacion ?? 0),
            alertasReorden: rows?.alertas_reorden ?? 0,
        };
    }
    listRepuestosDisponibles() {
        return this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .innerJoinAndSelect('bs.repuesto', 'repuesto')
            .where('bs.cantidad_actual > 0')
            .orderBy('repuesto.nombre', 'ASC')
            .getMany()
            .then((rows) => rows.map((bs) => ({
            repuestoId: bs.repuestoId,
            stockId: bs.id,
            sku: bs.repuesto.sku,
            nombre: bs.repuesto.nombre,
            costoUnitario: Number(bs.repuesto.costoUnitario),
            cantidadActual: bs.cantidadActual,
            cantidadMinimaAlerta: bs.cantidadMinimaAlerta,
        })));
    }
    async asegurarStock(repuestoId) {
        await this.findRepuesto(repuestoId);
        let stock = await this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).findOne({
            where: { repuestoId },
        });
        if (!stock) {
            stock = this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).create({
                repuestoId,
                cantidadActual: 0,
                cantidadMinimaAlerta: 5,
            });
            stock = await this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).save(stock);
        }
        return stock;
    }
    async ajustarStock(stockId, cantidadActual) {
        const stock = await this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).findOne({
            where: { id: stockId },
            relations: { repuesto: true },
        });
        if (!stock)
            throw new common_1.NotFoundException('Registro de stock no encontrado');
        stock.cantidadActual = cantidadActual;
        return this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).save(stock);
    }
    async registrarIngreso(stockId, cantidad) {
        const stock = await this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).findOne({
            where: { id: stockId },
            relations: { repuesto: true },
        });
        if (!stock)
            throw new common_1.NotFoundException('Registro de stock no encontrado');
        stock.cantidadActual += cantidad;
        return this.dataSource.getRepository(bodega_stock_entity_1.BodegaStock).save(stock);
    }
    async procesarConsumoEnTransaccion(manager, ordenTrabajoId, items) {
        if (!items.length)
            return 0;
        let costoTotal = 0;
        for (const item of items) {
            const stock = await manager
                .getRepository(bodega_stock_entity_1.BodegaStock)
                .createQueryBuilder('bs')
                .setLock('pessimistic_write')
                .innerJoinAndSelect('bs.repuesto', 'repuesto')
                .where('bs.repuesto_id = :repuestoId', { repuestoId: item.repuestoId })
                .getOne();
            if (!stock) {
                throw new common_1.BadRequestException(`Repuesto #${item.repuestoId} no está registrado en la bodega central`);
            }
            if (stock.cantidadActual < item.cantidad) {
                throw new common_1.BadRequestException(`Stock insuficiente de «${stock.repuesto.nombre}» (SKU ${stock.repuesto.sku}). Disponible: ${stock.cantidadActual}, solicitado: ${item.cantidad}`);
            }
            const costoUnitario = Number(stock.repuesto.costoUnitario);
            costoTotal += item.cantidad * costoUnitario;
            stock.cantidadActual -= item.cantidad;
            await manager.getRepository(bodega_stock_entity_1.BodegaStock).save(stock);
            const consumo = manager.getRepository(orden_trabajo_repuesto_entity_1.OrdenTrabajoRepuesto).create({
                ordenTrabajoId,
                repuestoId: item.repuestoId,
                cantidadUsada: item.cantidad,
                costoUnitarioAplicado: String(costoUnitario),
            });
            await manager.getRepository(orden_trabajo_repuesto_entity_1.OrdenTrabajoRepuesto).save(consumo);
        }
        return Math.round(costoTotal * 100) / 100;
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map
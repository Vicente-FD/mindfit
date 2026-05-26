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
const enums_1 = require("../common/enums");
const movimiento_inventario_entity_1 = require("../entities/movimiento-inventario.entity");
const repuesto_entity_1 = require("../entities/repuesto.entity");
const bodega_stock_entity_1 = require("../entities/bodega-stock.entity");
const orden_trabajo_repuesto_entity_1 = require("../entities/orden-trabajo-repuesto.entity");
const activo_entity_1 = require("../entities/activo.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
let InventarioService = class InventarioService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    findAllRepuestos() {
        return this.dataSource.getRepository(repuesto_entity_1.Repuesto).find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            order: { nombre: 'ASC' },
        });
    }
    async findRepuesto(id) {
        const r = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).findOne({
            where: { id, deletedAt: (0, typeorm_1.IsNull)() },
        });
        if (!r)
            throw new common_1.NotFoundException(`Repuesto ${id} no encontrado`);
        return r;
    }
    async createRepuesto(dto) {
        const exists = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).findOne({
            where: { sku: dto.sku.trim() },
        });
        if (exists && !exists.deletedAt) {
            throw new common_1.ConflictException(`SKU ${dto.sku} ya existe`);
        }
        const repuesto = this.dataSource.getRepository(repuesto_entity_1.Repuesto).create({
            sku: dto.sku.trim(),
            nombre: dto.nombre.trim(),
            descripcion: dto.descripcion?.trim() ?? null,
            costoUnitario: String(dto.costoUnitario),
            aptoParaVenta: dto.aptoParaVenta ?? false,
            precioVentaClp: String(dto.precioVentaClp ?? 0),
        });
        const saved = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).save(repuesto);
        await this.asegurarStock(saved.id);
        return saved;
    }
    async updateRepuesto(id, dto) {
        const repuesto = await this.findRepuesto(id);
        if (dto.sku != null) {
            const sku = dto.sku.trim();
            const dup = await this.dataSource.getRepository(repuesto_entity_1.Repuesto).findOne({
                where: { sku },
            });
            if (dup && dup.id !== id && !dup.deletedAt) {
                throw new common_1.ConflictException(`SKU ${sku} ya está en uso`);
            }
            repuesto.sku = sku;
        }
        if (dto.nombre != null)
            repuesto.nombre = dto.nombre.trim();
        if (dto.descripcion !== undefined) {
            repuesto.descripcion = dto.descripcion?.trim() ?? null;
        }
        if (dto.costoUnitario != null) {
            repuesto.costoUnitario = String(dto.costoUnitario);
        }
        if (dto.aptoParaVenta != null) {
            repuesto.aptoParaVenta = dto.aptoParaVenta;
        }
        if (dto.precioVentaClp != null) {
            repuesto.precioVentaClp = String(dto.precioVentaClp);
        }
        return this.dataSource.getRepository(repuesto_entity_1.Repuesto).save(repuesto);
    }
    async softDeleteRepuesto(id) {
        await this.findRepuesto(id);
        await this.dataSource.getRepository(repuesto_entity_1.Repuesto).softDelete(id);
        return { deleted: true };
    }
    findStock(filters = {}) {
        const qb = this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .innerJoinAndSelect('bs.repuesto', 'repuesto')
            .where('repuesto.deleted_at IS NULL')
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
            .innerJoin('bs.repuesto', 'repuesto')
            .where('repuesto.deleted_at IS NULL')
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
    async updateMaquinaVentaComercial(activoId, aptoParaVenta, precioVentaClp) {
        const repo = this.dataSource.getRepository(activo_entity_1.Activo);
        const activo = await repo.findOne({
            where: { id: activoId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: { categoriaRelacion: true },
        });
        if (!activo) {
            throw new common_1.NotFoundException(`Máquina ${activoId} no encontrada`);
        }
        if (activo.sucursalId != null) {
            throw new common_1.BadRequestException('Solo se puede habilitar venta de máquinas en Bodega Central');
        }
        if (activo.estadoOperacional === 'reservado_venta') {
            throw new common_1.BadRequestException('No se puede modificar: máquina reservada en cotización pendiente');
        }
        if (activo.estadoOperacional === 'vendido') {
            throw new common_1.BadRequestException('No se puede modificar: máquina vendida');
        }
        const patch = { aptoParaVenta };
        if (precioVentaClp != null) {
            patch.precioVentaClp = String(precioVentaClp);
        }
        await repo.update(activoId, patch);
        const saved = await repo.findOne({
            where: { id: activoId },
            relations: { categoriaRelacion: true },
        });
        if (!saved) {
            throw new common_1.NotFoundException(`Máquina ${activoId} no encontrada`);
        }
        return {
            id: saved.id,
            codigoInventario: saved.codigoInventario ?? `ACT-${saved.id}`,
            nombre: saved.nombre,
            marca: saved.marca ?? '—',
            modelo: saved.modelo,
            categoria: saved.categoriaRelacion?.nombre ?? saved.categoria ?? 'Equipo',
            estadoOperacional: saved.estadoOperacional,
            aptoParaVenta: saved.aptoParaVenta,
            precioVentaClp: Number(saved.precioVentaClp ?? 0),
        };
    }
    async listMaquinasBodega(busqueda) {
        const q = busqueda?.trim().toLowerCase();
        const qb = this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.categoriaRelacion', 'cat')
            .where('a.deleted_at IS NULL')
            .andWhere('a.sucursal_id IS NULL');
        if (q) {
            qb.andWhere(`(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.marca) LIKE :q)`, { q: `%${q}%` });
        }
        const rows = await qb.orderBy('a.nombre', 'ASC').take(200).getMany();
        return rows.map((a) => ({
            id: a.id,
            codigoInventario: a.codigoInventario ?? `ACT-${a.id}`,
            nombre: a.nombre,
            marca: a.marca ?? '—',
            modelo: a.modelo,
            categoria: a.categoriaRelacion?.nombre ?? a.categoria ?? 'Equipo',
            estadoOperacional: a.estadoOperacional,
            aptoParaVenta: a.aptoParaVenta,
            precioVentaClp: Number(a.precioVentaClp ?? 0),
        }));
    }
    listRepuestosDisponibles() {
        return this.dataSource
            .getRepository(bodega_stock_entity_1.BodegaStock)
            .createQueryBuilder('bs')
            .innerJoinAndSelect('bs.repuesto', 'repuesto')
            .where('bs.cantidad_actual > 0')
            .andWhere('repuesto.deleted_at IS NULL')
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
    async registrarAjuste(dto, usuarioId) {
        const tiposEntrada = [
            enums_1.TipoMovimientoInventario.INGRESO_COMPRA,
            enums_1.TipoMovimientoInventario.AJUSTE_MANUAL_POSITIVO,
        ];
        const tiposSalida = [
            enums_1.TipoMovimientoInventario.AJUSTE_MANUAL_NEGATIVO,
        ];
        if (!tiposEntrada.includes(dto.tipoMovimiento) &&
            !tiposSalida.includes(dto.tipoMovimiento)) {
            throw new common_1.BadRequestException('tipo_movimiento no válido para ajuste manual de bodega');
        }
        const sucursal = await this.dataSource.getRepository(sucursal_entity_1.Sucursal).findOne({
            where: { id: dto.sucursalId, deletedAt: (0, typeorm_1.IsNull)() },
        });
        if (!sucursal) {
            throw new common_1.NotFoundException(`Sucursal ${dto.sucursalId} no encontrada`);
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const stock = await manager
                .getRepository(bodega_stock_entity_1.BodegaStock)
                .createQueryBuilder('bs')
                .setLock('pessimistic_write')
                .innerJoinAndSelect('bs.repuesto', 'repuesto')
                .where('bs.repuesto_id = :repuestoId', { repuestoId: dto.repuestoId })
                .andWhere('repuesto.deleted_at IS NULL')
                .getOne();
            if (!stock) {
                throw new common_1.NotFoundException('Repuesto sin fila de stock en bodega central');
            }
            const costoUnitario = Number(stock.repuesto.costoUnitario);
            const motivo = dto.motivo.trim();
            if (tiposEntrada.includes(dto.tipoMovimiento)) {
                stock.cantidadActual += dto.cantidad;
            }
            else {
                if (stock.cantidadActual < dto.cantidad) {
                    throw new common_1.BadRequestException(`Stock insuficiente. Disponible: ${stock.cantidadActual}, solicitado: ${dto.cantidad}`);
                }
                stock.cantidadActual -= dto.cantidad;
            }
            await manager.getRepository(bodega_stock_entity_1.BodegaStock).save(stock);
            await this.insertarMovimiento(manager, {
                sucursalId: dto.sucursalId,
                repuestoId: dto.repuestoId,
                usuarioId,
                tipoMovimiento: dto.tipoMovimiento,
                cantidad: dto.cantidad,
                costoUnitarioMomento: costoUnitario,
                ordenTrabajoId: null,
                motivo,
            });
            await queryRunner.commitTransaction();
            return this.asegurarStock(dto.repuestoId);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
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
    async getTrazabilidad(repuestoId, sucursalId) {
        await this.findRepuesto(repuestoId);
        const qb = this.dataSource
            .getRepository(movimiento_inventario_entity_1.MovimientoInventario)
            .createQueryBuilder('m')
            .leftJoinAndSelect('m.sucursal', 'sucursal')
            .leftJoinAndSelect('m.usuario', 'usuario')
            .leftJoinAndSelect('m.ordenTrabajo', 'ot')
            .leftJoinAndSelect('ot.activo', 'activo')
            .where('m.repuesto_id = :repuestoId', { repuestoId })
            .orderBy('m.created_at', 'DESC');
        if (sucursalId != null) {
            qb.andWhere('m.sucursal_id = :sucursalId', { sucursalId });
        }
        const rows = await qb.getMany();
        return rows.map((m) => ({
            id: m.id,
            tipoMovimiento: m.tipoMovimiento,
            cantidad: m.cantidad,
            costoUnitarioMomento: Number(m.costoUnitarioMomento),
            motivo: m.motivo,
            createdAt: m.createdAt,
            sucursalId: m.sucursalId,
            sucursalNombre: m.sucursal?.nombre ?? `Sede #${m.sucursalId}`,
            sucursalSigla: m.sucursal?.sigla ?? '—',
            usuarioNombre: m.usuario?.nombre ?? 'Usuario',
            ordenTrabajoId: m.ordenTrabajoId,
            codigoOt: m.ordenTrabajo?.codigoOt ?? null,
            ordenTitulo: m.ordenTrabajo?.titulo ?? null,
            activoNombre: m.ordenTrabajo?.activo?.nombre ?? null,
            esEntrada: this.esMovimientoEntrada(m.tipoMovimiento),
        }));
    }
    async procesarConsumoEnTransaccion(manager, ordenTrabajoId, sucursalId, usuarioId, codigoOt, items) {
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
                .andWhere('repuesto.deleted_at IS NULL')
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
            await this.insertarMovimiento(manager, {
                sucursalId,
                repuestoId: item.repuestoId,
                usuarioId,
                tipoMovimiento: enums_1.TipoMovimientoInventario.CONSUMO_OT,
                cantidad: item.cantidad,
                costoUnitarioMomento: costoUnitario,
                ordenTrabajoId,
                motivo: `Consumo por reparación ${codigoOt}`,
            });
        }
        return Math.round(costoTotal * 100) / 100;
    }
    async insertarMovimiento(manager, data) {
        const mov = manager.getRepository(movimiento_inventario_entity_1.MovimientoInventario).create({
            sucursalId: data.sucursalId,
            repuestoId: data.repuestoId,
            usuarioId: data.usuarioId,
            tipoMovimiento: data.tipoMovimiento,
            cantidad: data.cantidad,
            costoUnitarioMomento: String(data.costoUnitarioMomento),
            ordenTrabajoId: data.ordenTrabajoId,
            motivo: data.motivo,
        });
        await manager.getRepository(movimiento_inventario_entity_1.MovimientoInventario).save(mov);
    }
    esMovimientoEntrada(tipo) {
        return (tipo === enums_1.TipoMovimientoInventario.INGRESO_COMPRA ||
            tipo === enums_1.TipoMovimientoInventario.AJUSTE_MANUAL_POSITIVO);
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map
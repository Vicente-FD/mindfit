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
exports.CotizacionesVentasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const activo_entity_1 = require("../entities/activo.entity");
const categoria_entity_1 = require("../entities/categoria.entity");
const cotizacion_venta_entity_1 = require("../entities/cotizacion-venta.entity");
const cotizacion_ventas_detalle_entity_1 = require("../entities/cotizacion-ventas-detalle.entity");
const oportunidad_entity_1 = require("../entities/oportunidad.entity");
const clientes_service_1 = require("../clientes/clientes.service");
const divisas_service_1 = require("../divisas/divisas.service");
let CotizacionesVentasService = class CotizacionesVentasService {
    dataSource;
    clientesService;
    divisasService;
    constructor(dataSource, clientesService, divisasService) {
        this.dataSource = dataSource;
        this.clientesService = clientesService;
        this.divisasService = divisasService;
    }
    repo() {
        return this.dataSource.getRepository(cotizacion_venta_entity_1.CotizacionVenta);
    }
    findAll() {
        return this.repo().find({
            relations: {
                cliente: true,
                creadoPor: true,
                oportunidad: true,
                detalles: true,
            },
            order: { createdAt: 'DESC' },
        });
    }
    async findOne(id) {
        const c = await this.repo().findOne({
            where: { id },
            relations: {
                cliente: true,
                creadoPor: true,
                oportunidad: { cliente: true },
                detalles: { activo: true },
            },
        });
        if (!c) {
            throw new common_1.NotFoundException(`Cotización ${id} no encontrada`);
        }
        return c;
    }
    async create(dto, creadoPorId) {
        if (!dto.detalles?.length) {
            throw new common_1.BadRequestException('Debe incluir al menos una máquina');
        }
        for (const item of dto.detalles) {
            if (item.repuestoId != null) {
                throw new common_1.BadRequestException('Las cotizaciones comerciales solo admiten máquinas de Bodega Central');
            }
            if (item.activoId == null) {
                throw new common_1.BadRequestException('Cada línea debe referenciar un activo');
            }
        }
        await this.clientesService.findOne(dto.clienteId);
        const tasas = await this.divisasService.getTasas();
        const tasaCambio = dto.tasaCambioClp ??
            this.divisasService.tasaParaDivisa(tasas, dto.divisaCodigo);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const folio = await this.generarFolio(manager);
            const lineas = await this.procesarDetallesActivos(manager, dto.detalles);
            const subtotal = dto.subtotalNeto ??
                lineas.reduce((s, l) => s + Number(l.totalLineaNeto), 0);
            const montoIva = dto.montoIva ??
                (dto.divisaCodigo === enums_1.DivisaCodigo.CLP
                    ? Math.round(subtotal * 0.19 * 100) / 100
                    : 0);
            const montoBruto = dto.montoBruto ?? subtotal + montoIva;
            const cotizacion = manager.getRepository(cotizacion_venta_entity_1.CotizacionVenta).create({
                folio,
                clienteId: dto.clienteId,
                creadoPorId,
                oportunidadId: dto.oportunidadId ?? null,
                divisaCodigo: dto.divisaCodigo,
                tasaCambioClp: String(tasaCambio),
                subtotalNeto: String(Math.round(subtotal * 100) / 100),
                montoIva: String(Math.round(montoIva * 100) / 100),
                montoBruto: String(Math.round(montoBruto * 100) / 100),
                comentariosComerciales: dto.comentariosComerciales?.trim() ?? null,
                estado: enums_1.EstadoCotizacionVenta.PENDIENTE_APROBACION,
                detalles: lineas,
            });
            const saved = await manager.getRepository(cotizacion_venta_entity_1.CotizacionVenta).save(cotizacion);
            await queryRunner.commitTransaction();
            return this.findOne(saved.id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async actualizarEstado(id, dto) {
        const cotizacion = await this.findOne(id);
        if (cotizacion.estado !== enums_1.EstadoCotizacionVenta.PENDIENTE_APROBACION) {
            throw new common_1.BadRequestException('Solo se pueden aprobar o rechazar cotizaciones pendientes de aprobación');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const activoRepo = manager.getRepository(activo_entity_1.Activo);
            if (dto.estado === enums_1.EstadoCotizacionVenta.APROBADA) {
                for (const linea of cotizacion.detalles) {
                    if (!linea.activoId)
                        continue;
                    const activo = await activoRepo.findOne({
                        where: { id: linea.activoId, deletedAt: (0, typeorm_1.IsNull)() },
                    });
                    if (!activo)
                        continue;
                    activo.estadoOperacional = enums_1.EstadoOperacionalActivo.VENDIDO;
                    activo.aptoParaVenta = false;
                    await activoRepo.save(activo);
                    await activoRepo.softDelete(activo.id);
                }
                if (cotizacion.oportunidadId != null) {
                    await manager.getRepository(oportunidad_entity_1.Oportunidad).update(cotizacion.oportunidadId, { etapa: enums_1.EtapaOportunidad.GANADA });
                }
            }
            else {
                for (const linea of cotizacion.detalles) {
                    if (!linea.activoId)
                        continue;
                    const activo = await activoRepo.findOne({
                        where: { id: linea.activoId, deletedAt: (0, typeorm_1.IsNull)() },
                    });
                    if (!activo)
                        continue;
                    if (activo.sucursalId != null) {
                        throw new common_1.BadRequestException(`El activo ${activo.id} ya no está en Bodega Central`);
                    }
                    activo.estadoOperacional = enums_1.EstadoOperacionalActivo.OPERATIVO;
                    await activoRepo.save(activo);
                }
            }
            await manager.getRepository(cotizacion_venta_entity_1.CotizacionVenta).update(id, {
                estado: dto.estado,
            });
            await queryRunner.commitTransaction();
            return this.findOne(id);
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async generarFolio(manager) {
        const year = new Date().getFullYear();
        const prefix = `COT-${year}-`;
        const last = await manager
            .getRepository(cotizacion_venta_entity_1.CotizacionVenta)
            .createQueryBuilder('c')
            .where('c.folio LIKE :prefix', { prefix: `${prefix}%` })
            .orderBy('c.id', 'DESC')
            .getOne();
        let seq = 1;
        if (last?.folio) {
            const n = parseInt(last.folio.replace(prefix, ''), 10);
            if (Number.isFinite(n))
                seq = n + 1;
        }
        return `${prefix}${String(seq).padStart(4, '0')}`;
    }
    async procesarDetallesActivos(manager, items) {
        const lineas = [];
        const vistos = new Set();
        for (const item of items) {
            const activoId = item.activoId;
            if (vistos.has(activoId)) {
                throw new common_1.BadRequestException(`La máquina ${activoId} está duplicada en la cotización`);
            }
            vistos.add(activoId);
            lineas.push(await this.procesarLineaActivo(manager, item, activoId));
        }
        return lineas;
    }
    async procesarLineaActivo(manager, item, activoId) {
        const activo = await manager.getRepository(activo_entity_1.Activo).findOne({
            where: { id: activoId, deletedAt: (0, typeorm_1.IsNull)() },
            lock: { mode: 'pessimistic_write' },
        });
        if (!activo) {
            throw new common_1.BadRequestException(`Máquina ${activoId} no disponible`);
        }
        let categoriaNombre = activo.categoria ?? 'Equipo';
        if (activo.categoriaId != null) {
            const cat = await manager.getRepository(categoria_entity_1.Categoria).findOne({
                where: { id: activo.categoriaId },
            });
            if (cat?.nombre) {
                categoriaNombre = cat.nombre;
            }
        }
        if (activo.sucursalId != null) {
            throw new common_1.BadRequestException(`«${activo.nombre}» no está en Bodega Central`);
        }
        if (!activo.aptoParaVenta) {
            throw new common_1.BadRequestException(`«${activo.nombre}» no está habilitada para venta`);
        }
        if (activo.estadoOperacional === enums_1.EstadoOperacionalActivo.RESERVADO_VENTA) {
            throw new common_1.BadRequestException(`«${activo.nombre}» ya está reservada en otra cotización`);
        }
        if (item.cantidad !== 1) {
            throw new common_1.BadRequestException('Cada máquina se cotiza en cantidad 1 (unidad física única)');
        }
        const sku = activo.codigoInventario?.trim() ||
            activo.codigoQrToken?.trim() ||
            `ACT-${activo.id}`;
        const costoHistorico = Number(activo.costoAdquisicion ?? 0);
        const totalLinea = item.totalLineaNeto ??
            item.cantidad * item.precioUnitarioPactado;
        activo.estadoOperacional = enums_1.EstadoOperacionalActivo.RESERVADO_VENTA;
        await manager.getRepository(activo_entity_1.Activo).save(activo);
        return manager.getRepository(cotizacion_ventas_detalle_entity_1.CotizacionVentasDetalle).create({
            activoId,
            repuestoId: null,
            skuEstatico: sku,
            nombreEstatico: activo.nombre,
            categoriaEstatica: categoriaNombre,
            cantidad: item.cantidad,
            precioUnitarioPactado: String(item.precioUnitarioPactado),
            totalLineaNeto: String(Math.round(totalLinea * 100) / 100),
            costoHistoricoClp: String(costoHistorico),
        });
    }
};
exports.CotizacionesVentasService = CotizacionesVentasService;
exports.CotizacionesVentasService = CotizacionesVentasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        clientes_service_1.ClientesService,
        divisas_service_1.DivisasService])
], CotizacionesVentasService);
//# sourceMappingURL=cotizaciones-ventas.service.js.map
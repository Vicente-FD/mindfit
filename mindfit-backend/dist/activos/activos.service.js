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
exports.ActivosService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const activo_entity_1 = require("../entities/activo.entity");
const categoria_entity_1 = require("../entities/categoria.entity");
const marca_entity_1 = require("../entities/marca.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const categoria_legacy_util_1 = require("./categoria-legacy.util");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const codigo_inventario_service_1 = require("./codigo-inventario.service");
let ActivosService = class ActivosService {
    dataSource;
    transactionContext;
    codigoInventario;
    constructor(dataSource, transactionContext, codigoInventario) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
        this.codigoInventario = codigoInventario;
    }
    repo() {
        return this.transactionContext.getRepository(activo_entity_1.Activo, this.dataSource);
    }
    findAll(filters = {}) {
        const qb = this.repo()
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.sucursal', 'sucursal')
            .leftJoinAndSelect('a.marcaRelacion', 'marca')
            .leftJoinAndSelect('a.categoriaRelacion', 'categoriaRelacion')
            .orderBy('a.nombre', 'ASC');
        if (filters.sucursalId != null) {
            qb.andWhere('a.sucursal_id = :sucursalId', {
                sucursalId: filters.sucursalId,
            });
        }
        if (filters.marcaId != null) {
            qb.andWhere('a.marca_id = :marcaId', { marcaId: filters.marcaId });
        }
        if (filters.categoriaId != null) {
            qb.andWhere('a.categoria_id = :categoriaId', {
                categoriaId: filters.categoriaId,
            });
        }
        else if (filters.categoria) {
            qb.andWhere('a.categoria = :categoria', { categoria: filters.categoria });
        }
        if (filters.anioCompra != null) {
            qb.andWhere('EXTRACT(YEAR FROM a.fecha_compra) = :anio', {
                anio: filters.anioCompra,
            });
        }
        if (filters.busqueda?.trim()) {
            const q = `%${filters.busqueda.trim().toLowerCase()}%`;
            qb.andWhere(`(LOWER(a.nombre) LIKE :q OR LOWER(a.codigo_inventario) LIKE :q OR LOWER(a.codigo_qr_token) LIKE :q)`, { q });
        }
        qb.andWhere('a.deleted_at IS NULL');
        return qb.getMany();
    }
    async findOne(id) {
        const activo = await this.repo().findOne({
            where: { id },
            relations: { sucursal: true, marcaRelacion: true, categoriaRelacion: true },
        });
        if (!activo) {
            throw new common_1.NotFoundException(`Activo ${id} no encontrado`);
        }
        return activo;
    }
    async resolvePisoAsignado(manager, sucursalId, pisoAsignado) {
        const sucursal = await manager.findOne(sucursal_entity_1.Sucursal, { where: { id: sucursalId } });
        if (!sucursal) {
            throw new common_1.BadRequestException('Sucursal no encontrada');
        }
        const pisos = sucursal.cantidadPisos ?? 1;
        if (pisos <= 1) {
            return null;
        }
        if (pisoAsignado == null) {
            throw new common_1.BadRequestException('Debe indicar el piso asignado para sedes con más de un nivel');
        }
        if (pisoAsignado < 1 || pisoAsignado > pisos) {
            throw new common_1.BadRequestException(`El piso debe estar entre 1 y ${pisos} para esta sede`);
        }
        return pisoAsignado;
    }
    async findByUuid(uuidActivo) {
        return this.findByPublicIdentifier(uuidActivo);
    }
    async findByPublicIdentifier(identifier) {
        let activo = await this.repo().findOne({
            where: { uuidActivo: identifier },
            relations: {
                sucursal: true,
                marcaRelacion: true,
                categoriaRelacion: true,
            },
        });
        if (!activo) {
            activo = await this.repo().findOne({
                where: [
                    { codigoQrToken: identifier },
                    { codigoInventario: identifier },
                ],
                relations: {
                    sucursal: true,
                    marcaRelacion: true,
                    categoriaRelacion: true,
                },
            });
        }
        if (!activo) {
            throw new common_1.NotFoundException(`Activo con identificador ${identifier} no encontrado`);
        }
        return activo;
    }
    async getFichaPublica(identifier) {
        const activo = await this.findByPublicIdentifier(identifier);
        const historial = await this.getHistorial(activo.id);
        const ordenesActivas = await this.dataSource.getRepository(orden_trabajo_entity_1.OrdenTrabajo).find({
            where: {
                activoId: activo.id,
                estado: (0, typeorm_1.In)([
                    enums_1.EstadoOrdenTrabajo.PENDIENTE,
                    enums_1.EstadoOrdenTrabajo.ASIGNADA,
                    enums_1.EstadoOrdenTrabajo.EN_PROCESO,
                ]),
            },
            relations: { asignadoA: true },
            order: { createdAt: 'DESC' },
        });
        return {
            activo: {
                id: activo.id,
                uuidActivo: activo.uuidActivo,
                codigoQrToken: activo.codigoQrToken ?? '',
                codigoInventario: activo.codigoInventario ?? '',
                nombre: activo.nombre,
                marca: activo.marcaRelacion?.nombre ?? activo.marca,
                modelo: activo.modelo,
                categoria: activo.categoriaRelacion?.nombre ??
                    (activo.categoria != null ? String(activo.categoria) : ''),
                estadoOperacional: activo.estadoOperacional,
                sucursalId: activo.sucursalId,
                sucursalNombre: activo.sucursal?.nombre ?? null,
            },
            historial,
            ordenesActivas: ordenesActivas.map((o) => ({
                id: o.id,
                codigoOt: o.codigoOt,
                titulo: o.titulo,
                estado: o.estado,
                prioridad: o.prioridad,
                asignadoAId: o.asignadoAId,
                asignadoANombre: o.asignadoA?.nombre ?? null,
            })),
        };
    }
    async create(dto) {
        const cantidad = dto.cantidad ?? 1;
        if (cantidad > 1 && dto.numeroSerie) {
            throw new common_1.BadRequestException('No puede indicar número de serie al registrar varias unidades iguales');
        }
        if (cantidad === 1) {
            const activo = await this.createOne(dto);
            return { total: 1, activos: [activo] };
        }
        const activos = await this.createMany(dto, cantidad);
        return { total: activos.length, activos };
    }
    async createOne(dto, manager) {
        const em = manager ?? this.transactionContext.getManager(this.dataSource);
        if (dto.numeroSerie) {
            const exists = await em.findOne(activo_entity_1.Activo, {
                where: { numeroSerie: dto.numeroSerie },
            });
            if (exists) {
                throw new common_1.ConflictException('Número de serie ya registrado');
            }
        }
        const saved = await this.persistActivo(em, dto);
        return this.findOne(saved.id);
    }
    async createMany(dto, cantidad) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const ids = [];
            for (let i = 0; i < cantidad; i++) {
                const saved = await this.persistActivo(manager, dto);
                ids.push(saved.id);
            }
            await queryRunner.commitTransaction();
            const creados = [];
            for (const id of ids) {
                creados.push(await this.findOne(id));
            }
            return creados;
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
    }
    async persistActivo(manager, dto) {
        const marca = await manager.findOne(marca_entity_1.Marca, { where: { id: dto.marcaId } });
        if (!marca) {
            throw new common_1.BadRequestException('Marca no encontrada');
        }
        const categoria = await manager.findOne(categoria_entity_1.Categoria, {
            where: { id: dto.categoriaId },
        });
        if (!categoria) {
            throw new common_1.BadRequestException('Categoría no encontrada');
        }
        const pisoAsignado = await this.resolvePisoAsignado(manager, dto.sucursalId, dto.pisoAsignado);
        const codigo = await this.codigoInventario.generarCodigo(manager, dto.sucursalId, dto.marcaId, dto.categoriaId, dto.fechaCompra);
        const activo = manager.create(activo_entity_1.Activo, {
            nombre: dto.nombre,
            marcaId: dto.marcaId,
            marca: marca.nombre,
            modelo: dto.modelo ?? null,
            numeroSerie: dto.numeroSerie ?? null,
            categoriaId: categoria.id,
            categoria: (0, categoria_legacy_util_1.categoriaEnumFromSigla)(categoria.sigla),
            pisoAsignado,
            sucursalId: dto.sucursalId,
            fechaCompra: dto.fechaCompra ?? null,
            fechaVencimientoGarantia: dto.fechaVencimientoGarantia ?? null,
            costoAdquisicion: dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null,
            documentacionUrls: dto.documentacionUrls ?? [],
            estadoOperacional: dto.estadoOperacional,
            codigoInventario: codigo,
            codigoQrToken: codigo,
        });
        return manager.save(activo);
    }
    async update(id, dto) {
        const activo = await this.findOne(id);
        if (dto.numeroSerie !== undefined && dto.numeroSerie !== activo.numeroSerie) {
            if (dto.numeroSerie) {
                const exists = await this.repo().findOne({
                    where: { numeroSerie: dto.numeroSerie },
                });
                if (exists && exists.id !== id) {
                    throw new common_1.ConflictException('Número de serie ya registrado');
                }
            }
            activo.numeroSerie = dto.numeroSerie || null;
        }
        if (dto.marcaId != null) {
            const marca = await this.dataSource
                .getRepository(marca_entity_1.Marca)
                .findOne({ where: { id: dto.marcaId } });
            if (!marca) {
                throw new common_1.BadRequestException('Marca no encontrada');
            }
            activo.marcaId = dto.marcaId;
            activo.marca = marca.nombre;
        }
        if (dto.nombre != null)
            activo.nombre = dto.nombre;
        if (dto.modelo !== undefined)
            activo.modelo = dto.modelo || null;
        if (dto.categoriaId != null) {
            const categoria = await this.dataSource
                .getRepository(categoria_entity_1.Categoria)
                .findOne({ where: { id: dto.categoriaId } });
            if (!categoria) {
                throw new common_1.BadRequestException('Categoría no encontrada');
            }
            activo.categoriaId = categoria.id;
            activo.categoria = (0, categoria_legacy_util_1.categoriaEnumFromSigla)(categoria.sigla);
        }
        const sucursalId = dto.sucursalId ?? activo.sucursalId;
        if (dto.sucursalId != null)
            activo.sucursalId = dto.sucursalId;
        if (dto.pisoAsignado !== undefined || dto.sucursalId != null) {
            activo.pisoAsignado = await this.resolvePisoAsignado(this.transactionContext.getManager(this.dataSource), sucursalId, dto.pisoAsignado !== undefined ? dto.pisoAsignado : activo.pisoAsignado);
        }
        if (dto.fechaCompra !== undefined) {
            activo.fechaCompra = dto.fechaCompra || null;
        }
        if (dto.fechaVencimientoGarantia !== undefined) {
            activo.fechaVencimientoGarantia = dto.fechaVencimientoGarantia || null;
        }
        if (dto.costoAdquisicion !== undefined) {
            activo.costoAdquisicion =
                dto.costoAdquisicion != null ? String(dto.costoAdquisicion) : null;
        }
        if (dto.documentacionUrls != null) {
            activo.documentacionUrls = dto.documentacionUrls;
        }
        if (dto.estadoOperacional != null) {
            activo.estadoOperacional = dto.estadoOperacional;
        }
        await this.repo().save(activo);
        return this.findOne(id);
    }
    async getHistorial(activoId) {
        await this.findOne(activoId);
        const ordenes = await this.dataSource.getRepository(orden_trabajo_entity_1.OrdenTrabajo).find({
            where: {
                activoId,
                estado: (0, typeorm_1.In)([enums_1.EstadoOrdenTrabajo.FINALIZADA, enums_1.EstadoOrdenTrabajo.APROBADA]),
            },
            relations: {
                creadoPor: true,
                asignadoA: true,
                evidencias: true,
                comentarios: { autor: true },
            },
            order: {
                fechaFinReal: 'DESC',
                createdAt: 'DESC',
            },
        });
        return ordenes.map((o) => this.mapHistorialItem(o));
    }
    mapHistorialItem(orden) {
        const fechaResolucion = orden.fechaFinReal ?? orden.updatedAt;
        return {
            id: orden.id,
            codigoOt: orden.codigoOt,
            titulo: orden.titulo,
            descripcion: orden.descripcion,
            prioridad: orden.prioridad,
            tipoMantenimiento: orden.tipoMantenimiento,
            estado: orden.estado,
            fechaResolucion: fechaResolucion ? fechaResolucion.toISOString() : null,
            duracionLabel: this.formatDuracion(orden.fechaInicioReal, orden.fechaFinReal),
            creadoPor: this.mapUsuario(orden.creadoPor),
            asignadoA: orden.asignadoA ? this.mapUsuario(orden.asignadoA) : null,
            comentarioCierre: this.resolveComentarioCierre(orden),
            evidencias: (orden.evidencias ?? []).map((e) => ({
                id: e.id,
                tipoEvidencia: e.tipoEvidencia,
                urlImagen: e.urlImagen,
                createdAt: e.createdAt.toISOString(),
            })),
            comentarios: (orden.comentarios ?? []).map((c) => ({
                id: c.id,
                comentario: c.comentario,
                autor: this.mapUsuario(c.autor),
                createdAt: c.createdAt.toISOString(),
            })),
        };
    }
    mapUsuario(u) {
        return {
            id: u.id,
            nombre: u.nombre,
            email: u.email,
            rol: u.rol,
        };
    }
    resolveComentarioCierre(orden) {
        const comentarios = orden.comentarios ?? [];
        if (comentarios.length === 0)
            return null;
        const sorted = [...comentarios].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        if (orden.asignadoAId) {
            const tecnico = sorted.find((c) => c.autorId === orden.asignadoAId);
            if (tecnico)
                return tecnico.comentario;
        }
        return sorted[0]?.comentario ?? null;
    }
    formatDuracion(inicio, fin) {
        if (!inicio || !fin)
            return null;
        const ms = fin.getTime() - inicio.getTime();
        if (ms <= 0)
            return null;
        const totalMin = Math.floor(ms / 60000);
        const h = Math.floor(totalMin / 60);
        const m = totalMin % 60;
        if (h > 0 && m > 0)
            return `${h}h ${m}m`;
        if (h > 0)
            return `${h}h`;
        return `${m}m`;
    }
    async remove(id) {
        await this.findOne(id);
        const result = await this.repo().softDelete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Activo ${id} no encontrado`);
        }
        return { deleted: true };
    }
};
exports.ActivosService = ActivosService;
exports.ActivosService = ActivosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService,
        codigo_inventario_service_1.CodigoInventarioService])
], ActivosService);
//# sourceMappingURL=activos.service.js.map
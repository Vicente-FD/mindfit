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
exports.SucursalesService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const activo_entity_1 = require("../entities/activo.entity");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
const enums_1 = require("../common/enums");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
let SucursalesService = class SucursalesService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
    }
    repo() {
        return this.transactionContext.getRepository(sucursal_entity_1.Sucursal, this.dataSource);
    }
    async findAll() {
        const rows = await this.repo()
            .createQueryBuilder('s')
            .where('s.deleted_at IS NULL')
            .orderBy('s.nombre', 'ASC')
            .getMany();
        const counts = await this.dataSource
            .getRepository(activo_entity_1.Activo)
            .createQueryBuilder('a')
            .select('a.sucursal_id', 'sucursalId')
            .addSelect('COUNT(*)::int', 'total')
            .where('a.deleted_at IS NULL')
            .andWhere('a.estado_operacional = :estado', {
            estado: enums_1.EstadoOperacionalActivo.OPERATIVO,
        })
            .groupBy('a.sucursal_id')
            .getRawMany();
        const countMap = new Map(counts.map((c) => [Number(c.sucursalId), Number(c.total)]));
        return rows.map((s) => ({
            id: s.id,
            nombre: s.nombre,
            sigla: s.sigla,
            direccion: s.direccion,
            comuna: s.comuna,
            ciudad: s.ciudad,
            estaActiva: s.estaActiva,
            cantidadPisos: s.cantidadPisos ?? 1,
            activosOperativos: countMap.get(s.id) ?? 0,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));
    }
    async findOne(id) {
        const sucursal = await this.repo()
            .createQueryBuilder('s')
            .where('s.id = :id', { id })
            .andWhere('s.deleted_at IS NULL')
            .getOne();
        if (!sucursal) {
            throw new common_1.NotFoundException(`Sucursal ${id} no encontrada`);
        }
        return sucursal;
    }
    async getMonitoreo(sucursalId) {
        const sucursal = await this.findOne(sucursalId);
        const activoRepo = this.dataSource.getRepository(activo_entity_1.Activo);
        const otRepo = this.dataSource.getRepository(orden_trabajo_entity_1.OrdenTrabajo);
        const activos = await activoRepo.find({
            where: { sucursalId, deletedAt: (0, typeorm_1.IsNull)() },
        });
        const ordenes = await otRepo.find({
            where: { sucursalId, deletedAt: (0, typeorm_1.IsNull)() },
            relations: {
                asignadoA: true,
                activo: true,
                evidencias: true,
                comentarios: true,
                sucursal: true,
            },
            order: { updatedAt: 'DESC' },
        });
        return this.buildMonitoreoPayload({
            id: sucursal.id,
            nombre: sucursal.nombre,
            sigla: sucursal.sigla,
        }, activos, ordenes, false);
    }
    async getMonitoreoGlobal() {
        const activoRepo = this.dataSource.getRepository(activo_entity_1.Activo);
        const otRepo = this.dataSource.getRepository(orden_trabajo_entity_1.OrdenTrabajo);
        const activos = await activoRepo.find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
        });
        const ordenes = await otRepo.find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            relations: {
                asignadoA: true,
                activo: true,
                evidencias: true,
                comentarios: true,
                sucursal: true,
            },
            order: { updatedAt: 'DESC' },
        });
        return this.buildMonitoreoPayload({
            id: 0,
            nombre: 'Todas las sedes',
            sigla: 'GLOBAL',
        }, activos, ordenes, true);
    }
    buildMonitoreoPayload(sucursal, activos, ordenes, incluirSedeEnItems) {
        const activosOperativos = activos.filter((a) => a.estadoOperacional === enums_1.EstadoOperacionalActivo.OPERATIVO).length;
        const activosFueraServicio = activos.filter((a) => a.estadoOperacional === enums_1.EstadoOperacionalActivo.FUERA_SERVICIO).length;
        const activosEnReparacion = activos.filter((a) => a.estadoOperacional === enums_1.EstadoOperacionalActivo.EN_REPARACION).length;
        const estadosResueltos = [
            enums_1.EstadoOrdenTrabajo.FINALIZADA,
            enums_1.EstadoOrdenTrabajo.APROBADA,
        ];
        const estadosEnCurso = [
            enums_1.EstadoOrdenTrabajo.ASIGNADA,
            enums_1.EstadoOrdenTrabajo.EN_PROCESO,
        ];
        const otsReportadas = ordenes.length;
        const otsResueltas = ordenes.filter((o) => estadosResueltos.includes(o.estado)).length;
        const porcentajeEfectividad = otsReportadas > 0
            ? Math.round((otsResueltas / otsReportadas) * 1000) / 10
            : 0;
        const trabajosEnCurso = ordenes
            .filter((o) => estadosEnCurso.includes(o.estado))
            .map((o) => {
            const elapsed = this.elapsedFrom(o.fechaInicioReal);
            return {
                ordenId: o.id,
                codigoOt: o.codigoOt,
                titulo: o.titulo,
                clasificacion: o.clasificacion,
                estado: o.estado,
                tecnicoNombre: o.asignadoA?.nombre ?? null,
                fechaInicioReal: o.fechaInicioReal?.toISOString() ?? null,
                minutosTranscurridos: elapsed.minutos,
                tiempoTranscurridoLabel: elapsed.label,
                ...this.sedeRefOrden(o, incluirSedeEnItems),
            };
        });
        const historialInfraestructura = ordenes
            .filter((o) => estadosResueltos.includes(o.estado) &&
            (o.clasificacion === enums_1.ClasificacionOrden.INFRAESTRUCTURA ||
                o.clasificacion === enums_1.ClasificacionOrden.PETICION))
            .map((o) => ({
            ordenId: o.id,
            codigoOt: o.codigoOt,
            reporteOriginal: o.descripcion?.trim() || o.titulo,
            prioridad: o.prioridad,
            clasificacion: o.clasificacion,
            fechaResolucion: this.resolutionDate(o).toISOString(),
            comentarioCierre: this.comentarioCierre(o),
            ...this.sedeRefOrden(o, incluirSedeEnItems),
        }));
        const historialMaquinas = ordenes
            .filter((o) => o.activoId != null &&
            estadosResueltos.includes(o.estado) &&
            (o.tipoMantenimiento === enums_1.TipoMantenimiento.CORRECTIVO ||
                o.tipoMantenimiento === enums_1.TipoMantenimiento.PREVENTIVO))
            .map((o) => {
            const fotos = this.evidenciasAntesDespues(o);
            return {
                ordenId: o.id,
                codigoOt: o.codigoOt,
                titulo: o.titulo,
                activoId: o.activoId,
                activoNombre: o.activo?.nombre ?? `Activo #${o.activoId}`,
                activoCodigo: o.activo?.codigoInventario ?? null,
                tipoMantenimiento: o.tipoMantenimiento,
                prioridad: o.prioridad,
                fechaResolucion: this.resolutionDate(o).toISOString(),
                comentarioCierre: this.comentarioCierre(o),
                fotoAntesUrl: fotos.antes,
                fotoDespuesUrl: fotos.despues,
                ...this.sedeRefOrden(o, incluirSedeEnItems),
            };
        });
        const bitacoraTimeline = ordenes
            .filter((o) => estadosResueltos.includes(o.estado))
            .map((o) => {
            const fotos = this.evidenciasAntesDespues(o);
            return {
                ordenId: o.id,
                codigoOt: o.codigoOt,
                titulo: o.titulo,
                clasificacion: o.clasificacion,
                tipoMantenimiento: o.tipoMantenimiento,
                prioridad: o.prioridad,
                fechaEvento: this.resolutionDate(o).toISOString(),
                tecnicoNombre: o.asignadoA?.nombre ?? null,
                comentarioCierre: this.comentarioCierre(o),
                fotoAntesUrl: fotos.antes,
                fotoDespuesUrl: fotos.despues,
                activoNombre: o.activo?.nombre ?? null,
                ...this.sedeRefOrden(o, incluirSedeEnItems),
            };
        })
            .sort((a, b) => new Date(b.fechaEvento).getTime() - new Date(a.fechaEvento).getTime());
        return {
            sucursal,
            salud: {
                activosOperativos,
                activosFueraServicio,
                activosEnReparacion,
                porcentajeEfectividad,
                otsReportadas,
                otsResueltas,
            },
            trabajosEnCurso,
            historialInfraestructura,
            historialMaquinas,
            bitacoraTimeline,
            consultadoEn: new Date().toISOString(),
        };
    }
    sedeRefOrden(orden, incluir) {
        if (!incluir || !orden.sucursal) {
            return {};
        }
        return {
            sucursalId: orden.sucursal.id,
            sucursalNombre: orden.sucursal.nombre,
            sucursalSigla: orden.sucursal.sigla,
        };
    }
    resolutionDate(orden) {
        return (orden.fechaAprobacion ??
            orden.fechaFinReal ??
            orden.updatedAt ??
            orden.createdAt);
    }
    comentarioCierre(orden) {
        const comentarios = orden.comentarios ?? [];
        if (!comentarios.length)
            return null;
        const sorted = [...comentarios].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        return sorted[0]?.comentario?.trim() ?? null;
    }
    evidenciasAntesDespues(orden) {
        const evidencias = orden.evidencias ?? [];
        const antes = evidencias.find((e) => e.tipoEvidencia === enums_1.TipoEvidencia.ANTES)
            ?.urlImagen ?? null;
        const despues = evidencias.find((e) => e.tipoEvidencia === enums_1.TipoEvidencia.DESPUES)
            ?.urlImagen ?? null;
        return { antes, despues };
    }
    elapsedFrom(fechaInicio) {
        if (!fechaInicio) {
            return { minutos: 0, label: '—' };
        }
        const diffMs = Date.now() - new Date(fechaInicio).getTime();
        const totalMin = Math.max(0, Math.floor(diffMs / 60_000));
        const horas = Math.floor(totalMin / 60);
        const mins = totalMin % 60;
        const label = horas > 0 ? `${horas}h ${mins.toString().padStart(2, '0')}m` : `${mins}m`;
        return { minutos: totalMin, label };
    }
    normalizeSigla(sigla) {
        return sigla.trim().toUpperCase();
    }
    async assertSiglaUnique(sigla, excludeId) {
        const qb = this.repo()
            .createQueryBuilder('s')
            .where('s.sigla = :sigla', { sigla })
            .andWhere('s.deleted_at IS NULL');
        if (excludeId != null) {
            qb.andWhere('s.id != :excludeId', { excludeId });
        }
        const exists = await qb.getOne();
        if (exists) {
            throw new common_1.ConflictException(`La sigla «${sigla}» ya está asignada a otra sucursal activa`);
        }
    }
    async create(dto) {
        const sigla = this.normalizeSigla(dto.sigla);
        await this.assertSiglaUnique(sigla);
        const sucursal = this.repo().create({
            nombre: dto.nombre.trim(),
            sigla,
            direccion: dto.direccion.trim(),
            comuna: dto.comuna.trim(),
            ciudad: dto.ciudad.trim(),
            estaActiva: dto.estaActiva ?? true,
            cantidadPisos: dto.cantidadPisos ?? 1,
        });
        try {
            return await this.repo().save(sucursal);
        }
        catch (err) {
            this.handleUniqueViolation(err);
            throw err;
        }
    }
    async update(id, dto) {
        const sucursal = await this.findOne(id);
        if (dto.nombre != null)
            sucursal.nombre = dto.nombre.trim();
        if (dto.direccion != null)
            sucursal.direccion = dto.direccion.trim();
        if (dto.comuna != null)
            sucursal.comuna = dto.comuna.trim();
        if (dto.ciudad != null)
            sucursal.ciudad = dto.ciudad.trim();
        if (dto.estaActiva != null)
            sucursal.estaActiva = dto.estaActiva;
        if (dto.cantidadPisos != null)
            sucursal.cantidadPisos = dto.cantidadPisos;
        if (dto.sigla != null) {
            const sigla = this.normalizeSigla(dto.sigla);
            await this.assertSiglaUnique(sigla, id);
            sucursal.sigla = sigla;
        }
        try {
            return await this.repo().save(sucursal);
        }
        catch (err) {
            this.handleUniqueViolation(err);
            throw err;
        }
    }
    async remove(id) {
        await this.findOne(id);
        const activoRepo = this.transactionContext.getRepository(activo_entity_1.Activo, this.dataSource);
        await activoRepo.softDelete({ sucursalId: id });
        await this.repo().update(id, { estaActiva: false });
        await this.repo().softDelete(id);
        return { deleted: true };
    }
    handleUniqueViolation(err) {
        const code = err?.code;
        if (code === '23505') {
            throw new common_1.ConflictException('Nombre o sigla de sucursal ya existe en el sistema');
        }
    }
};
exports.SucursalesService = SucursalesService;
exports.SucursalesService = SucursalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], SucursalesService);
//# sourceMappingURL=sucursales.service.js.map
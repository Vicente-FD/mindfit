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
exports.FacilidadesCriticasService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const facilidades_criticas_util_1 = require("../common/utils/facilidades-criticas.util");
const ordenes_trabajo_service_1 = require("../ordenes-trabajo/ordenes-trabajo.service");
const facilidad_critica_historial_entity_1 = require("../entities/facilidad-critica-historial.entity");
const facilidad_critica_entity_1 = require("../entities/facilidad-critica.entity");
const sucursal_entity_1 = require("../entities/sucursal.entity");
let FacilidadesCriticasService = class FacilidadesCriticasService {
    dataSource;
    ordenesTrabajoService;
    constructor(dataSource, ordenesTrabajoService) {
        this.dataSource = dataSource;
        this.ordenesTrabajoService = ordenesTrabajoService;
    }
    async ensurePlantillaSucursal(sucursalId, manager) {
        const repo = manager
            ? manager.getRepository(facilidad_critica_entity_1.FacilidadCritica)
            : this.dataSource.getRepository(facilidad_critica_entity_1.FacilidadCritica);
        const existentes = await repo.find({
            where: { sucursalId },
            select: { id: true, tipo: true },
        });
        const tiposExistentes = new Set(existentes.map((f) => f.tipo));
        const faltantes = facilidades_criticas_util_1.DEFAULT_TIPOS_FACILIDAD.filter((t) => !tiposExistentes.has(t));
        if (!faltantes.length)
            return;
        await repo.save(faltantes.map((tipo) => repo.create({
            sucursalId,
            tipo,
            estado: enums_1.EstadoFacilidadCritica.OPERATIVO,
        })));
    }
    async backfillTodasLasSucursales() {
        const sucursales = await this.dataSource.getRepository(sucursal_entity_1.Sucursal).find({
            where: { deletedAt: (0, typeorm_1.IsNull)() },
            select: { id: true },
        });
        for (const s of sucursales) {
            await this.ensurePlantillaSucursal(s.id);
        }
    }
    async getResumenSucursal(sucursalId) {
        await this.ensurePlantillaSucursal(sucursalId);
        const items = await this.loadItemsConConteo(sucursalId);
        return this.buildResumen(items);
    }
    async getResumenGlobalSedes() {
        const sucursales = await this.dataSource.getRepository(sucursal_entity_1.Sucursal).find({
            where: { deletedAt: (0, typeorm_1.IsNull)(), estaActiva: true },
            order: { nombre: 'ASC' },
        });
        const result = [];
        for (const s of sucursales) {
            const resumen = await this.getResumenSucursal(s.id);
            result.push({
                sucursalId: s.id,
                sucursalNombre: s.nombre,
                sucursalSigla: s.sigla,
                semaforo: resumen.semaforo,
                operativas: resumen.operativas,
                enMantenimiento: resumen.enMantenimiento,
                fueraDeServicio: resumen.fueraDeServicio,
            });
        }
        return result;
    }
    async findMiSucursal(user) {
        const sucursalId = await this.resolveSucursalIdUsuario(user);
        return this.getResumenSucursal(sucursalId);
    }
    async findBySucursalForUser(sucursalId, user) {
        await this.assertPuedeVerSucursal(sucursalId, user);
        return this.getResumenSucursal(sucursalId);
    }
    async getHistorial(facilidadId, user) {
        const facilidad = await this.findFacilidadOrFail(facilidadId);
        await this.assertPuedeVerSucursal(facilidad.sucursalId, user);
        const rows = await this.dataSource
            .getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial)
            .find({
            where: { facilidadCriticaId: facilidadId },
            relations: { reportadoPor: true },
            order: { createdAt: 'DESC' },
            take: 50,
        });
        return rows.map((h) => ({
            id: h.id,
            estadoAnterior: h.estadoAnterior,
            estadoNuevo: h.estadoNuevo,
            descripcionProblema: h.descripcionProblema,
            reportadoPorNombre: h.reportadoPor?.nombre ?? null,
            createdAt: h.createdAt.toISOString(),
        }));
    }
    async reportarAreaServicios(dto, user, fotoUrl) {
        const descripcion = dto.descripcionProblema.trim();
        if (!descripcion) {
            throw new common_1.BadRequestException('La descripción del problema es obligatoria');
        }
        if (!fotoUrl?.trim()) {
            throw new common_1.BadRequestException('La fotografía del problema es obligatoria');
        }
        const sucursalId = await this.resolveSucursalIdParaReporte(user);
        const esGeneral = ['true', '1'].includes(String(dto.esFallaGeneral ?? '').toLowerCase());
        if (!esGeneral && (!dto.area || !dto.genero)) {
            throw new common_1.BadRequestException('Debe indicar el tipo de área y género, o marcar falla general');
        }
        const prioridad = dto.prioridad ?? enums_1.PrioridadOrden.MEDIA;
        const notas = dto.notasTecnicas?.trim() || null;
        const prep = await this.dataSource.transaction(async (manager) => {
            await this.ensurePlantillaSucursal(sucursalId, manager);
            let tituloOt;
            let facilidadCriticaId = null;
            if (esGeneral) {
                tituloOt = 'Falla general — área de servicios';
                await this.marcarFallaEnTodasLasFacilidades(manager, sucursalId, descripcion, notas, user.sub);
            }
            else {
                const tipo = (0, facilidades_criticas_util_1.resolveTipoFacilidad)(dto.area, dto.genero);
                const facilidad = await manager.getRepository(facilidad_critica_entity_1.FacilidadCritica).findOne({
                    where: { sucursalId, tipo },
                });
                if (!facilidad) {
                    throw new common_1.NotFoundException('No se encontró la facilidad indicada en esta sucursal');
                }
                facilidadCriticaId = facilidad.id;
                tituloOt = `Área de servicios — ${(0, facilidades_criticas_util_1.labelAreaGenero)(dto.area, dto.genero)}`;
                await this.aplicarFallaFacilidad(manager, facilidad, descripcion, notas, user.sub);
            }
            return { tituloOt, facilidadCriticaId, esGeneral };
        });
        const descripcionOt = notas
            ? `${descripcion}\n\nNotas: ${notas}`
            : descripcion;
        const orden = await this.ordenesTrabajoService.reportarFalla({
            tipoReporte: 'infraestructura',
            descripcion: descripcionOt,
            prioridad,
            titulo: prep.tituloOt,
            facilidadCriticaId: prep.facilidadCriticaId ?? undefined,
        }, user.sub, sucursalId, fotoUrl);
        return {
            ordenId: orden.id,
            codigoOt: orden.codigoOt,
            titulo: orden.titulo,
            facilidadCriticaId: prep.facilidadCriticaId,
            esFallaGeneral: prep.esGeneral,
        };
    }
    async reportarFalla(facilidadId, dto, user) {
        const descripcion = dto.descripcionProblema.trim();
        if (!descripcion) {
            throw new common_1.BadRequestException('La descripción del problema es obligatoria');
        }
        return this.dataSource.transaction(async (manager) => {
            const facilidad = await this.findFacilidadOrFail(facilidadId, manager);
            await this.assertPuedeModificarSucursal(facilidad.sucursalId, user);
            const estadoAnterior = facilidad.estado;
            const estadoNuevo = enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO;
            if (estadoAnterior === estadoNuevo && !dto.notasTecnicas?.trim()) {
                throw new common_1.BadRequestException('La facilidad ya está fuera de servicio. Agregue notas si desea actualizar el registro.');
            }
            facilidad.estado = estadoNuevo;
            if (dto.notasTecnicas?.trim()) {
                facilidad.notasTecnicas = dto.notasTecnicas.trim();
            }
            facilidad.actualizadoPorId = user.sub;
            await manager.getRepository(facilidad_critica_entity_1.FacilidadCritica).save(facilidad);
            await manager.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial).save({
                facilidadCriticaId: facilidad.id,
                estadoAnterior,
                estadoNuevo,
                descripcionProblema: descripcion,
                reportadoPorId: user.sub,
            });
            return this.mapItem(facilidad, await this.countHistorialFallas(facilidad.id, manager));
        });
    }
    async actualizarEstado(facilidadId, dto, user) {
        this.assertPuedeResolverEstado(user);
        return this.dataSource.transaction(async (manager) => {
            const facilidad = await this.findFacilidadOrFail(facilidadId, manager);
            const estadoAnterior = facilidad.estado;
            const estadoNuevo = dto.estado;
            if (estadoAnterior === estadoNuevo && dto.notasTecnicas === undefined) {
                throw new common_1.BadRequestException('El estado ya es el indicado');
            }
            facilidad.estado = estadoNuevo;
            if (dto.notasTecnicas !== undefined) {
                facilidad.notasTecnicas = dto.notasTecnicas.trim() || null;
            }
            facilidad.actualizadoPorId = user.sub;
            await manager.getRepository(facilidad_critica_entity_1.FacilidadCritica).save(facilidad);
            if (estadoAnterior !== estadoNuevo) {
                await manager.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial).save({
                    facilidadCriticaId: facilidad.id,
                    estadoAnterior,
                    estadoNuevo,
                    descripcionProblema: dto.notasTecnicas?.trim() ||
                        `Estado actualizado a ${estadoNuevo} por operaciones`,
                    reportadoPorId: user.sub,
                });
            }
            return this.mapItem(facilidad, await this.countHistorialFallas(facilidad.id, manager));
        });
    }
    async loadItemsConConteo(sucursalId) {
        const facilidades = await this.dataSource.getRepository(facilidad_critica_entity_1.FacilidadCritica).find({
            where: { sucursalId },
            order: { tipo: 'ASC' },
        });
        if (!facilidades.length)
            return [];
        const ids = facilidades.map((f) => f.id);
        const conteos = await this.dataSource
            .getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial)
            .createQueryBuilder('h')
            .select('h.facilidad_critica_id', 'facilidadId')
            .addSelect('COUNT(*)::int', 'total')
            .where('h.facilidad_critica_id IN (:...ids)', { ids })
            .andWhere('h.estado_nuevo = :estado', {
            estado: enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO,
        })
            .groupBy('h.facilidad_critica_id')
            .getRawMany();
        const countMap = new Map(conteos.map((c) => [Number(c.facilidadId), Number(c.total)]));
        return facilidades.map((f) => this.mapItem(f, countMap.get(f.id) ?? 0));
    }
    buildResumen(items) {
        const estados = items.map((i) => i.estado);
        return {
            semaforo: (0, facilidades_criticas_util_1.calcularSemaforoOperatividad)(estados),
            operativas: items.filter((i) => i.estado === enums_1.EstadoFacilidadCritica.OPERATIVO).length,
            enMantenimiento: items.filter((i) => i.estado === enums_1.EstadoFacilidadCritica.MANTENIMIENTO).length,
            fueraDeServicio: items.filter((i) => i.estado === enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO).length,
            items,
        };
    }
    mapItem(f, fallosHistoricos) {
        return {
            id: f.id,
            sucursalId: f.sucursalId,
            tipo: f.tipo,
            tipoLabel: (0, facilidades_criticas_util_1.labelTipoFacilidad)(f.tipo),
            estado: f.estado,
            notasTecnicas: f.notasTecnicas,
            updatedAt: f.updatedAt.toISOString(),
            fallosHistoricos,
        };
    }
    async countHistorialFallas(facilidadId, manager) {
        const repo = manager
            ? manager.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial)
            : this.dataSource.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial);
        return repo.count({
            where: {
                facilidadCriticaId: facilidadId,
                estadoNuevo: enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO,
            },
        });
    }
    async findFacilidadOrFail(id, manager) {
        const repo = manager
            ? manager.getRepository(facilidad_critica_entity_1.FacilidadCritica)
            : this.dataSource.getRepository(facilidad_critica_entity_1.FacilidadCritica);
        const facilidad = await repo.findOne({ where: { id } });
        if (!facilidad) {
            throw new common_1.NotFoundException(`Facilidad crítica ${id} no encontrada`);
        }
        return facilidad;
    }
    async aplicarFallaFacilidad(manager, facilidad, descripcion, notas, userId) {
        const estadoAnterior = facilidad.estado;
        facilidad.estado = enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO;
        if (notas)
            facilidad.notasTecnicas = notas;
        facilidad.actualizadoPorId = userId;
        await manager.getRepository(facilidad_critica_entity_1.FacilidadCritica).save(facilidad);
        await manager.getRepository(facilidad_critica_historial_entity_1.FacilidadCriticaHistorial).save({
            facilidadCriticaId: facilidad.id,
            estadoAnterior,
            estadoNuevo: enums_1.EstadoFacilidadCritica.FUERA_DE_SERVICIO,
            descripcionProblema: descripcion,
            reportadoPorId: userId,
        });
    }
    async marcarFallaEnTodasLasFacilidades(manager, sucursalId, descripcion, notas, userId) {
        const facilidades = await manager
            .getRepository(facilidad_critica_entity_1.FacilidadCritica)
            .find({ where: { sucursalId } });
        for (const facilidad of facilidades) {
            await this.aplicarFallaFacilidad(manager, facilidad, descripcion, notas, userId);
        }
    }
    async resolveSucursalIdParaReporte(user) {
        if (user.rol === enums_1.RolUsuario.JEFE_SUCURSAL) {
            if (user.sucursalId == null) {
                throw new common_1.BadRequestException('Su usuario no tiene sucursal asignada');
            }
            return user.sucursalId;
        }
        if (user.rol === enums_1.RolUsuario.ADMIN ||
            user.rol === enums_1.RolUsuario.JEFE_OPERACIONES) {
            throw new common_1.BadRequestException('Use el panel de operaciones para reportar en otra sucursal');
        }
        throw new common_1.ForbiddenException('Sin permisos para reportar área de servicios');
    }
    async resolveSucursalIdUsuario(user) {
        if (user.rol === enums_1.RolUsuario.JEFE_SUCURSAL) {
            if (user.sucursalId == null) {
                throw new common_1.BadRequestException('Su usuario no tiene sucursal asignada');
            }
            return user.sucursalId;
        }
        throw new common_1.ForbiddenException('Solo aplica para jefe de sucursal');
    }
    async assertPuedeVerSucursal(sucursalId, user) {
        if (user.rol === enums_1.RolUsuario.ADMIN ||
            user.rol === enums_1.RolUsuario.JEFE_OPERACIONES ||
            user.rol === enums_1.RolUsuario.GERENTE_BI) {
            return;
        }
        if (user.rol === enums_1.RolUsuario.JEFE_SUCURSAL) {
            if (user.sucursalId !== sucursalId) {
                throw new common_1.ForbiddenException('No puede consultar facilidades de otra sucursal');
            }
            return;
        }
        throw new common_1.ForbiddenException('Sin permisos para ver facilidades críticas');
    }
    async assertPuedeModificarSucursal(sucursalId, user) {
        if (user.rol === enums_1.RolUsuario.ADMIN ||
            user.rol === enums_1.RolUsuario.JEFE_OPERACIONES) {
            return;
        }
        if (user.rol === enums_1.RolUsuario.JEFE_SUCURSAL) {
            if (user.sucursalId !== sucursalId) {
                throw new common_1.ForbiddenException('No puede reportar fallas en otra sucursal');
            }
            return;
        }
        throw new common_1.ForbiddenException('Sin permisos para reportar fallas');
    }
    assertPuedeResolverEstado(user) {
        if (user.rol === enums_1.RolUsuario.ADMIN ||
            user.rol === enums_1.RolUsuario.JEFE_OPERACIONES) {
            return;
        }
        throw new common_1.ForbiddenException('Solo operaciones o administración pueden cambiar el estado de resolución');
    }
};
exports.FacilidadesCriticasService = FacilidadesCriticasService;
exports.FacilidadesCriticasService = FacilidadesCriticasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        ordenes_trabajo_service_1.OrdenesTrabajoService])
], FacilidadesCriticasService);
//# sourceMappingURL=facilidades-criticas.service.js.map
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
var OrdenesTrabajoService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenesTrabajoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const usuario_entity_1 = require("../entities/usuario.entity");
const activo_entity_1 = require("../entities/activo.entity");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const evidencia_ot_entity_1 = require("../entities/evidencia-ot.entity");
const comentario_ot_entity_1 = require("../entities/comentario-ot.entity");
const ot_codigo_sequence_1 = require("./ot-codigo.sequence");
const agent_debug_log_1 = require("../common/agent-debug-log");
const inventario_service_1 = require("../inventario/inventario.service");
let OrdenesTrabajoService = class OrdenesTrabajoService {
    static { OrdenesTrabajoService_1 = this; }
    dataSource;
    transactionContext;
    inventarioService;
    constructor(dataSource, transactionContext, inventarioService) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
        this.inventarioService = inventarioService;
    }
    ordenRepo() {
        return this.transactionContext.getRepository(orden_trabajo_entity_1.OrdenTrabajo, this.dataSource);
    }
    evidenciaRepo() {
        return this.transactionContext.getRepository(evidencia_ot_entity_1.EvidenciaOt, this.dataSource);
    }
    comentarioRepo() {
        return this.transactionContext.getRepository(comentario_ot_entity_1.ComentarioOt, this.dataSource);
    }
    async generarCodigoOt() {
        const manager = this.transactionContext.getManager(this.dataSource);
        return (0, ot_codigo_sequence_1.nextOtCodigo)((sql) => manager.query(sql));
    }
    findAll(filters) {
        const qb = this.ordenRepo()
            .createQueryBuilder('ot')
            .leftJoinAndSelect('ot.activo', 'activo')
            .leftJoinAndSelect('ot.sucursal', 'sucursal')
            .leftJoinAndSelect('ot.creadoPor', 'creadoPor')
            .leftJoinAndSelect('ot.asignadoA', 'asignadoA')
            .orderBy('ot.createdAt', 'DESC');
        if (filters?.includeComentarios) {
            qb.leftJoinAndSelect('ot.comentarios', 'comentarios');
        }
        if (filters?.includeEvidencias) {
            qb.leftJoinAndSelect('ot.evidencias', 'evidencias');
        }
        if (filters?.tecnicoId) {
            qb.andWhere('ot.asignado_a_id = :tecnicoId', {
                tecnicoId: filters.tecnicoId,
            });
        }
        if (filters?.sucursalId) {
            qb.andWhere('ot.sucursal_id = :sucursalId', {
                sucursalId: filters.sucursalId,
            });
        }
        if (filters?.estado === 'activas') {
            qb.andWhere('ot.estado IN (:...estadosActivos)', {
                estadosActivos: [
                    enums_1.EstadoOrdenTrabajo.PENDIENTE,
                    enums_1.EstadoOrdenTrabajo.ASIGNADA,
                    enums_1.EstadoOrdenTrabajo.EN_PROCESO,
                ],
            });
        }
        else if (filters?.estado === 'por_aprobar') {
            qb.andWhere('ot.estado = :estadoPorAprobar', {
                estadoPorAprobar: enums_1.EstadoOrdenTrabajo.FINALIZADA,
            });
        }
        else if (filters?.estado === 'finalizadas') {
            qb.andWhere('ot.estado IN (:...estadoArchivo)', {
                estadoArchivo: [
                    enums_1.EstadoOrdenTrabajo.APROBADA,
                    enums_1.EstadoOrdenTrabajo.RECHAZADA,
                ],
            });
        }
        if (filters?.fechaInicio) {
            qb.andWhere('ot.created_at >= :fechaInicio', {
                fechaInicio: this.startOfDay(filters.fechaInicio),
            });
        }
        if (filters?.fechaFin) {
            qb.andWhere('ot.created_at <= :fechaFin', {
                fechaFin: this.endOfDay(filters.fechaFin),
            });
        }
        qb.andWhere('ot.deleted_at IS NULL');
        return qb.getMany();
    }
    startOfDay(isoDate) {
        const d = new Date(isoDate);
        d.setHours(0, 0, 0, 0);
        return d;
    }
    endOfDay(isoDate) {
        const d = new Date(isoDate);
        d.setHours(23, 59, 59, 999);
        return d;
    }
    async findOne(id) {
        const orden = await this.ordenRepo().findOne({
            where: { id },
            relations: {
                activo: true,
                sucursal: true,
                creadoPor: true,
                asignadoA: true,
                evidencias: true,
                comentarios: { autor: true },
            },
        });
        if (!orden) {
            throw new common_1.NotFoundException(`Orden de trabajo ${id} no encontrada`);
        }
        return orden;
    }
    async findBySucursal(sucursalId) {
        return this.findAll({ sucursalId });
    }
    async reportarFalla(dto, creadoPorId, sucursalId, fotoUrl) {
        const orden = await this.create({
            activoId: dto.activoId,
            sucursalId,
            titulo: dto.titulo ?? `Reporte de falla - Activo #${dto.activoId}`,
            descripcion: dto.descripcion,
            prioridad: dto.prioridad,
            tipoMantenimiento: enums_1.TipoMantenimiento.CORRECTIVO,
        }, creadoPorId);
        if (fotoUrl) {
            await this.agregarEvidencia(orden.id, creadoPorId, {
                tipoEvidencia: enums_1.TipoEvidencia.ANTES,
                urlImagen: fotoUrl,
            });
        }
        return this.findOne(orden.id);
    }
    async create(dto, creadoPorId) {
        const clasificacion = dto.clasificacion ?? enums_1.ClasificacionOrden.MAQUINA;
        const manager = this.transactionContext.getManager(this.dataSource);
        if (clasificacion === enums_1.ClasificacionOrden.MAQUINA) {
            if (dto.activoId == null) {
                throw new common_1.BadRequestException('activoId es obligatorio para OT de máquina');
            }
            const activo = await manager.findOne(activo_entity_1.Activo, {
                where: { id: dto.activoId },
            });
            if (!activo) {
                throw new common_1.BadRequestException('Activo no encontrado');
            }
            if (activo.sucursalId !== dto.sucursalId) {
                throw new common_1.BadRequestException('El activo no pertenece a la sucursal seleccionada');
            }
        }
        const orden = this.ordenRepo().create({
            codigoOt: await this.generarCodigoOt(),
            clasificacion,
            activoId: clasificacion === enums_1.ClasificacionOrden.INFRAESTRUCTURA
                ? null
                : (dto.activoId ?? null),
            sucursalId: dto.sucursalId,
            creadoPorId,
            titulo: dto.titulo,
            descripcion: dto.descripcion ?? null,
            prioridad: dto.prioridad ?? enums_1.PrioridadOrden.MEDIA,
            tipoMantenimiento: dto.tipoMantenimiento,
            estado: enums_1.EstadoOrdenTrabajo.PENDIENTE,
            tiempoEstimadoMinutos: dto.tiempoEstimadoMinutos ?? null,
            fechaProgramacion: dto.fechaProgramacion
                ? new Date(dto.fechaProgramacion)
                : null,
        });
        const saved = await this.ordenRepo().save(orden);
        return this.findOne(saved.id);
    }
    assertOrdenEditable(estado) {
        if (estado === enums_1.EstadoOrdenTrabajo.FINALIZADA ||
            estado === enums_1.EstadoOrdenTrabajo.APROBADA ||
            estado === enums_1.EstadoOrdenTrabajo.RECHAZADA) {
            throw new common_1.BadRequestException('No se puede modificar una orden finalizada o aprobada');
        }
    }
    async update(id, dto) {
        const orden = await this.findOne(id);
        this.assertOrdenEditable(orden.estado);
        const manager = this.transactionContext.getManager(this.dataSource);
        if (dto.titulo != null)
            orden.titulo = dto.titulo;
        if (dto.descripcion !== undefined) {
            orden.descripcion = dto.descripcion || null;
        }
        if (dto.prioridad != null)
            orden.prioridad = dto.prioridad;
        if (dto.clasificacion != null) {
            orden.clasificacion = dto.clasificacion;
            if (dto.clasificacion === enums_1.ClasificacionOrden.INFRAESTRUCTURA) {
                orden.activoId = null;
            }
        }
        const clasificacionEfectiva = dto.clasificacion ?? orden.clasificacion ?? enums_1.ClasificacionOrden.MAQUINA;
        if (clasificacionEfectiva === enums_1.ClasificacionOrden.MAQUINA) {
            if (dto.activoId !== undefined) {
                if (dto.activoId == null) {
                    throw new common_1.BadRequestException('activoId es obligatorio para OT de máquina');
                }
                const activo = await manager.findOne(activo_entity_1.Activo, {
                    where: { id: dto.activoId },
                });
                if (!activo) {
                    throw new common_1.BadRequestException('Activo no encontrado');
                }
                if (activo.sucursalId !== orden.sucursalId) {
                    throw new common_1.BadRequestException('El activo no pertenece a la sucursal de la OT');
                }
                orden.activoId = dto.activoId;
            }
            else if (dto.clasificacion === enums_1.ClasificacionOrden.MAQUINA &&
                orden.activoId == null) {
                throw new common_1.BadRequestException('Debe indicar activoId al clasificar como máquina');
            }
        }
        if (dto.asignadoAId !== undefined) {
            if (dto.asignadoAId == null) {
                orden.asignadoAId = null;
                if (orden.estado === enums_1.EstadoOrdenTrabajo.ASIGNADA) {
                    orden.estado = enums_1.EstadoOrdenTrabajo.PENDIENTE;
                }
            }
            else {
                const tecnico = await manager.findOne(usuario_entity_1.Usuario, {
                    where: { id: dto.asignadoAId, rol: enums_1.RolUsuario.TECNICO },
                });
                if (!tecnico?.estaActivo) {
                    throw new common_1.BadRequestException('Técnico no válido o inactivo');
                }
                orden.asignadoAId = dto.asignadoAId;
                if (orden.estado === enums_1.EstadoOrdenTrabajo.PENDIENTE) {
                    orden.estado = enums_1.EstadoOrdenTrabajo.ASIGNADA;
                }
            }
        }
        await this.ordenRepo().save(orden);
        return this.findOne(id);
    }
    async remove(id) {
        const orden = await this.findOne(id);
        this.assertOrdenEditable(orden.estado);
        const result = await this.ordenRepo().softDelete(id);
        if (!result.affected) {
            throw new common_1.NotFoundException(`Orden de trabajo ${id} no encontrada`);
        }
    }
    async asignar(id, dto) {
        const manager = this.transactionContext.getManager(this.dataSource);
        const tecnico = await manager.findOne(usuario_entity_1.Usuario, {
            where: { id: dto.tecnicoId, rol: enums_1.RolUsuario.TECNICO },
        });
        if (!tecnico?.estaActivo) {
            throw new common_1.BadRequestException('Técnico no válido o inactivo');
        }
        const orden = await this.findOne(id);
        if (orden.estado !== enums_1.EstadoOrdenTrabajo.PENDIENTE &&
            orden.estado !== enums_1.EstadoOrdenTrabajo.ASIGNADA) {
            throw new common_1.BadRequestException('Solo se puede asignar técnico en OT pendiente o asignada');
        }
        orden.asignadoAId = dto.tecnicoId;
        orden.estado = enums_1.EstadoOrdenTrabajo.ASIGNADA;
        await this.ordenRepo().save(orden);
        const updated = await this.findOne(id);
        return {
            ...updated,
            tecnicoAsignado: updated.asignadoA,
        };
    }
    async updateEstado(id, estado, tecnicoId, urlFotoAntes) {
        if (estado === enums_1.EstadoOrdenTrabajo.EN_PROCESO) {
            if (!urlFotoAntes) {
                throw new common_1.BadRequestException('La foto_antes es obligatoria para iniciar el trabajo');
            }
            return this.iniciarConEvidencia(id, tecnicoId, urlFotoAntes);
        }
        throw new common_1.BadRequestException(`Transición de estado no permitida para el técnico: ${estado}`);
    }
    async cerrarConArchivos(id, tecnicoId, comentario, urlDespues, repuestos = []) {
        const ordenPrev = await this.findOne(id);
        if (ordenPrev.asignadoAId != null &&
            !this.esTecnicoAsignado(ordenPrev.asignadoAId, tecnicoId)) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede cerrar esta orden');
        }
        if (ordenPrev.estado !== enums_1.EstadoOrdenTrabajo.EN_PROCESO) {
            throw new common_1.BadRequestException('Solo se pueden cerrar órdenes en estado en_proceso');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const manager = queryRunner.manager;
            const costoMateriales = await this.inventarioService.procesarConsumoEnTransaccion(manager, id, repuestos);
            const comentarioEnt = manager.getRepository(comentario_ot_entity_1.ComentarioOt).create({
                ordenTrabajoId: id,
                autorId: tecnicoId,
                comentario,
            });
            await manager.getRepository(comentario_ot_entity_1.ComentarioOt).save(comentarioEnt);
            const evidencia = manager.getRepository(evidencia_ot_entity_1.EvidenciaOt).create({
                ordenTrabajoId: id,
                cargadoPorId: tecnicoId,
                tipoEvidencia: enums_1.TipoEvidencia.DESPUES,
                urlImagen: urlDespues,
            });
            await manager.getRepository(evidencia_ot_entity_1.EvidenciaOt).save(evidencia);
            await manager.getRepository(orden_trabajo_entity_1.OrdenTrabajo).update(id, {
                estado: enums_1.EstadoOrdenTrabajo.FINALIZADA,
                fechaFinReal: new Date(),
                costoMateriales: String(costoMateriales),
            });
            await queryRunner.commitTransaction();
        }
        catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        }
        finally {
            await queryRunner.release();
        }
        return this.findOne(id);
    }
    esTecnicoAsignado(asignadoAId, tecnicoId) {
        return (asignadoAId != null && Number(asignadoAId) === Number(tecnicoId));
    }
    async iniciarConEvidencia(id, tecnicoId, urlFotoAntes) {
        const orden = await this.findOne(id);
        if (orden.asignadoAId != null &&
            !this.esTecnicoAsignado(orden.asignadoAId, tecnicoId)) {
            (0, agent_debug_log_1.agentDebugLog)({ runId: 'post-fix', hypothesisId: 'D', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'rejected wrong tecnico', data: { id, asignadoAId: orden.asignadoAId, tecnicoId } });
            throw new common_1.BadRequestException('Solo el técnico asignado puede iniciar esta orden');
        }
        if (orden.estado !== enums_1.EstadoOrdenTrabajo.ASIGNADA &&
            orden.estado !== enums_1.EstadoOrdenTrabajo.PENDIENTE) {
            (0, agent_debug_log_1.agentDebugLog)({ runId: 'post-fix', hypothesisId: 'D', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'rejected bad estado', data: { id, estado: orden.estado, tecnicoId } });
            throw new common_1.BadRequestException('Solo se pueden iniciar órdenes pendientes o asignadas');
        }
        if (orden.asignadoAId == null) {
            orden.asignadoAId = tecnicoId;
        }
        const evidenciaAntes = await this.evidenciaRepo().findOne({
            where: {
                ordenTrabajoId: id,
                tipoEvidencia: enums_1.TipoEvidencia.ANTES,
            },
        });
        if (!evidenciaAntes) {
            await this.agregarEvidencia(id, tecnicoId, {
                tipoEvidencia: enums_1.TipoEvidencia.ANTES,
                urlImagen: urlFotoAntes,
            });
        }
        await this.ordenRepo().update(id, {
            estado: enums_1.EstadoOrdenTrabajo.EN_PROCESO,
            fechaInicioReal: new Date(),
            asignadoAId: orden.asignadoAId,
        });
        const refreshed = await this.findOne(id);
        (0, agent_debug_log_1.agentDebugLog)({ runId: 'post-fix', hypothesisId: 'B,C', location: 'ordenes-trabajo.service.ts:iniciarConEvidencia', message: 'after update', data: { id, estado: refreshed.estado, fechaInicioReal: refreshed.fechaInicioReal, asignadoAId: refreshed.asignadoAId } });
        return refreshed;
    }
    async iniciar(id, tecnicoId) {
        throw new common_1.BadRequestException('Use PATCH /ordenes-trabajo/:id/estado con foto_antes para iniciar');
    }
    async agregarComentario(ordenId, autorId, dto) {
        await this.findOne(ordenId);
        const comentario = this.comentarioRepo().create({
            ordenTrabajoId: ordenId,
            autorId,
            comentario: dto.comentario,
        });
        return this.comentarioRepo().save(comentario);
    }
    async agregarEvidencia(ordenId, cargadoPorId, dto) {
        await this.findOne(ordenId);
        const evidencia = this.evidenciaRepo().create({
            ordenTrabajoId: ordenId,
            tipoEvidencia: dto.tipoEvidencia,
            urlImagen: dto.urlImagen,
            cargadoPorId,
        });
        return this.evidenciaRepo().save(evidencia);
    }
    async cerrar(id, tecnicoId, dto) {
        const orden = await this.findOne(id);
        if (!this.esTecnicoAsignado(orden.asignadoAId, tecnicoId)) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede cerrar esta orden');
        }
        const tiposEnviados = new Set(dto.evidencias.map((e) => e.tipoEvidencia));
        if (!tiposEnviados.has(enums_1.TipoEvidencia.ANTES) ||
            !tiposEnviados.has(enums_1.TipoEvidencia.DESPUES)) {
            throw new common_1.BadRequestException('Debe incluir al menos una evidencia "antes" y una "despues"');
        }
        for (const evidenciaDto of dto.evidencias) {
            await this.agregarEvidencia(id, tecnicoId, evidenciaDto);
        }
        orden.estado = enums_1.EstadoOrdenTrabajo.FINALIZADA;
        orden.fechaFinReal = new Date();
        return this.ordenRepo().save(orden);
    }
    async aprobar(id) {
        const orden = await this.findOne(id);
        if (orden.estado !== enums_1.EstadoOrdenTrabajo.FINALIZADA) {
            throw new common_1.BadRequestException('Solo se pueden aprobar órdenes en estado finalizada');
        }
        orden.estado = enums_1.EstadoOrdenTrabajo.APROBADA;
        orden.motivoRechazo = null;
        orden.fechaAprobacion = new Date();
        await this.ordenRepo().save(orden);
        return this.findOne(id);
    }
    static REVERTIR_APROBACION_MS = 2 * 60 * 1000;
    async revertirAprobacion(id) {
        const orden = await this.findOne(id);
        if (orden.estado !== enums_1.EstadoOrdenTrabajo.APROBADA) {
            throw new common_1.BadRequestException('Solo se puede revertir una orden aprobada en el archivo histórico');
        }
        if (!orden.fechaAprobacion) {
            throw new common_1.BadRequestException('No se puede revertir: falta fecha de aprobación');
        }
        const elapsed = Date.now() - new Date(orden.fechaAprobacion).getTime();
        if (elapsed > OrdenesTrabajoService_1.REVERTIR_APROBACION_MS) {
            throw new common_1.BadRequestException('El plazo de 2 minutos para revertir la aprobación ha expirado');
        }
        orden.estado = enums_1.EstadoOrdenTrabajo.FINALIZADA;
        orden.fechaAprobacion = null;
        await this.ordenRepo().save(orden);
        return this.findOne(id);
    }
    async rechazar(id, motivo) {
        const orden = await this.findOne(id);
        const motivoRechazo = motivo.trim();
        if (motivoRechazo.length < 3) {
            throw new common_1.BadRequestException('El motivo de rechazo debe tener al menos 3 caracteres');
        }
        if (orden.estado === enums_1.EstadoOrdenTrabajo.FINALIZADA) {
            orden.estado = enums_1.EstadoOrdenTrabajo.EN_PROCESO;
            orden.fechaFinReal = null;
            orden.motivoRechazo = motivoRechazo;
            await this.ordenRepo().save(orden);
            return this.findOne(id);
        }
        if (orden.estado === enums_1.EstadoOrdenTrabajo.PENDIENTE) {
            orden.estado = enums_1.EstadoOrdenTrabajo.RECHAZADA;
            orden.motivoRechazo = motivoRechazo;
            orden.asignadoAId = null;
            await this.ordenRepo().save(orden);
            return this.findOne(id);
        }
        throw new common_1.BadRequestException('Solo se pueden rechazar tickets en estado pendiente o cierres en estado finalizada');
    }
};
exports.OrdenesTrabajoService = OrdenesTrabajoService;
exports.OrdenesTrabajoService = OrdenesTrabajoService = OrdenesTrabajoService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService,
        inventario_service_1.InventarioService])
], OrdenesTrabajoService);
//# sourceMappingURL=ordenes-trabajo.service.js.map
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
exports.OrdenesTrabajoService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const transaction_context_service_1 = require("../common/database/transaction-context.service");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const evidencia_ot_entity_1 = require("../entities/evidencia-ot.entity");
const comentario_ot_entity_1 = require("../entities/comentario-ot.entity");
let OrdenesTrabajoService = class OrdenesTrabajoService {
    dataSource;
    transactionContext;
    constructor(dataSource, transactionContext) {
        this.dataSource = dataSource;
        this.transactionContext = transactionContext;
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
        const year = new Date().getFullYear();
        const count = await this.ordenRepo().count();
        return `OT-${year}-${String(count + 1).padStart(5, '0')}`;
    }
    findAll(filters) {
        const qb = this.ordenRepo()
            .createQueryBuilder('ot')
            .leftJoinAndSelect('ot.activo', 'activo')
            .leftJoinAndSelect('ot.sucursal', 'sucursal')
            .leftJoinAndSelect('ot.creadoPor', 'creadoPor')
            .leftJoinAndSelect('ot.asignadoA', 'asignadoA')
            .orderBy('ot.createdAt', 'DESC');
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
        return qb.getMany();
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
    async create(dto, creadoPorId) {
        const orden = this.ordenRepo().create({
            codigoOt: await this.generarCodigoOt(),
            activoId: dto.activoId ?? null,
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
        return this.ordenRepo().save(orden);
    }
    async update(id, dto) {
        const orden = await this.findOne(id);
        Object.assign(orden, {
            ...dto,
            fechaProgramacion: dto.fechaProgramacion
                ? new Date(dto.fechaProgramacion)
                : orden.fechaProgramacion,
        });
        return this.ordenRepo().save(orden);
    }
    async asignar(id, dto) {
        const orden = await this.findOne(id);
        orden.asignadoAId = dto.asignadoAId;
        orden.estado = enums_1.EstadoOrdenTrabajo.ASIGNADA;
        return this.ordenRepo().save(orden);
    }
    async iniciar(id, tecnicoId) {
        const orden = await this.findOne(id);
        if (orden.asignadoAId !== tecnicoId) {
            throw new common_1.BadRequestException('Solo el técnico asignado puede iniciar esta orden');
        }
        orden.estado = enums_1.EstadoOrdenTrabajo.EN_PROCESO;
        orden.fechaInicioReal = new Date();
        return this.ordenRepo().save(orden);
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
        if (orden.asignadoAId !== tecnicoId) {
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
        const evidencias = await this.evidenciaRepo().find({
            where: { ordenTrabajoId: id },
        });
        const tipos = new Set(evidencias.map((e) => e.tipoEvidencia));
        if (!tipos.has(enums_1.TipoEvidencia.ANTES) ||
            !tipos.has(enums_1.TipoEvidencia.DESPUES)) {
            throw new common_1.BadRequestException('La orden debe tener evidencias antes y después para ser aprobada');
        }
        orden.estado = enums_1.EstadoOrdenTrabajo.APROBADA;
        return this.ordenRepo().save(orden);
    }
};
exports.OrdenesTrabajoService = OrdenesTrabajoService;
exports.OrdenesTrabajoService = OrdenesTrabajoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        transaction_context_service_1.TransactionContextService])
], OrdenesTrabajoService);
//# sourceMappingURL=ordenes-trabajo.service.js.map
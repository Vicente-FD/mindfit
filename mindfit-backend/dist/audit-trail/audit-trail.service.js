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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditTrailService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const enums_1 = require("../common/enums");
const audit_trail_entity_1 = require("../entities/audit-trail.entity");
const ESTADO_OT_LABEL = {
    pendiente: 'pendiente',
    asignada: 'asignada',
    en_proceso: 'en proceso',
    finalizada: 'finalizada',
    aprobada: 'aprobada',
};
const TABLA_LABEL = {
    ordenes_trabajo: 'Orden de trabajo',
    activos: 'Activo',
};
let AuditTrailService = class AuditTrailService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    async findAll(filters) {
        const page = filters.page ?? 1;
        const limit = filters.limit ?? 30;
        const skip = (page - 1) * limit;
        const qb = this.repo
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.usuario', 'usuario')
            .orderBy('a.timeStamp', 'DESC')
            .skip(skip)
            .take(limit);
        if (filters.tableName?.trim()) {
            qb.andWhere('a.table_name = :tableName', {
                tableName: filters.tableName.trim(),
            });
        }
        const [rows, total] = await qb.getManyAndCount();
        return {
            data: rows.map((row) => this.toDto(row)),
            meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        };
    }
    toDto(row) {
        return {
            id: row.id,
            timeStamp: row.timeStamp.toISOString(),
            tableName: row.tableName,
            rowPk: row.rowPk,
            operation: row.operation,
            userId: row.userId,
            usuarioNombre: row.usuario?.nombre ?? null,
            mensaje: this.formatMensaje(row),
        };
    }
    formatMensaje(row) {
        const quien = row.usuario?.nombre ?? 'Sistema';
        const tabla = TABLA_LABEL[row.tableName] ?? row.tableName;
        if (row.tableName === 'ordenes_trabajo') {
            return this.formatOrdenTrabajo(row, quien, tabla);
        }
        if (row.tableName === 'activos') {
            return this.formatActivo(row, quien, tabla);
        }
        return `${quien} realizó ${row.operation} en ${tabla} (registro ${row.rowPk})`;
    }
    formatOrdenTrabajo(row, quien, tabla) {
        const codigo = row.newData?.['codigo_ot'] ??
            row.oldData?.['codigo_ot'] ??
            `#${row.rowPk}`;
        if (row.operation === enums_1.OperacionAuditoria.INSERT) {
            const estado = ESTADO_OT_LABEL[String(row.newData?.['estado'])] ?? 'nueva';
            return `${quien} creó ${tabla} ${codigo} en estado «${estado}»`;
        }
        if (row.operation === enums_1.OperacionAuditoria.DELETE) {
            return `${quien} eliminó ${tabla} ${codigo}`;
        }
        const oldEstado = row.oldData?.['estado'];
        const newEstado = row.newData?.['estado'];
        if (oldEstado != null && newEstado != null && oldEstado !== newEstado) {
            const de = ESTADO_OT_LABEL[String(oldEstado)] ?? String(oldEstado);
            const a = ESTADO_OT_LABEL[String(newEstado)] ?? String(newEstado);
            return `${quien} cambió el estado de ${codigo} de «${de}» a «${a}»`;
        }
        if (row.oldData?.['asignado_a_id'] !== row.newData?.['asignado_a_id']) {
            return `${quien} actualizó la asignación de ${codigo}`;
        }
        return `${quien} modificó ${tabla} ${codigo}`;
    }
    formatActivo(row, quien, tabla) {
        const nombre = row.newData?.['nombre'] ??
            row.oldData?.['nombre'] ??
            `#${row.rowPk}`;
        if (row.operation === enums_1.OperacionAuditoria.INSERT) {
            return `${quien} registró ${tabla} «${nombre}»`;
        }
        if (row.operation === enums_1.OperacionAuditoria.DELETE) {
            return `${quien} dio de baja ${tabla} «${nombre}»`;
        }
        const oldEst = row.oldData?.['estado_operacional'];
        const newEst = row.newData?.['estado_operacional'];
        if (oldEst != null && newEst != null && oldEst !== newEst) {
            return `${quien} cambió el estado operacional de «${nombre}» de «${oldEst}» a «${newEst}»`;
        }
        return `${quien} modificó ${tabla} «${nombre}»`;
    }
};
exports.AuditTrailService = AuditTrailService;
exports.AuditTrailService = AuditTrailService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_trail_entity_1.AuditTrail)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditTrailService);
//# sourceMappingURL=audit-trail.service.js.map
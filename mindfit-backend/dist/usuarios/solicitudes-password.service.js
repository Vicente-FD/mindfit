"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SolicitudesPasswordService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const password_reset_events_service_1 = require("../auth/password-reset/password-reset-events.service");
const enums_1 = require("../common/enums");
const audit_trail_entity_1 = require("../entities/audit-trail.entity");
const solicitud_password_entity_1 = require("../entities/solicitud-password.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
let SolicitudesPasswordService = class SolicitudesPasswordService {
    dataSource;
    passwordResetEvents;
    constructor(dataSource, passwordResetEvents) {
        this.dataSource = dataSource;
        this.passwordResetEvents = passwordResetEvents;
    }
    async solicitar(email) {
        const normalized = email.trim().toLowerCase();
        const usuario = await this.dataSource.getRepository(usuario_entity_1.Usuario).findOne({
            where: { email: normalized, estaActivo: true },
        });
        let watchToken;
        if (usuario) {
            const repo = this.dataSource.getRepository(solicitud_password_entity_1.SolicitudPassword);
            let pendiente = await repo.findOne({
                where: {
                    usuarioId: usuario.id,
                    estado: enums_1.EstadoSolicitudPassword.PENDIENTE,
                },
            });
            if (!pendiente) {
                pendiente = await repo.save(repo.create({
                    usuarioId: usuario.id,
                    estado: enums_1.EstadoSolicitudPassword.PENDIENTE,
                    watchToken: (0, crypto_1.randomUUID)(),
                }));
            }
            else if (!pendiente.watchToken) {
                pendiente.watchToken = (0, crypto_1.randomUUID)();
                pendiente = await repo.save(pendiente);
            }
            watchToken = pendiente.watchToken ?? undefined;
            this.passwordResetEvents.emitAdminPendientesChanged();
        }
        return {
            message: 'Si el correo está registrado, un administrador revisará su solicitud de restablecimiento.',
            watchToken,
        };
    }
    async findPendientes() {
        const rows = await this.dataSource.getRepository(solicitud_password_entity_1.SolicitudPassword).find({
            where: { estado: enums_1.EstadoSolicitudPassword.PENDIENTE },
            relations: { usuario: true },
            order: { createdAt: 'ASC' },
        });
        return rows.map((s) => ({
            id: s.id,
            usuarioId: s.usuarioId,
            nombre: s.usuario.nombre,
            email: s.usuario.email,
            rol: s.usuario.rol,
            createdAt: s.createdAt,
        }));
    }
    async aprobar(solicitudId, adminUserId) {
        return this.dataSource.transaction(async (manager) => {
            const solicitudRepo = manager.getRepository(solicitud_password_entity_1.SolicitudPassword);
            const usuarioRepo = manager.getRepository(usuario_entity_1.Usuario);
            const auditRepo = manager.getRepository(audit_trail_entity_1.AuditTrail);
            const solicitud = await solicitudRepo.findOne({
                where: { id: solicitudId },
                relations: { usuario: true },
            });
            if (!solicitud) {
                throw new common_1.NotFoundException(`Solicitud ${solicitudId} no encontrada`);
            }
            if (solicitud.estado !== enums_1.EstadoSolicitudPassword.PENDIENTE) {
                throw new common_1.BadRequestException('La solicitud ya fue procesada');
            }
            const usuario = solicitud.usuario;
            if (!usuario?.estaActivo) {
                throw new common_1.BadRequestException('El usuario asociado no está activo');
            }
            const contrasenaTemporal = this.generateReadablePassword();
            const passwordHash = await bcrypt.hash(contrasenaTemporal, 12);
            const tokenVersionAnterior = usuario.tokenVersion ?? 0;
            usuario.passwordHash = passwordHash;
            usuario.requiereCambioPassword = true;
            usuario.tokenVersion = tokenVersionAnterior + 1;
            await usuarioRepo.save(usuario);
            solicitud.estado = enums_1.EstadoSolicitudPassword.PROCESADO;
            solicitud.contrasenaTemporalLegible = contrasenaTemporal;
            await solicitudRepo.save(solicitud);
            await auditRepo.save({
                tableName: 'solicitudes_password',
                rowPk: String(solicitud.id),
                operation: enums_1.OperacionAuditoria.UPDATE,
                userId: adminUserId,
                oldData: {
                    estado: enums_1.EstadoSolicitudPassword.PENDIENTE,
                    usuarioId: usuario.id,
                },
                newData: {
                    estado: enums_1.EstadoSolicitudPassword.PROCESADO,
                    usuarioId: usuario.id,
                    requiereCambioPassword: true,
                    tokenVersion: usuario.tokenVersion,
                    aprobadoPorId: adminUserId,
                },
            });
            const result = {
                solicitudId: solicitud.id,
                usuarioId: usuario.id,
                contrasenaTemporal,
            };
            if (solicitud.watchToken) {
                this.passwordResetEvents.emitPasswordResetCompleted(solicitud.watchToken, {
                    contrasenaTemporal,
                    solicitudId: solicitud.id,
                });
            }
            this.passwordResetEvents.emitAdminPendientesChanged();
            return result;
        });
    }
    async rechazar(solicitudId, adminUserId) {
        return this.dataSource.transaction(async (manager) => {
            const solicitudRepo = manager.getRepository(solicitud_password_entity_1.SolicitudPassword);
            const auditRepo = manager.getRepository(audit_trail_entity_1.AuditTrail);
            const solicitud = await solicitudRepo.findOne({
                where: { id: solicitudId },
                relations: { usuario: true },
            });
            if (!solicitud) {
                throw new common_1.NotFoundException(`Solicitud ${solicitudId} no encontrada`);
            }
            if (solicitud.estado !== enums_1.EstadoSolicitudPassword.PENDIENTE) {
                throw new common_1.BadRequestException('La solicitud ya fue procesada');
            }
            solicitud.estado = enums_1.EstadoSolicitudPassword.RECHAZADO;
            await solicitudRepo.save(solicitud);
            await auditRepo.save({
                tableName: 'solicitudes_password',
                rowPk: String(solicitud.id),
                operation: enums_1.OperacionAuditoria.UPDATE,
                userId: adminUserId,
                oldData: {
                    estado: enums_1.EstadoSolicitudPassword.PENDIENTE,
                    usuarioId: solicitud.usuarioId,
                },
                newData: {
                    estado: enums_1.EstadoSolicitudPassword.RECHAZADO,
                    usuarioId: solicitud.usuarioId,
                    rechazadoPorId: adminUserId,
                },
            });
            if (solicitud.watchToken) {
                this.passwordResetEvents.emitPasswordResetRejected(solicitud.watchToken, {
                    solicitudId: solicitud.id,
                    message: 'El administrador rechazó su solicitud de restablecimiento de contraseña.',
                });
            }
            this.passwordResetEvents.emitAdminPendientesChanged();
            return { solicitudId: solicitud.id };
        });
    }
    generateReadablePassword() {
        const words = ['Mindfit', 'Tempo', 'Acceso', 'Clave', 'Secure', 'Ops'];
        const tails = ['Flow', 'Pass', 'Key', 'Lock', 'Safe', 'Run'];
        const word = words[(0, crypto_1.randomInt)(words.length)];
        const tail = tails[(0, crypto_1.randomInt)(tails.length)];
        const num = (0, crypto_1.randomInt)(100, 999);
        const code = (0, crypto_1.randomBytes)(2).toString('hex').toUpperCase();
        return `${word}${tail}${code}${num}!`;
    }
};
exports.SolicitudesPasswordService = SolicitudesPasswordService;
exports.SolicitudesPasswordService = SolicitudesPasswordService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        password_reset_events_service_1.PasswordResetEventsService])
], SolicitudesPasswordService);
//# sourceMappingURL=solicitudes-password.service.js.map
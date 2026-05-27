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
exports.SolicitudPassword = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const usuario_entity_1 = require("./usuario.entity");
let SolicitudPassword = class SolicitudPassword {
    id;
    usuarioId;
    usuario;
    estado;
    contrasenaTemporalLegible;
    watchToken;
    createdAt;
    updatedAt;
};
exports.SolicitudPassword = SolicitudPassword;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], SolicitudPassword.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'int' }),
    __metadata("design:type", Number)
], SolicitudPassword.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], SolicitudPassword.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.EstadoSolicitudPassword,
        default: enums_1.EstadoSolicitudPassword.PENDIENTE,
    }),
    __metadata("design:type", String)
], SolicitudPassword.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'contrasena_temporal_legible',
        type: 'varchar',
        length: 120,
        nullable: true,
    }),
    __metadata("design:type", Object)
], SolicitudPassword.prototype, "contrasenaTemporalLegible", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'watch_token', type: 'varchar', length: 64, unique: true, nullable: true }),
    __metadata("design:type", Object)
], SolicitudPassword.prototype, "watchToken", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], SolicitudPassword.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], SolicitudPassword.prototype, "updatedAt", void 0);
exports.SolicitudPassword = SolicitudPassword = __decorate([
    (0, typeorm_1.Entity)('solicitudes_password')
], SolicitudPassword);
//# sourceMappingURL=solicitud-password.entity.js.map
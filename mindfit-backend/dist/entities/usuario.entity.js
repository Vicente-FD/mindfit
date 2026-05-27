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
exports.Usuario = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const sucursal_entity_1 = require("./sucursal.entity");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
const evidencia_ot_entity_1 = require("./evidencia-ot.entity");
const comentario_ot_entity_1 = require("./comentario-ot.entity");
const audit_trail_entity_1 = require("./audit-trail.entity");
let Usuario = class Usuario {
    id;
    email;
    passwordHash;
    nombre;
    rol;
    sucursalId;
    sucursal;
    telefono;
    estaActivo;
    estadoSesion;
    permisosUi;
    tokenVersion;
    requiereCambioPassword;
    createdAt;
    updatedAt;
    deletedAt;
    ordenesCreadas;
    ordenesAsignadas;
    evidenciasCargadas;
    comentarios;
    auditorias;
};
exports.Usuario = Usuario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Usuario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], Usuario.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'password_hash', type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Usuario.prototype, "passwordHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Usuario.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.RolUsuario }),
    __metadata("design:type", String)
], Usuario.prototype, "rol", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, (sucursal) => sucursal.usuarios, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", Object)
], Usuario.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Usuario.prototype, "telefono", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'esta_activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "estaActivo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'estado_sesion',
        type: 'varchar',
        length: 20,
        default: enums_1.EstadoSesionUsuario.DESCONECTADO,
    }),
    __metadata("design:type", String)
], Usuario.prototype, "estadoSesion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'permisos_ui', type: 'jsonb', default: () => "'{}'" }),
    __metadata("design:type", Object)
], Usuario.prototype, "permisosUi", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'token_version', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Usuario.prototype, "tokenVersion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'requiere_cambio_password', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], Usuario.prototype, "requiereCambioPassword", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Usuario.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Usuario.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Object)
], Usuario.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.creadoPor),
    __metadata("design:type", Array)
], Usuario.prototype, "ordenesCreadas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.asignadoA),
    __metadata("design:type", Array)
], Usuario.prototype, "ordenesAsignadas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evidencia_ot_entity_1.EvidenciaOt, (evidencia) => evidencia.cargadoPor),
    __metadata("design:type", Array)
], Usuario.prototype, "evidenciasCargadas", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comentario_ot_entity_1.ComentarioOt, (comentario) => comentario.autor),
    __metadata("design:type", Array)
], Usuario.prototype, "comentarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => audit_trail_entity_1.AuditTrail, (audit) => audit.usuario),
    __metadata("design:type", Array)
], Usuario.prototype, "auditorias", void 0);
exports.Usuario = Usuario = __decorate([
    (0, typeorm_1.Entity)('usuarios')
], Usuario);
//# sourceMappingURL=usuario.entity.js.map
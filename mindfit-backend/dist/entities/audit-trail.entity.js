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
exports.AuditTrail = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const usuario_entity_1 = require("./usuario.entity");
let AuditTrail = class AuditTrail {
    id;
    timeStamp;
    tableName;
    rowPk;
    operation;
    userId;
    usuario;
    oldData;
    newData;
};
exports.AuditTrail = AuditTrail;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)({ type: 'bigint' }),
    __metadata("design:type", String)
], AuditTrail.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'time_stamp', type: 'timestamptz', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], AuditTrail.prototype, "timeStamp", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'table_name', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AuditTrail.prototype, "tableName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'row_pk', type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], AuditTrail.prototype, "rowPk", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.OperacionAuditoria }),
    __metadata("design:type", String)
], AuditTrail.prototype, "operation", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], AuditTrail.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.auditorias, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], AuditTrail.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'old_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditTrail.prototype, "oldData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'new_data', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], AuditTrail.prototype, "newData", void 0);
exports.AuditTrail = AuditTrail = __decorate([
    (0, typeorm_1.Entity)('audit_trail')
], AuditTrail);
//# sourceMappingURL=audit-trail.entity.js.map
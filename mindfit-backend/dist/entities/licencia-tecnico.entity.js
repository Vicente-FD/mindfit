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
exports.LicenciaTecnico = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
let LicenciaTecnico = class LicenciaTecnico {
    id;
    tecnicoId;
    tecnico;
    tipoLicencia;
    fechaVencimiento;
    documentoUrl;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.LicenciaTecnico = LicenciaTecnico;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], LicenciaTecnico.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tecnico_id', type: 'int', unique: true }),
    __metadata("design:type", Number)
], LicenciaTecnico.prototype, "tecnicoId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tecnico_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], LicenciaTecnico.prototype, "tecnico", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_licencia', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], LicenciaTecnico.prototype, "tipoLicencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento', type: 'date' }),
    __metadata("design:type", String)
], LicenciaTecnico.prototype, "fechaVencimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'documento_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], LicenciaTecnico.prototype, "documentoUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], LicenciaTecnico.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], LicenciaTecnico.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Object)
], LicenciaTecnico.prototype, "deletedAt", void 0);
exports.LicenciaTecnico = LicenciaTecnico = __decorate([
    (0, typeorm_1.Entity)('licencias_tecnicos')
], LicenciaTecnico);
//# sourceMappingURL=licencia-tecnico.entity.js.map
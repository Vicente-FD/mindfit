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
exports.PlanPreventivo = void 0;
const typeorm_1 = require("typeorm");
const activo_entity_1 = require("./activo.entity");
let PlanPreventivo = class PlanPreventivo {
    id;
    titulo;
    descripcion;
    activoId;
    equipo;
    intervaloDias;
    proximaFechaEjecucion;
    planActivo;
    createdAt;
    updatedAt;
};
exports.PlanPreventivo = PlanPreventivo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlanPreventivo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], PlanPreventivo.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], PlanPreventivo.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo_id', type: 'int' }),
    __metadata("design:type", Number)
], PlanPreventivo.prototype, "activoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activo_entity_1.Activo, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'activo_id' }),
    __metadata("design:type", activo_entity_1.Activo)
], PlanPreventivo.prototype, "equipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'intervalo_dias', type: 'int' }),
    __metadata("design:type", Number)
], PlanPreventivo.prototype, "intervaloDias", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'proxima_fecha_ejecucion', type: 'date' }),
    __metadata("design:type", String)
], PlanPreventivo.prototype, "proximaFechaEjecucion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PlanPreventivo.prototype, "planActivo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], PlanPreventivo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], PlanPreventivo.prototype, "updatedAt", void 0);
exports.PlanPreventivo = PlanPreventivo = __decorate([
    (0, typeorm_1.Entity)('planes_preventivos')
], PlanPreventivo);
//# sourceMappingURL=plan-preventivo.entity.js.map
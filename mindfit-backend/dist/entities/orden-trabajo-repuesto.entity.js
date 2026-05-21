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
exports.OrdenTrabajoRepuesto = void 0;
const typeorm_1 = require("typeorm");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
const repuesto_entity_1 = require("./repuesto.entity");
let OrdenTrabajoRepuesto = class OrdenTrabajoRepuesto {
    id;
    ordenTrabajoId;
    ordenTrabajo;
    repuestoId;
    repuesto;
    cantidadUsada;
    costoUnitarioAplicado;
    createdAt;
};
exports.OrdenTrabajoRepuesto = OrdenTrabajoRepuesto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdenTrabajoRepuesto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_trabajo_id', type: 'int' }),
    __metadata("design:type", Number)
], OrdenTrabajoRepuesto.prototype, "ordenTrabajoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.consumoRepuestos, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_trabajo_id' }),
    __metadata("design:type", orden_trabajo_entity_1.OrdenTrabajo)
], OrdenTrabajoRepuesto.prototype, "ordenTrabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'repuesto_id', type: 'int' }),
    __metadata("design:type", Number)
], OrdenTrabajoRepuesto.prototype, "repuestoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => repuesto_entity_1.Repuesto, (repuesto) => repuesto.consumos, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'repuesto_id' }),
    __metadata("design:type", repuesto_entity_1.Repuesto)
], OrdenTrabajoRepuesto.prototype, "repuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_usada', type: 'int' }),
    __metadata("design:type", Number)
], OrdenTrabajoRepuesto.prototype, "cantidadUsada", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_unitario_aplicado',
        type: 'decimal',
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", String)
], OrdenTrabajoRepuesto.prototype, "costoUnitarioAplicado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OrdenTrabajoRepuesto.prototype, "createdAt", void 0);
exports.OrdenTrabajoRepuesto = OrdenTrabajoRepuesto = __decorate([
    (0, typeorm_1.Entity)('orden_trabajo_repuestos')
], OrdenTrabajoRepuesto);
//# sourceMappingURL=orden-trabajo-repuesto.entity.js.map
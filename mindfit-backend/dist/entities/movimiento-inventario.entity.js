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
exports.MovimientoInventario = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
const repuesto_entity_1 = require("./repuesto.entity");
const sucursal_entity_1 = require("./sucursal.entity");
const usuario_entity_1 = require("./usuario.entity");
let MovimientoInventario = class MovimientoInventario {
    id;
    sucursalId;
    sucursal;
    repuestoId;
    repuesto;
    usuarioId;
    usuario;
    tipoMovimiento;
    cantidad;
    costoUnitarioMomento;
    ordenTrabajoId;
    ordenTrabajo;
    motivo;
    createdAt;
};
exports.MovimientoInventario = MovimientoInventario;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int' }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", sucursal_entity_1.Sucursal)
], MovimientoInventario.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'repuesto_id', type: 'int' }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "repuestoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => repuesto_entity_1.Repuesto, (repuesto) => repuesto.movimientos, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'repuesto_id' }),
    __metadata("design:type", repuesto_entity_1.Repuesto)
], MovimientoInventario.prototype, "repuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'int' }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], MovimientoInventario.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_movimiento', type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "tipoMovimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], MovimientoInventario.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_unitario_momento',
        type: 'decimal',
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "costoUnitarioMomento", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_trabajo_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], MovimientoInventario.prototype, "ordenTrabajoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_trabajo_entity_1.OrdenTrabajo, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_trabajo_id' }),
    __metadata("design:type", Object)
], MovimientoInventario.prototype, "ordenTrabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], MovimientoInventario.prototype, "motivo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], MovimientoInventario.prototype, "createdAt", void 0);
exports.MovimientoInventario = MovimientoInventario = __decorate([
    (0, typeorm_1.Entity)('movimientos_inventario')
], MovimientoInventario);
//# sourceMappingURL=movimiento-inventario.entity.js.map
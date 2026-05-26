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
exports.CotizacionVentaHistorial = void 0;
const typeorm_1 = require("typeorm");
const cotizacion_venta_entity_1 = require("./cotizacion-venta.entity");
const usuario_entity_1 = require("./usuario.entity");
let CotizacionVentaHistorial = class CotizacionVentaHistorial {
    id;
    cotizacionId;
    cotizacion;
    usuarioId;
    usuario;
    tipo;
    resumen;
    cambios;
    createdAt;
};
exports.CotizacionVentaHistorial = CotizacionVentaHistorial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CotizacionVentaHistorial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cotizacion_id', type: 'int' }),
    __metadata("design:type", Number)
], CotizacionVentaHistorial.prototype, "cotizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cotizacion_venta_entity_1.CotizacionVenta, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'cotizacion_id' }),
    __metadata("design:type", cotizacion_venta_entity_1.CotizacionVenta)
], CotizacionVentaHistorial.prototype, "cotizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'usuario_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVentaHistorial.prototype, "usuarioId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'usuario_id' }),
    __metadata("design:type", Object)
], CotizacionVentaHistorial.prototype, "usuario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 30 }),
    __metadata("design:type", String)
], CotizacionVentaHistorial.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], CotizacionVentaHistorial.prototype, "resumen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVentaHistorial.prototype, "cambios", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CotizacionVentaHistorial.prototype, "createdAt", void 0);
exports.CotizacionVentaHistorial = CotizacionVentaHistorial = __decorate([
    (0, typeorm_1.Entity)('cotizacion_ventas_historial')
], CotizacionVentaHistorial);
//# sourceMappingURL=cotizacion-venta-historial.entity.js.map
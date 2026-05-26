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
exports.CotizacionVentasDetalle = void 0;
const typeorm_1 = require("typeorm");
const activo_entity_1 = require("./activo.entity");
const repuesto_entity_1 = require("./repuesto.entity");
const cotizacion_venta_entity_1 = require("./cotizacion-venta.entity");
let CotizacionVentasDetalle = class CotizacionVentasDetalle {
    id;
    cotizacionId;
    cotizacion;
    activoId;
    activo;
    repuestoId;
    repuesto;
    skuEstatico;
    nombreEstatico;
    categoriaEstatica;
    cantidad;
    precioUnitarioPactado;
    totalLineaNeto;
    costoHistoricoClp;
};
exports.CotizacionVentasDetalle = CotizacionVentasDetalle;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CotizacionVentasDetalle.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cotizacion_id', type: 'int' }),
    __metadata("design:type", Number)
], CotizacionVentasDetalle.prototype, "cotizacionId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cotizacion_venta_entity_1.CotizacionVenta, (c) => c.detalles, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'cotizacion_id' }),
    __metadata("design:type", cotizacion_venta_entity_1.CotizacionVenta)
], CotizacionVentasDetalle.prototype, "cotizacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVentasDetalle.prototype, "activoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activo_entity_1.Activo, { nullable: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'activo_id' }),
    __metadata("design:type", Object)
], CotizacionVentasDetalle.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'repuesto_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVentasDetalle.prototype, "repuestoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => repuesto_entity_1.Repuesto, { nullable: true, onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'repuesto_id' }),
    __metadata("design:type", Object)
], CotizacionVentasDetalle.prototype, "repuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sku_estatico', type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], CotizacionVentasDetalle.prototype, "skuEstatico", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'nombre_estatico', type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], CotizacionVentasDetalle.prototype, "nombreEstatico", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'categoria_estatica',
        type: 'varchar',
        length: 100,
        nullable: true,
    }),
    __metadata("design:type", Object)
], CotizacionVentasDetalle.prototype, "categoriaEstatica", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], CotizacionVentasDetalle.prototype, "cantidad", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'precio_unitario_pactado',
        type: 'decimal',
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", String)
], CotizacionVentasDetalle.prototype, "precioUnitarioPactado", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'total_linea_neto',
        type: 'decimal',
        precision: 12,
        scale: 2,
    }),
    __metadata("design:type", String)
], CotizacionVentasDetalle.prototype, "totalLineaNeto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_historico_clp',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], CotizacionVentasDetalle.prototype, "costoHistoricoClp", void 0);
exports.CotizacionVentasDetalle = CotizacionVentasDetalle = __decorate([
    (0, typeorm_1.Entity)('cotizacion_ventas_detalles')
], CotizacionVentasDetalle);
//# sourceMappingURL=cotizacion-ventas-detalle.entity.js.map
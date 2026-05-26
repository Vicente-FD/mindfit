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
exports.CotizacionVenta = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const cliente_entity_1 = require("./cliente.entity");
const usuario_entity_1 = require("./usuario.entity");
const oportunidad_entity_1 = require("./oportunidad.entity");
const cotizacion_ventas_detalle_entity_1 = require("./cotizacion-ventas-detalle.entity");
let CotizacionVenta = class CotizacionVenta {
    id;
    folio;
    clienteId;
    cliente;
    creadoPorId;
    creadoPor;
    oportunidadId;
    oportunidad;
    divisaCodigo;
    tasaCambioClp;
    subtotalNeto;
    montoIva;
    montoBruto;
    comentariosComerciales;
    estado;
    createdAt;
    updatedAt;
    detalles;
};
exports.CotizacionVenta = CotizacionVenta;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], CotizacionVenta.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "folio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'int' }),
    __metadata("design:type", Number)
], CotizacionVenta.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, (c) => c.cotizaciones, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], CotizacionVenta.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creado_por_id', type: 'int' }),
    __metadata("design:type", Number)
], CotizacionVenta.prototype, "creadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'creado_por_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], CotizacionVenta.prototype, "creadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'oportunidad_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVenta.prototype, "oportunidadId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => oportunidad_entity_1.Oportunidad, (o) => o.cotizaciones, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'oportunidad_id' }),
    __metadata("design:type", Object)
], CotizacionVenta.prototype, "oportunidad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'divisa_codigo', type: 'varchar', length: 3, default: 'CLP' }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "divisaCodigo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'tasa_cambio_clp',
        type: 'decimal',
        precision: 12,
        scale: 6,
        default: 1,
    }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "tasaCambioClp", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'subtotal_neto',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "subtotalNeto", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'monto_iva',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "montoIva", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'monto_bruto',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "montoBruto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'comentarios_comerciales', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CotizacionVenta.prototype, "comentariosComerciales", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        default: enums_1.EstadoCotizacionVenta.PENDIENTE_APROBACION,
    }),
    __metadata("design:type", String)
], CotizacionVenta.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], CotizacionVenta.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], CotizacionVenta.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cotizacion_ventas_detalle_entity_1.CotizacionVentasDetalle, (d) => d.cotizacion, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], CotizacionVenta.prototype, "detalles", void 0);
exports.CotizacionVenta = CotizacionVenta = __decorate([
    (0, typeorm_1.Entity)('cotizaciones_ventas')
], CotizacionVenta);
//# sourceMappingURL=cotizacion-venta.entity.js.map
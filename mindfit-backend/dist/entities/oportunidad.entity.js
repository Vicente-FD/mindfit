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
exports.Oportunidad = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const cliente_entity_1 = require("./cliente.entity");
const usuario_entity_1 = require("./usuario.entity");
const cotizacion_venta_entity_1 = require("./cotizacion-venta.entity");
let Oportunidad = class Oportunidad {
    id;
    clienteId;
    cliente;
    creadoPorId;
    creadoPor;
    titulo;
    etapa;
    montoEstimado;
    divisaCodigo;
    notas;
    fechaCierreEstimada;
    checklist;
    actividades;
    createdAt;
    updatedAt;
    cotizaciones;
};
exports.Oportunidad = Oportunidad;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Oportunidad.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cliente_id', type: 'int' }),
    __metadata("design:type", Number)
], Oportunidad.prototype, "clienteId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => cliente_entity_1.Cliente, (c) => c.oportunidades, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'cliente_id' }),
    __metadata("design:type", cliente_entity_1.Cliente)
], Oportunidad.prototype, "cliente", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creado_por_id', type: 'int' }),
    __metadata("design:type", Number)
], Oportunidad.prototype, "creadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'creado_por_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], Oportunidad.prototype, "creadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Oportunidad.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        default: enums_1.EtapaOportunidad.PROSPECCION,
    }),
    __metadata("design:type", String)
], Oportunidad.prototype, "etapa", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'monto_estimado',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], Oportunidad.prototype, "montoEstimado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'divisa_codigo', type: 'varchar', length: 3, default: 'CLP' }),
    __metadata("design:type", String)
], Oportunidad.prototype, "divisaCodigo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Oportunidad.prototype, "notas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_cierre_estimada', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Oportunidad.prototype, "fechaCierreEstimada", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: () => "'[]'" }),
    __metadata("design:type", Array)
], Oportunidad.prototype, "checklist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true, default: () => "'[]'" }),
    __metadata("design:type", Array)
], Oportunidad.prototype, "actividades", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Oportunidad.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Oportunidad.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => cotizacion_venta_entity_1.CotizacionVenta, (c) => c.oportunidad),
    __metadata("design:type", Array)
], Oportunidad.prototype, "cotizaciones", void 0);
exports.Oportunidad = Oportunidad = __decorate([
    (0, typeorm_1.Entity)('oportunidades')
], Oportunidad);
//# sourceMappingURL=oportunidad.entity.js.map
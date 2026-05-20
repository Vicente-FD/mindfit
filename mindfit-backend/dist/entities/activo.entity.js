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
exports.Activo = void 0;
const typeorm_1 = require("typeorm");
const uuid_1 = require("uuid");
const enums_1 = require("../common/enums");
const sucursal_entity_1 = require("./sucursal.entity");
const marca_entity_1 = require("./marca.entity");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
let Activo = class Activo {
    id;
    uuidActivo;
    codigoQrToken;
    codigoInventario;
    nombre;
    marcaId;
    marcaRelacion;
    marca;
    modelo;
    numeroSerie;
    categoria;
    sucursalId;
    sucursal;
    fechaCompra;
    fechaVencimientoGarantia;
    costoAdquisicion;
    documentacionUrls;
    estadoOperacional;
    createdAt;
    updatedAt;
    ordenesTrabajo;
    generarUuid() {
        if (!this.uuidActivo) {
            this.uuidActivo = (0, uuid_1.v4)();
        }
    }
};
exports.Activo = Activo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Activo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'uuid_activo',
        type: 'uuid',
        unique: true,
    }),
    __metadata("design:type", String)
], Activo.prototype, "uuidActivo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'codigo_qr_token',
        type: 'varchar',
        length: 32,
        unique: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Activo.prototype, "codigoQrToken", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'codigo_inventario',
        type: 'varchar',
        length: 32,
        unique: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Activo.prototype, "codigoInventario", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], Activo.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marca_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Activo.prototype, "marcaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => marca_entity_1.Marca, (marca) => marca.activos, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'marca_id' }),
    __metadata("design:type", Object)
], Activo.prototype, "marcaRelacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Activo.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Activo.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'numero_serie',
        type: 'varchar',
        length: 100,
        unique: true,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Activo.prototype, "numeroSerie", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.CategoriaActivo }),
    __metadata("design:type", String)
], Activo.prototype, "categoria", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int' }),
    __metadata("design:type", Number)
], Activo.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, (sucursal) => sucursal.activos, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", sucursal_entity_1.Sucursal)
], Activo.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_compra', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Activo.prototype, "fechaCompra", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_vencimiento_garantia', type: 'date', nullable: true }),
    __metadata("design:type", Object)
], Activo.prototype, "fechaVencimientoGarantia", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_adquisicion',
        type: 'decimal',
        precision: 14,
        scale: 2,
        nullable: true,
    }),
    __metadata("design:type", Object)
], Activo.prototype, "costoAdquisicion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'documentacion_urls', type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], Activo.prototype, "documentacionUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'estado_operacional',
        type: 'enum',
        enum: enums_1.EstadoOperacionalActivo,
        default: enums_1.EstadoOperacionalActivo.OPERATIVO,
    }),
    __metadata("design:type", String)
], Activo.prototype, "estadoOperacional", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Activo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Activo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.activo),
    __metadata("design:type", Array)
], Activo.prototype, "ordenesTrabajo", void 0);
__decorate([
    (0, typeorm_1.BeforeInsert)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], Activo.prototype, "generarUuid", null);
exports.Activo = Activo = __decorate([
    (0, typeorm_1.Entity)('activos')
], Activo);
//# sourceMappingURL=activo.entity.js.map
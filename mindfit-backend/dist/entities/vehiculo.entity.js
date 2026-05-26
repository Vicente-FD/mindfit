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
exports.Vehiculo = void 0;
const typeorm_1 = require("typeorm");
const sucursal_entity_1 = require("./sucursal.entity");
const usuario_entity_1 = require("./usuario.entity");
let Vehiculo = class Vehiculo {
    id;
    patente;
    marca;
    modelo;
    anio;
    kilometrajeActual;
    siguienteCambioAceiteKm;
    sucursalId;
    sucursal;
    conductorId;
    conductor;
    vencimientoSoap;
    vencimientoPermiso;
    vencimientoRevision;
    documentosUrls;
    createdAt;
    updatedAt;
    deletedAt;
};
exports.Vehiculo = Vehiculo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Vehiculo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 15, unique: true }),
    __metadata("design:type", String)
], Vehiculo.prototype, "patente", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Vehiculo.prototype, "marca", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], Vehiculo.prototype, "modelo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "anio", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'kilometraje_actual', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "kilometrajeActual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'siguiente_cambio_aceite_km', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], Vehiculo.prototype, "siguienteCambioAceiteKm", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'conductor_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "conductorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'conductor_id' }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "conductor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vencimiento_soap', type: 'date' }),
    __metadata("design:type", String)
], Vehiculo.prototype, "vencimientoSoap", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vencimiento_permiso', type: 'date' }),
    __metadata("design:type", String)
], Vehiculo.prototype, "vencimientoPermiso", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'vencimiento_revision', type: 'date' }),
    __metadata("design:type", String)
], Vehiculo.prototype, "vencimientoRevision", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'documentos_urls', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "documentosUrls", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Vehiculo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Vehiculo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Object)
], Vehiculo.prototype, "deletedAt", void 0);
exports.Vehiculo = Vehiculo = __decorate([
    (0, typeorm_1.Entity)('vehiculos')
], Vehiculo);
//# sourceMappingURL=vehiculo.entity.js.map
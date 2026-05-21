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
exports.Sucursal = void 0;
const typeorm_1 = require("typeorm");
const usuario_entity_1 = require("./usuario.entity");
const activo_entity_1 = require("./activo.entity");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
let Sucursal = class Sucursal {
    id;
    nombre;
    sigla;
    direccion;
    comuna;
    ciudad;
    estaActiva;
    createdAt;
    updatedAt;
    deletedAt;
    usuarios;
    activos;
    ordenesTrabajo;
};
exports.Sucursal = Sucursal;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Sucursal.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150, unique: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 5, unique: true }),
    __metadata("design:type", String)
], Sucursal.prototype, "sigla", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Sucursal.prototype, "direccion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Sucursal.prototype, "comuna", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Sucursal.prototype, "ciudad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'esta_activa', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Sucursal.prototype, "estaActiva", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Sucursal.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Sucursal.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Object)
], Sucursal.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => usuario_entity_1.Usuario, (usuario) => usuario.sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "usuarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => activo_entity_1.Activo, (activo) => activo.sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "activos", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.sucursal),
    __metadata("design:type", Array)
], Sucursal.prototype, "ordenesTrabajo", void 0);
exports.Sucursal = Sucursal = __decorate([
    (0, typeorm_1.Entity)('sucursales')
], Sucursal);
//# sourceMappingURL=sucursal.entity.js.map
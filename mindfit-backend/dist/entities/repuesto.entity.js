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
exports.Repuesto = void 0;
const typeorm_1 = require("typeorm");
const bodega_stock_entity_1 = require("./bodega-stock.entity");
const orden_trabajo_repuesto_entity_1 = require("./orden-trabajo-repuesto.entity");
let Repuesto = class Repuesto {
    id;
    sku;
    nombre;
    descripcion;
    costoUnitario;
    createdAt;
    updatedAt;
    stocks;
    consumos;
};
exports.Repuesto = Repuesto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Repuesto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], Repuesto.prototype, "sku", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 150 }),
    __metadata("design:type", String)
], Repuesto.prototype, "nombre", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], Repuesto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_unitario',
        type: 'decimal',
        precision: 12,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], Repuesto.prototype, "costoUnitario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Repuesto.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Repuesto.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => bodega_stock_entity_1.BodegaStock, (stock) => stock.repuesto),
    __metadata("design:type", Array)
], Repuesto.prototype, "stocks", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_repuesto_entity_1.OrdenTrabajoRepuesto, (consumo) => consumo.repuesto),
    __metadata("design:type", Array)
], Repuesto.prototype, "consumos", void 0);
exports.Repuesto = Repuesto = __decorate([
    (0, typeorm_1.Entity)('repuestos')
], Repuesto);
//# sourceMappingURL=repuesto.entity.js.map
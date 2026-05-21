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
exports.BodegaStock = void 0;
const typeorm_1 = require("typeorm");
const repuesto_entity_1 = require("./repuesto.entity");
let BodegaStock = class BodegaStock {
    id;
    repuestoId;
    repuesto;
    cantidadActual;
    cantidadMinimaAlerta;
    updatedAt;
    createdAt;
};
exports.BodegaStock = BodegaStock;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], BodegaStock.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'repuesto_id', type: 'int' }),
    __metadata("design:type", Number)
], BodegaStock.prototype, "repuestoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => repuesto_entity_1.Repuesto, (repuesto) => repuesto.stocks, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'repuesto_id' }),
    __metadata("design:type", repuesto_entity_1.Repuesto)
], BodegaStock.prototype, "repuesto", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_actual', type: 'int', default: 0 }),
    __metadata("design:type", Number)
], BodegaStock.prototype, "cantidadActual", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cantidad_minima_alerta', type: 'int', default: 5 }),
    __metadata("design:type", Number)
], BodegaStock.prototype, "cantidadMinimaAlerta", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], BodegaStock.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], BodegaStock.prototype, "createdAt", void 0);
exports.BodegaStock = BodegaStock = __decorate([
    (0, typeorm_1.Entity)('bodega_stock'),
    (0, typeorm_1.Unique)('uq_bodega_repuesto', ['repuestoId'])
], BodegaStock);
//# sourceMappingURL=bodega-stock.entity.js.map
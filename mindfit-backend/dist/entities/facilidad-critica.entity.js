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
exports.FacilidadCritica = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const sucursal_entity_1 = require("./sucursal.entity");
const usuario_entity_1 = require("./usuario.entity");
const facilidad_critica_historial_entity_1 = require("./facilidad-critica-historial.entity");
let FacilidadCritica = class FacilidadCritica {
    id;
    sucursalId;
    sucursal;
    tipo;
    estado;
    notasTecnicas;
    actualizadoPorId;
    actualizadoPor;
    createdAt;
    updatedAt;
    historial;
};
exports.FacilidadCritica = FacilidadCritica;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FacilidadCritica.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int' }),
    __metadata("design:type", Number)
], FacilidadCritica.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, (sucursal) => sucursal.facilidadesCriticas, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", sucursal_entity_1.Sucursal)
], FacilidadCritica.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 40 }),
    __metadata("design:type", String)
], FacilidadCritica.prototype, "tipo", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 24,
        default: enums_1.EstadoFacilidadCritica.OPERATIVO,
    }),
    __metadata("design:type", String)
], FacilidadCritica.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notas_tecnicas', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], FacilidadCritica.prototype, "notasTecnicas", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actualizado_por_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], FacilidadCritica.prototype, "actualizadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'actualizado_por_id' }),
    __metadata("design:type", Object)
], FacilidadCritica.prototype, "actualizadoPor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FacilidadCritica.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], FacilidadCritica.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => facilidad_critica_historial_entity_1.FacilidadCriticaHistorial, (historial) => historial.facilidadCritica),
    __metadata("design:type", Array)
], FacilidadCritica.prototype, "historial", void 0);
exports.FacilidadCritica = FacilidadCritica = __decorate([
    (0, typeorm_1.Entity)('facilidades_criticas'),
    (0, typeorm_1.Unique)(['sucursalId', 'tipo'])
], FacilidadCritica);
//# sourceMappingURL=facilidad-critica.entity.js.map
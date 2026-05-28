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
exports.FacilidadCriticaHistorial = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const facilidad_critica_entity_1 = require("./facilidad-critica.entity");
const usuario_entity_1 = require("./usuario.entity");
let FacilidadCriticaHistorial = class FacilidadCriticaHistorial {
    id;
    facilidadCriticaId;
    facilidadCritica;
    estadoAnterior;
    estadoNuevo;
    descripcionProblema;
    reportadoPorId;
    reportadoPor;
    createdAt;
};
exports.FacilidadCriticaHistorial = FacilidadCriticaHistorial;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], FacilidadCriticaHistorial.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'facilidad_critica_id', type: 'int' }),
    __metadata("design:type", Number)
], FacilidadCriticaHistorial.prototype, "facilidadCriticaId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => facilidad_critica_entity_1.FacilidadCritica, (f) => f.historial, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'facilidad_critica_id' }),
    __metadata("design:type", facilidad_critica_entity_1.FacilidadCritica)
], FacilidadCriticaHistorial.prototype, "facilidadCritica", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_anterior', type: 'varchar', length: 24 }),
    __metadata("design:type", String)
], FacilidadCriticaHistorial.prototype, "estadoAnterior", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estado_nuevo', type: 'varchar', length: 24 }),
    __metadata("design:type", String)
], FacilidadCriticaHistorial.prototype, "estadoNuevo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'descripcion_problema', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], FacilidadCriticaHistorial.prototype, "descripcionProblema", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reportado_por_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], FacilidadCriticaHistorial.prototype, "reportadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reportado_por_id' }),
    __metadata("design:type", Object)
], FacilidadCriticaHistorial.prototype, "reportadoPor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], FacilidadCriticaHistorial.prototype, "createdAt", void 0);
exports.FacilidadCriticaHistorial = FacilidadCriticaHistorial = __decorate([
    (0, typeorm_1.Entity)('facilidades_criticas_historial')
], FacilidadCriticaHistorial);
//# sourceMappingURL=facilidad-critica-historial.entity.js.map
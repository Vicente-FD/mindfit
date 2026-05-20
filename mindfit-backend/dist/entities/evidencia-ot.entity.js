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
exports.EvidenciaOt = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
const usuario_entity_1 = require("./usuario.entity");
let EvidenciaOt = class EvidenciaOt {
    id;
    ordenTrabajoId;
    ordenTrabajo;
    tipoEvidencia;
    urlImagen;
    cargadoPorId;
    cargadoPor;
    createdAt;
};
exports.EvidenciaOt = EvidenciaOt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], EvidenciaOt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_trabajo_id', type: 'int' }),
    __metadata("design:type", Number)
], EvidenciaOt.prototype, "ordenTrabajoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.evidencias, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_trabajo_id' }),
    __metadata("design:type", orden_trabajo_entity_1.OrdenTrabajo)
], EvidenciaOt.prototype, "ordenTrabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_evidencia', type: 'enum', enum: enums_1.TipoEvidencia }),
    __metadata("design:type", String)
], EvidenciaOt.prototype, "tipoEvidencia", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_imagen', type: 'varchar', length: 500 }),
    __metadata("design:type", String)
], EvidenciaOt.prototype, "urlImagen", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'cargado_por_id', type: 'int' }),
    __metadata("design:type", Number)
], EvidenciaOt.prototype, "cargadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.evidenciasCargadas, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'cargado_por_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], EvidenciaOt.prototype, "cargadoPor", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], EvidenciaOt.prototype, "createdAt", void 0);
exports.EvidenciaOt = EvidenciaOt = __decorate([
    (0, typeorm_1.Entity)('evidencia_ot')
], EvidenciaOt);
//# sourceMappingURL=evidencia-ot.entity.js.map
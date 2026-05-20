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
exports.ComentarioOt = void 0;
const typeorm_1 = require("typeorm");
const orden_trabajo_entity_1 = require("./orden-trabajo.entity");
const usuario_entity_1 = require("./usuario.entity");
let ComentarioOt = class ComentarioOt {
    id;
    ordenTrabajoId;
    ordenTrabajo;
    autorId;
    autor;
    comentario;
    createdAt;
};
exports.ComentarioOt = ComentarioOt;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ComentarioOt.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'orden_trabajo_id', type: 'int' }),
    __metadata("design:type", Number)
], ComentarioOt.prototype, "ordenTrabajoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => orden_trabajo_entity_1.OrdenTrabajo, (orden) => orden.comentarios, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'orden_trabajo_id' }),
    __metadata("design:type", orden_trabajo_entity_1.OrdenTrabajo)
], ComentarioOt.prototype, "ordenTrabajo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'autor_id', type: 'int' }),
    __metadata("design:type", Number)
], ComentarioOt.prototype, "autorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.comentarios, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'autor_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], ComentarioOt.prototype, "autor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ComentarioOt.prototype, "comentario", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], ComentarioOt.prototype, "createdAt", void 0);
exports.ComentarioOt = ComentarioOt = __decorate([
    (0, typeorm_1.Entity)('comentarios_ot')
], ComentarioOt);
//# sourceMappingURL=comentario-ot.entity.js.map
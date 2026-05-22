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
exports.RendicionGasto = void 0;
const typeorm_1 = require("typeorm");
const estado_rendicion_gasto_enum_1 = require("../common/enums/estado-rendicion-gasto.enum");
const usuario_entity_1 = require("./usuario.entity");
let RendicionGasto = class RendicionGasto {
    id;
    tecnicoId;
    tecnico;
    monto;
    descripcion;
    urlBoleta;
    estado;
    motivoRechazo;
    fechaGasto;
    createdAt;
    updatedAt;
};
exports.RendicionGasto = RendicionGasto;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], RendicionGasto.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tecnico_id', type: 'int' }),
    __metadata("design:type", Number)
], RendicionGasto.prototype, "tecnicoId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'tecnico_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], RendicionGasto.prototype, "tecnico", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'numeric', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], RendicionGasto.prototype, "monto", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], RendicionGasto.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'url_boleta', type: 'text' }),
    __metadata("design:type", String)
], RendicionGasto.prototype, "urlBoleta", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        default: estado_rendicion_gasto_enum_1.EstadoRendicionGasto.PENDIENTE,
    }),
    __metadata("design:type", String)
], RendicionGasto.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_rechazo', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], RendicionGasto.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_gasto', type: 'date' }),
    __metadata("design:type", String)
], RendicionGasto.prototype, "fechaGasto", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], RendicionGasto.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], RendicionGasto.prototype, "updatedAt", void 0);
exports.RendicionGasto = RendicionGasto = __decorate([
    (0, typeorm_1.Entity)('rendiciones_gastos')
], RendicionGasto);
//# sourceMappingURL=rendicion-gasto.entity.js.map
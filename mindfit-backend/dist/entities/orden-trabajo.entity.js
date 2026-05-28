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
exports.OrdenTrabajo = void 0;
const typeorm_1 = require("typeorm");
const enums_1 = require("../common/enums");
const activo_entity_1 = require("./activo.entity");
const sucursal_entity_1 = require("./sucursal.entity");
const usuario_entity_1 = require("./usuario.entity");
const evidencia_ot_entity_1 = require("./evidencia-ot.entity");
const comentario_ot_entity_1 = require("./comentario-ot.entity");
const orden_trabajo_repuesto_entity_1 = require("./orden-trabajo-repuesto.entity");
const facilidad_critica_entity_1 = require("./facilidad-critica.entity");
let OrdenTrabajo = class OrdenTrabajo {
    id;
    codigoOt;
    clasificacion;
    activoId;
    facilidadCriticaId;
    areaServicios;
    generoServicios;
    fallaGeneralServicios;
    serviciosAfectados;
    facilidadCritica;
    activo;
    sucursalId;
    sucursal;
    creadoPorId;
    creadoPor;
    asignadoAId;
    asignadoA;
    titulo;
    descripcion;
    prioridad;
    tipoMantenimiento;
    estado;
    tiempoEstimadoMinutos;
    fechaProgramacion;
    fechaInicioReal;
    fechaFinReal;
    motivoRechazo;
    fechaAprobacion;
    costoMateriales;
    createdAt;
    updatedAt;
    deletedAt;
    evidencias;
    comentarios;
    consumoRepuestos;
};
exports.OrdenTrabajo = OrdenTrabajo;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], OrdenTrabajo.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'codigo_ot', type: 'varchar', length: 30, unique: true }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "codigoOt", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 30,
        default: enums_1.ClasificacionOrden.MAQUINA,
    }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "clasificacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'activo_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "activoId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'facilidad_critica_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "facilidadCriticaId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'area_servicios', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "areaServicios", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'genero_servicios',
        type: 'varchar',
        length: 20,
        nullable: true,
    }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "generoServicios", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'falla_general_servicios',
        type: 'boolean',
        default: false,
    }),
    __metadata("design:type", Boolean)
], OrdenTrabajo.prototype, "fallaGeneralServicios", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'servicios_afectados',
        type: 'jsonb',
        nullable: true,
    }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "serviciosAfectados", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => facilidad_critica_entity_1.FacilidadCritica, { nullable: true, onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'facilidad_critica_id' }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "facilidadCritica", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => activo_entity_1.Activo, (activo) => activo.ordenesTrabajo, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'activo_id' }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "activo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'sucursal_id', type: 'int' }),
    __metadata("design:type", Number)
], OrdenTrabajo.prototype, "sucursalId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => sucursal_entity_1.Sucursal, (sucursal) => sucursal.ordenesTrabajo, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'sucursal_id' }),
    __metadata("design:type", sucursal_entity_1.Sucursal)
], OrdenTrabajo.prototype, "sucursal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'creado_por_id', type: 'int' }),
    __metadata("design:type", Number)
], OrdenTrabajo.prototype, "creadoPorId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.ordenesCreadas, {
        onDelete: 'RESTRICT',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'creado_por_id' }),
    __metadata("design:type", usuario_entity_1.Usuario)
], OrdenTrabajo.prototype, "creadoPor", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'asignado_a_id', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "asignadoAId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => usuario_entity_1.Usuario, (usuario) => usuario.ordenesAsignadas, {
        nullable: true,
        onDelete: 'SET NULL',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'asignado_a_id' }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "asignadoA", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "titulo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "descripcion", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: enums_1.PrioridadOrden, default: enums_1.PrioridadOrden.MEDIA }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "prioridad", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tipo_mantenimiento', type: 'enum', enum: enums_1.TipoMantenimiento }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "tipoMantenimiento", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: enums_1.EstadoOrdenTrabajo,
        default: enums_1.EstadoOrdenTrabajo.PENDIENTE,
    }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "estado", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tiempo_estimado_minutos', type: 'int', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "tiempoEstimadoMinutos", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_programacion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "fechaProgramacion", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_inicio_real', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "fechaInicioReal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_fin_real', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "fechaFinReal", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'motivo_rechazo', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "motivoRechazo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'fecha_aprobacion', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "fechaAprobacion", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'costo_materiales',
        type: 'decimal',
        precision: 14,
        scale: 2,
        default: 0,
    }),
    __metadata("design:type", String)
], OrdenTrabajo.prototype, "costoMateriales", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], OrdenTrabajo.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], OrdenTrabajo.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at' }),
    __metadata("design:type", Object)
], OrdenTrabajo.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => evidencia_ot_entity_1.EvidenciaOt, (evidencia) => evidencia.ordenTrabajo),
    __metadata("design:type", Array)
], OrdenTrabajo.prototype, "evidencias", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comentario_ot_entity_1.ComentarioOt, (comentario) => comentario.ordenTrabajo),
    __metadata("design:type", Array)
], OrdenTrabajo.prototype, "comentarios", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => orden_trabajo_repuesto_entity_1.OrdenTrabajoRepuesto, (consumo) => consumo.ordenTrabajo),
    __metadata("design:type", Array)
], OrdenTrabajo.prototype, "consumoRepuestos", void 0);
exports.OrdenTrabajo = OrdenTrabajo = __decorate([
    (0, typeorm_1.Entity)('ordenes_trabajo')
], OrdenTrabajo);
//# sourceMappingURL=orden-trabajo.entity.js.map
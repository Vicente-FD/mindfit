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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenesTrabajoController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const jwt_payload_interface_1 = require("../common/interfaces/jwt-payload.interface");
const asignar_orden_dto_1 = require("./dto/asignar-orden.dto");
const cerrar_orden_dto_1 = require("./dto/cerrar-orden.dto");
const create_comentario_dto_1 = require("./dto/create-comentario.dto");
const create_evidencia_dto_1 = require("./dto/create-evidencia.dto");
const create_orden_trabajo_dto_1 = require("./dto/create-orden-trabajo.dto");
const update_orden_trabajo_dto_1 = require("./dto/update-orden-trabajo.dto");
const update_estado_orden_dto_1 = require("./dto/update-estado-orden.dto");
const reportar_falla_dto_1 = require("./dto/reportar-falla.dto");
const ordenes_trabajo_service_1 = require("./ordenes-trabajo.service");
const evidencias_storage_1 = require("./storage/evidencias.storage");
let OrdenesTrabajoController = class OrdenesTrabajoController {
    ordenesService;
    configService;
    constructor(ordenesService, configService) {
        this.ordenesService = ordenesService;
        this.configService = configService;
    }
    findAll(tecnicoId, sucursalId, user) {
        const parsedTecnico = tecnicoId != null && tecnicoId !== ''
            ? parseInt(tecnicoId, 10)
            : user?.rol === enums_1.RolUsuario.TECNICO
                ? user.id
                : undefined;
        const parsedSucursal = sucursalId != null && sucursalId !== ''
            ? parseInt(sucursalId, 10)
            : undefined;
        return this.ordenesService.findAll({
            tecnicoId: parsedTecnico,
            sucursalId: parsedSucursal,
        });
    }
    findMisAsignadas(user) {
        return this.ordenesService.findAll({ tecnicoId: user.id });
    }
    findMiSucursal(user) {
        if (!user.sucursalId) {
            throw new common_1.BadRequestException('Usuario sin sucursal asignada');
        }
        return this.ordenesService.findBySucursal(user.sucursalId);
    }
    reportarFalla(files, dto, user) {
        if (!user.sucursalId) {
            throw new common_1.BadRequestException('Usuario sin sucursal asignada');
        }
        const foto = files.foto_falla?.[0];
        const port = this.configService.get('PORT', 3000);
        const fotoUrl = foto
            ? (0, evidencias_storage_1.buildPublicFileUrl)(foto.filename, port)
            : undefined;
        return this.ordenesService.reportarFalla({
            activoId: Number(dto.activoId),
            descripcion: dto.descripcion,
            prioridad: dto.prioridad,
            titulo: dto.titulo,
        }, user.id, user.sucursalId, fotoUrl);
    }
    findOne(id) {
        return this.ordenesService.findOne(id);
    }
    create(dto, user) {
        return this.ordenesService.create(dto, user.id);
    }
    update(id, dto) {
        return this.ordenesService.update(id, dto);
    }
    asignar(id, dto) {
        return this.ordenesService.asignar(id, dto);
    }
    updateEstado(id, dto, user) {
        return this.ordenesService.updateEstado(id, dto.estado, user.id);
    }
    iniciar(id, user) {
        return this.ordenesService.iniciar(id, user.id);
    }
    agregarComentario(id, dto, user) {
        return this.ordenesService.agregarComentario(id, user.id, dto);
    }
    agregarEvidencia(id, dto, user) {
        return this.ordenesService.agregarEvidencia(id, user.id, dto);
    }
    cerrar(id, files, comentario, user) {
        const fotoAntes = files.fotos_antes?.[0];
        const fotoDespues = files.fotos_despues?.[0];
        if (!comentario?.trim()) {
            throw new common_1.BadRequestException('El comentario es obligatorio');
        }
        if (!fotoAntes || !fotoDespues) {
            throw new common_1.BadRequestException('Debe adjuntar fotos_antes y fotos_despues');
        }
        const port = this.configService.get('PORT', 3000);
        const urlAntes = (0, evidencias_storage_1.buildPublicFileUrl)(fotoAntes.filename, port);
        const urlDespues = (0, evidencias_storage_1.buildPublicFileUrl)(fotoDespues.filename, port);
        return this.ordenesService.cerrarConArchivos(id, user.id, comentario.trim(), urlAntes, urlDespues);
    }
    cerrarJson(id, dto, user) {
        return this.ordenesService.cerrar(id, user.id, dto);
    }
    aprobar(id) {
        return this.ordenesService.aprobar(id);
    }
};
exports.OrdenesTrabajoController = OrdenesTrabajoController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.GERENTE_BI),
    __param(0, (0, common_1.Query)('tecnicoId')),
    __param(1, (0, common_1.Query)('sucursalId')),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('mis-asignadas'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "findMisAsignadas", null);
__decorate([
    (0, common_1.Get)('mi-sucursal'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "findMiSucursal", null);
__decorate([
    (0, common_1.Post)('reportar-falla'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.JEFE_SUCURSAL),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'foto_falla', maxCount: 1 }], {
        storage: evidencias_storage_1.evidenciasMulterStorage,
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reportar_falla_dto_1.ReportarFallaDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "reportarFalla", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.GERENTE_BI),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_orden_trabajo_dto_1.CreateOrdenTrabajoDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_orden_trabajo_dto_1.UpdateOrdenTrabajoDto]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/asignar'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, asignar_orden_dto_1.AsignarOrdenDto]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "asignar", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_estado_orden_dto_1.UpdateEstadoOrdenDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "updateEstado", null);
__decorate([
    (0, common_1.Patch)(':id/iniciar'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "iniciar", null);
__decorate([
    (0, common_1.Post)(':id/comentarios'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_comentario_dto_1.CreateComentarioDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "agregarComentario", null);
__decorate([
    (0, common_1.Post)(':id/evidencias'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_evidencia_dto_1.CreateEvidenciaDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "agregarEvidencia", null);
__decorate([
    (0, common_1.Post)(':id/cerrar'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([
        { name: 'fotos_antes', maxCount: 1 },
        { name: 'fotos_despues', maxCount: 1 },
    ], { storage: evidencias_storage_1.evidenciasMulterStorage })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFiles)()),
    __param(2, (0, common_1.Body)('comentario')),
    __param(3, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, String, jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Post)(':id/cerrar-json'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cerrar_orden_dto_1.CerrarOrdenDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "cerrarJson", null);
__decorate([
    (0, common_1.Patch)(':id/aprobar'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "aprobar", null);
exports.OrdenesTrabajoController = OrdenesTrabajoController = __decorate([
    (0, common_1.Controller)('ordenes-trabajo'),
    __metadata("design:paramtypes", [ordenes_trabajo_service_1.OrdenesTrabajoService,
        config_1.ConfigService])
], OrdenesTrabajoController);
//# sourceMappingURL=ordenes-trabajo.controller.js.map
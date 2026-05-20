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
const ordenes_trabajo_service_1 = require("./ordenes-trabajo.service");
let OrdenesTrabajoController = class OrdenesTrabajoController {
    ordenesService;
    constructor(ordenesService) {
        this.ordenesService = ordenesService;
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
    iniciar(id, user) {
        return this.ordenesService.iniciar(id, user.id);
    }
    agregarComentario(id, dto, user) {
        return this.ordenesService.agregarComentario(id, user.id, dto);
    }
    agregarEvidencia(id, dto, user) {
        return this.ordenesService.agregarEvidencia(id, user.id, dto);
    }
    cerrar(id, dto, user) {
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
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, cerrar_orden_dto_1.CerrarOrdenDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OrdenesTrabajoController.prototype, "cerrar", null);
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
    __metadata("design:paramtypes", [ordenes_trabajo_service_1.OrdenesTrabajoService])
], OrdenesTrabajoController);
//# sourceMappingURL=ordenes-trabajo.controller.js.map
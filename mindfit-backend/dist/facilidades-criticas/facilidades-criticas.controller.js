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
exports.FacilidadesCriticasController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const config_1 = require("@nestjs/config");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const evidencias_storage_1 = require("../ordenes-trabajo/storage/evidencias.storage");
const actualizar_estado_facilidad_dto_1 = require("./dto/actualizar-estado-facilidad.dto");
const reportar_area_servicios_dto_1 = require("./dto/reportar-area-servicios.dto");
const reportar_falla_facilidad_dto_1 = require("./dto/reportar-falla-facilidad.dto");
const facilidades_criticas_service_1 = require("./facilidades-criticas.service");
let FacilidadesCriticasController = class FacilidadesCriticasController {
    facilidadesService;
    configService;
    constructor(facilidadesService, configService) {
        this.facilidadesService = facilidadesService;
        this.configService = configService;
    }
    miSucursal(user) {
        return this.facilidadesService.findMiSucursal(user);
    }
    resumenSedes() {
        return this.facilidadesService.getResumenGlobalSedes();
    }
    reportarAreaServicios(foto, dto, user) {
        if (!foto) {
            throw new common_1.BadRequestException('La fotografía del problema es obligatoria');
        }
        const port = this.configService.get('PORT', 3000);
        const fotoUrl = (0, evidencias_storage_1.buildPublicFileUrl)(foto.filename, port);
        return this.facilidadesService.reportarAreaServicios(dto, user, fotoUrl);
    }
    porSucursal(sucursalId, user) {
        return this.facilidadesService.findBySucursalForUser(sucursalId, user);
    }
    historial(id, user) {
        return this.facilidadesService.getHistorial(id, user);
    }
    reportarFalla(id, dto, user) {
        return this.facilidadesService.reportarFalla(id, dto, user);
    }
    actualizarEstado(id, dto, user) {
        return this.facilidadesService.actualizarEstado(id, dto, user);
    }
};
exports.FacilidadesCriticasController = FacilidadesCriticasController;
__decorate([
    (0, common_1.Get)('mi-sucursal'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "miSucursal", null);
__decorate([
    (0, common_1.Get)('resumen-sedes'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.GERENTE_BI),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "resumenSedes", null);
__decorate([
    (0, common_1.Post)('reportar-area-servicios'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.JEFE_SUCURSAL),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('foto_falla', { storage: evidencias_storage_1.evidenciasMulterStorage })),
    __param(0, (0, common_1.UploadedFile)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, reportar_area_servicios_dto_1.ReportarAreaServiciosDto, Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "reportarAreaServicios", null);
__decorate([
    (0, common_1.Get)('sucursal/:sucursalId'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.GERENTE_BI, enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, common_1.Param)('sucursalId', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "porSucursal", null);
__decorate([
    (0, common_1.Get)(':id/historial'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.GERENTE_BI, enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "historial", null);
__decorate([
    (0, common_1.Patch)(':id/reportar-falla'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, reportar_falla_facilidad_dto_1.ReportarFallaFacilidadDto, Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "reportarFalla", null);
__decorate([
    (0, common_1.Patch)(':id/estado'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, actualizar_estado_facilidad_dto_1.ActualizarEstadoFacilidadDto, Function]),
    __metadata("design:returntype", void 0)
], FacilidadesCriticasController.prototype, "actualizarEstado", null);
exports.FacilidadesCriticasController = FacilidadesCriticasController = __decorate([
    (0, common_1.Controller)('facilidades-criticas'),
    __metadata("design:paramtypes", [facilidades_criticas_service_1.FacilidadesCriticasService,
        config_1.ConfigService])
], FacilidadesCriticasController);
//# sourceMappingURL=facilidades-criticas.controller.js.map
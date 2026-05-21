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
exports.ActivosController = void 0;
const common_1 = require("@nestjs/common");
const public_decorator_1 = require("../common/decorators/public.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const activos_service_1 = require("./activos.service");
const create_activo_dto_1 = require("./dto/create-activo.dto");
const filter_activos_dto_1 = require("./dto/filter-activos.dto");
const update_activo_dto_1 = require("./dto/update-activo.dto");
let ActivosController = class ActivosController {
    activosService;
    constructor(activosService) {
        this.activosService = activosService;
    }
    getFichaPublica(uuidActivo) {
        return this.activosService.getFichaPublica(uuidActivo);
    }
    findByUuid(uuidActivo) {
        return this.activosService.findByUuid(uuidActivo);
    }
    findAll(filters) {
        return this.activosService.findAll(filters);
    }
    getHistorial(id) {
        return this.activosService.getHistorial(id);
    }
    findOne(id) {
        return this.activosService.findOne(id);
    }
    create(dto) {
        return this.activosService.create(dto);
    }
    update(id, dto) {
        return this.activosService.update(id, dto);
    }
    remove(id) {
        return this.activosService.remove(id);
    }
};
exports.ActivosController = ActivosController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('publico/:uuidActivo/ficha'),
    __param(0, (0, common_1.Param)('uuidActivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "getFichaPublica", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('publico/:uuidActivo'),
    __param(0, (0, common_1.Param)('uuidActivo')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "findByUuid", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.GERENTE_BI),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_activos_dto_1.FilterActivosDto]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id/historial'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.GERENTE_BI),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "getHistorial", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.JEFE_SUCURSAL, enums_1.RolUsuario.GERENTE_BI),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_activo_dto_1.CreateActivoDto]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.JEFE_SUCURSAL),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_activo_dto_1.UpdateActivoDto]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ActivosController.prototype, "remove", null);
exports.ActivosController = ActivosController = __decorate([
    (0, common_1.Controller)('activos'),
    __metadata("design:paramtypes", [activos_service_1.ActivosService])
], ActivosController);
//# sourceMappingURL=activos.controller.js.map
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
exports.SucursalesController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const create_sucursal_dto_1 = require("./dto/create-sucursal.dto");
const update_sucursal_dto_1 = require("./dto/update-sucursal.dto");
const sucursales_service_1 = require("./sucursales.service");
let SucursalesController = class SucursalesController {
    sucursalesService;
    constructor(sucursalesService) {
        this.sucursalesService = sucursalesService;
    }
    findAll() {
        return this.sucursalesService.findAll();
    }
    findOne(id) {
        return this.sucursalesService.findOne(id);
    }
    create(dto) {
        return this.sucursalesService.create(dto);
    }
    update(id, dto) {
        return this.sucursalesService.update(id, dto);
    }
    remove(id) {
        return this.sucursalesService.remove(id);
    }
};
exports.SucursalesController = SucursalesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], SucursalesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SucursalesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_sucursal_dto_1.CreateSucursalDto]),
    __metadata("design:returntype", void 0)
], SucursalesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_sucursal_dto_1.UpdateSucursalDto]),
    __metadata("design:returntype", void 0)
], SucursalesController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], SucursalesController.prototype, "remove", null);
exports.SucursalesController = SucursalesController = __decorate([
    (0, common_1.Controller)('sucursales'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __metadata("design:paramtypes", [sucursales_service_1.SucursalesService])
], SucursalesController);
//# sourceMappingURL=sucursales.controller.js.map
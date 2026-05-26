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
exports.VehiculosController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_flota_1 = require("../common/constants/roles-flota");
const create_vehiculo_dto_1 = require("./dto/create-vehiculo.dto");
const update_vehiculo_dto_1 = require("./dto/update-vehiculo.dto");
const vehiculos_service_1 = require("./vehiculos.service");
let VehiculosController = class VehiculosController {
    vehiculosService;
    constructor(vehiculosService) {
        this.vehiculosService = vehiculosService;
    }
    findAlertas() {
        return this.vehiculosService.findAlertas();
    }
    findAll() {
        return this.vehiculosService.findAll();
    }
    findOne(id) {
        return this.vehiculosService.findOne(id);
    }
    create(dto) {
        return this.vehiculosService.create(dto);
    }
    update(id, dto) {
        return this.vehiculosService.update(id, dto);
    }
    remove(id) {
        return this.vehiculosService.remove(id);
    }
};
exports.VehiculosController = VehiculosController;
__decorate([
    (0, common_1.Get)('alertas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findAlertas", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_vehiculo_dto_1.CreateVehiculoDto]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_vehiculo_dto_1.UpdateVehiculoDto]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], VehiculosController.prototype, "remove", null);
exports.VehiculosController = VehiculosController = __decorate([
    (0, common_1.Controller)('vehiculos'),
    (0, roles_decorator_1.Roles)(...roles_flota_1.ROLES_FLOTA),
    __metadata("design:paramtypes", [vehiculos_service_1.VehiculosService])
], VehiculosController);
//# sourceMappingURL=vehiculos.controller.js.map
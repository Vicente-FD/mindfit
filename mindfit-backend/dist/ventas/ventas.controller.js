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
exports.VentasController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_ventas_1 = require("../common/constants/roles-ventas");
const ventas_service_1 = require("./ventas.service");
let VentasController = class VentasController {
    ventasService;
    constructor(ventasService) {
        this.ventasService = ventasService;
    }
    dashboard() {
        return this.ventasService.getDashboard();
    }
    dashboardEjecutivo() {
        return this.ventasService.getDashboardEjecutivo();
    }
    dashboardComercial() {
        return this.ventasService.getDashboardComercial();
    }
    catalogo(busqueda, soloHabilitadas) {
        return this.ventasService.buscarCatalogo(busqueda, soloHabilitadas === 'true' || soloHabilitadas === '1');
    }
};
exports.VentasController = VentasController;
__decorate([
    (0, common_1.Get)('dashboard'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "dashboard", null);
__decorate([
    (0, common_1.Get)('dashboard-ejecutivo'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "dashboardEjecutivo", null);
__decorate([
    (0, common_1.Get)('dashboard-comercial'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "dashboardComercial", null);
__decorate([
    (0, common_1.Get)('catalogo'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __param(0, (0, common_1.Query)('busqueda')),
    __param(1, (0, common_1.Query)('soloHabilitadas')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], VentasController.prototype, "catalogo", null);
exports.VentasController = VentasController = __decorate([
    (0, common_1.Controller)('ventas'),
    __metadata("design:paramtypes", [ventas_service_1.VentasService])
], VentasController);
//# sourceMappingURL=ventas.controller.js.map
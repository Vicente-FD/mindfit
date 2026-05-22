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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const jwt_payload_interface_1 = require("../common/interfaces/jwt-payload.interface");
const inventario_service_1 = require("./inventario.service");
const create_repuesto_dto_1 = require("./dto/create-repuesto.dto");
const update_repuesto_dto_1 = require("./dto/update-repuesto.dto");
const filter_bodega_dto_1 = require("./dto/filter-bodega.dto");
const ajustar_stock_dto_1 = require("./dto/ajustar-stock.dto");
const ingreso_stock_dto_1 = require("./dto/ingreso-stock.dto");
const bodega_ajuste_dto_1 = require("./dto/bodega-ajuste.dto");
let InventarioController = class InventarioController {
    inventario;
    constructor(inventario) {
        this.inventario = inventario;
    }
    listRepuestos() {
        return this.inventario.findAllRepuestos();
    }
    repuestosDisponibles() {
        return this.inventario.listRepuestosDisponibles();
    }
    createRepuesto(dto) {
        return this.inventario.createRepuesto(dto);
    }
    getTrazabilidad(id, sucursalId) {
        const parsed = sucursalId != null && sucursalId !== ''
            ? Number(sucursalId)
            : undefined;
        return this.inventario.getTrazabilidad(id, parsed);
    }
    updateRepuesto(id, dto) {
        return this.inventario.updateRepuesto(id, dto);
    }
    removeRepuesto(id) {
        return this.inventario.softDeleteRepuesto(id);
    }
    registrarAjuste(dto, user) {
        return this.inventario.registrarAjuste(dto, user.id);
    }
    listStock(query) {
        return this.inventario.findStock(query);
    }
    getKpis() {
        return this.inventario.getKpis();
    }
    ajustarStock(id, dto) {
        return this.inventario.ajustarStock(id, dto.cantidadActual);
    }
    registrarIngreso(id, dto) {
        return this.inventario.registrarIngreso(id, dto.cantidad);
    }
    asegurarFilaStock(repuestoId) {
        return this.inventario.asegurarStock(repuestoId);
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_1.Get)('repuestos'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "listRepuestos", null);
__decorate([
    (0, common_1.Get)('bodega/repuestos-disponibles'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "repuestosDisponibles", null);
__decorate([
    (0, common_1.Post)('repuestos'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_repuesto_dto_1.CreateRepuestoDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "createRepuesto", null);
__decorate([
    (0, common_1.Get)('repuestos/:id/trazabilidad'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "getTrazabilidad", null);
__decorate([
    (0, common_1.Patch)('repuestos/:id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_repuesto_dto_1.UpdateRepuestoDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "updateRepuesto", null);
__decorate([
    (0, common_1.Delete)('repuestos/:id'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "removeRepuesto", null);
__decorate([
    (0, common_1.Post)('bodega/ajuste'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bodega_ajuste_dto_1.BodegaAjusteDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "registrarAjuste", null);
__decorate([
    (0, common_1.Get)('bodega/stock'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_bodega_dto_1.FilterBodegaDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "listStock", null);
__decorate([
    (0, common_1.Get)('bodega/kpis'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "getKpis", null);
__decorate([
    (0, common_1.Post)('bodega/stock/:id/ajustar'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ajustar_stock_dto_1.AjustarStockDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "ajustarStock", null);
__decorate([
    (0, common_1.Post)('bodega/stock/:id/ingreso'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, ingreso_stock_dto_1.IngresoStockDto]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "registrarIngreso", null);
__decorate([
    (0, common_1.Post)('bodega/repuesto/:repuestoId'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES, enums_1.RolUsuario.BODEGUERO),
    __param(0, (0, common_1.Param)('repuestoId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "asegurarFilaStock", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [inventario_service_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventario.controller.js.map
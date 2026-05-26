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
exports.DivisasController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_ventas_1 = require("../common/constants/roles-ventas");
const divisas_service_1 = require("./divisas.service");
let DivisasController = class DivisasController {
    divisasService;
    constructor(divisasService) {
        this.divisasService = divisasService;
    }
    getTasas() {
        return this.divisasService.getTasas();
    }
};
exports.DivisasController = DivisasController;
__decorate([
    (0, common_1.Get)('tasas'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DivisasController.prototype, "getTasas", null);
exports.DivisasController = DivisasController = __decorate([
    (0, common_1.Controller)('divisas'),
    __metadata("design:paramtypes", [divisas_service_1.DivisasService])
], DivisasController);
//# sourceMappingURL=divisas.controller.js.map
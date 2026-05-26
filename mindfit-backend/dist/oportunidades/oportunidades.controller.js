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
exports.OportunidadesController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_ventas_1 = require("../common/constants/roles-ventas");
const jwt_payload_interface_1 = require("../common/interfaces/jwt-payload.interface");
const create_oportunidad_dto_1 = require("./dto/create-oportunidad.dto");
const update_oportunidad_dto_1 = require("./dto/update-oportunidad.dto");
const oportunidades_service_1 = require("./oportunidades.service");
let OportunidadesController = class OportunidadesController {
    oportunidadesService;
    constructor(oportunidadesService) {
        this.oportunidadesService = oportunidadesService;
    }
    findAll() {
        return this.oportunidadesService.findAll();
    }
    findOne(id) {
        return this.oportunidadesService.findOne(id);
    }
    create(dto, user) {
        return this.oportunidadesService.create(dto, user.id);
    }
    update(id, dto) {
        return this.oportunidadesService.update(id, dto);
    }
};
exports.OportunidadesController = OportunidadesController;
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OportunidadesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_LECTURA),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], OportunidadesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_ESCRITURA),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_oportunidad_dto_1.CreateOportunidadDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], OportunidadesController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)(...roles_ventas_1.ROLES_VENTAS_ESCRITURA),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_oportunidad_dto_1.UpdateOportunidadDto]),
    __metadata("design:returntype", void 0)
], OportunidadesController.prototype, "update", null);
exports.OportunidadesController = OportunidadesController = __decorate([
    (0, common_1.Controller)('oportunidades'),
    __metadata("design:paramtypes", [oportunidades_service_1.OportunidadesService])
], OportunidadesController);
//# sourceMappingURL=oportunidades.controller.js.map
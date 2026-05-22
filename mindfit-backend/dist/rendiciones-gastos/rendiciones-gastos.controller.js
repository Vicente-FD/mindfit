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
exports.RendicionesGastosController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const enums_1 = require("../common/enums");
const jwt_payload_interface_1 = require("../common/interfaces/jwt-payload.interface");
const rendiciones_gastos_service_1 = require("./rendiciones-gastos.service");
const create_rendicion_gasto_dto_1 = require("./dto/create-rendicion-gasto.dto");
const decidir_rendicion_gasto_dto_1 = require("./dto/decidir-rendicion-gasto.dto");
const filter_lista_gastos_dto_1 = require("./dto/filter-lista-gastos.dto");
const boletas_storage_1 = require("./storage/boletas.storage");
let RendicionesGastosController = class RendicionesGastosController {
    rendicionesGastosService;
    constructor(rendicionesGastosService) {
        this.rendicionesGastosService = rendicionesGastosService;
    }
    findMiSaldo(user) {
        return this.rendicionesGastosService.findMiSaldo(user.id);
    }
    findAdmin() {
        return this.rendicionesGastosService.findAdminView();
    }
    findLista(filters, user) {
        const tecnicoIdScope = user.rol === enums_1.RolUsuario.TECNICO ? user.id : undefined;
        return this.rendicionesGastosService.findLista(filters, {
            tecnicoIdScope,
        });
    }
    create(user, dto, file) {
        if (!file) {
            throw new common_1.BadRequestException('Debe adjuntar la fotografía de la boleta');
        }
        return this.rendicionesGastosService.create(user.id, dto, file.filename);
    }
    decidir(id, dto) {
        return this.rendicionesGastosService.decidir(id, dto);
    }
};
exports.RendicionesGastosController = RendicionesGastosController;
__decorate([
    (0, common_1.Get)('mi-saldo'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], RendicionesGastosController.prototype, "findMiSaldo", null);
__decorate([
    (0, common_1.Get)('admin'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RendicionesGastosController.prototype, "findAdmin", null);
__decorate([
    (0, common_1.Get)('lista'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO, enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_lista_gastos_dto_1.FilterListaGastosDto,
        jwt_payload_interface_1.JwtPayload]),
    __metadata("design:returntype", void 0)
], RendicionesGastosController.prototype, "findLista", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.TECNICO),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('boleta', {
        storage: boletas_storage_1.boletasMulterStorage,
        limits: { fileSize: 8 * 1024 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [jwt_payload_interface_1.JwtPayload,
        create_rendicion_gasto_dto_1.CreateRendicionGastoDto, Object]),
    __metadata("design:returntype", void 0)
], RendicionesGastosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id/decidir'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN, enums_1.RolUsuario.JEFE_OPERACIONES),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, decidir_rendicion_gasto_dto_1.DecidirRendicionGastoDto]),
    __metadata("design:returntype", void 0)
], RendicionesGastosController.prototype, "decidir", null);
exports.RendicionesGastosController = RendicionesGastosController = __decorate([
    (0, common_1.Controller)('gastos'),
    __metadata("design:paramtypes", [rendiciones_gastos_service_1.RendicionesGastosService])
], RendicionesGastosController);
//# sourceMappingURL=rendiciones-gastos.controller.js.map
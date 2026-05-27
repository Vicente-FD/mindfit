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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const current_user_decorator_1 = require("../common/decorators/current-user.decorator");
const public_decorator_1 = require("../common/decorators/public.decorator");
const auth_service_1 = require("./auth.service");
const login_dto_1 = require("./dto/login.dto");
const update_sesion_dto_1 = require("./dto/update-sesion.dto");
const solicitar_recuperacion_dto_1 = require("./dto/solicitar-recuperacion.dto");
const cambiar_password_perfil_dto_1 = require("./dto/cambiar-password-perfil.dto");
const solicitudes_password_service_1 = require("../usuarios/solicitudes-password.service");
let AuthController = class AuthController {
    authService;
    solicitudesPasswordService;
    constructor(authService, solicitudesPasswordService) {
        this.authService = authService;
        this.solicitudesPasswordService = solicitudesPasswordService;
    }
    login(dto) {
        return this.authService.login(dto);
    }
    solicitarRecuperacion(dto) {
        return this.solicitudesPasswordService.solicitar(dto.email);
    }
    cambiarPasswordPerfil(user, dto) {
        return this.authService.cambiarPasswordPerfil(user.sub, dto);
    }
    getMe(user) {
        return this.authService.getSessionProfile(user.sub);
    }
    logout(user) {
        return this.authService.logout(user.sub);
    }
    updateSesion(user, dto) {
        return this.authService.updateSesion(user.sub, dto.estado);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "login", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('recuperar/solicitar'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [solicitar_recuperacion_dto_1.SolicitarRecuperacionDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "solicitarRecuperacion", null);
__decorate([
    (0, common_1.Patch)('mi-perfil/cambiar-password'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, cambiar_password_perfil_dto_1.CambiarPasswordPerfilDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "cambiarPasswordPerfil", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getMe", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Patch)('sesion'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Function, update_sesion_dto_1.UpdateSesionDto]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "updateSesion", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        solicitudes_password_service_1.SolicitudesPasswordService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map
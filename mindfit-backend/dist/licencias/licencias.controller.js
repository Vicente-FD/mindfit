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
exports.LicenciasController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_flota_1 = require("../common/constants/roles-flota");
const create_licencia_dto_1 = require("./dto/create-licencia.dto");
const update_licencia_dto_1 = require("./dto/update-licencia.dto");
const licencias_service_1 = require("./licencias.service");
const licencias_documentos_storage_1 = require("./storage/licencias-documentos.storage");
const LICENCIA_FILE_OPTIONS = {
    storage: licencias_documentos_storage_1.licenciasDocumentoMulterStorage,
    fileFilter: licencias_documentos_storage_1.licenciasDocumentoFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 },
};
let LicenciasController = class LicenciasController {
    licenciasService;
    constructor(licenciasService) {
        this.licenciasService = licenciasService;
    }
    findAlertas() {
        return this.licenciasService.findAlertas();
    }
    findPanel() {
        return this.licenciasService.findPanel();
    }
    findAll() {
        return this.licenciasService.findAll();
    }
    findOne(id) {
        return this.licenciasService.findOne(id);
    }
    create(dto, file) {
        if (!file) {
            throw new common_1.BadRequestException('Debe adjuntar el documento de la licencia (PDF o imagen)');
        }
        return this.licenciasService.create(dto, file.filename);
    }
    update(id, dto, file) {
        return this.licenciasService.update(id, dto, file?.filename);
    }
    remove(id) {
        return this.licenciasService.remove(id);
    }
};
exports.LicenciasController = LicenciasController;
__decorate([
    (0, common_1.Get)('alertas'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "findAlertas", null);
__decorate([
    (0, common_1.Get)('panel'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "findPanel", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('documento', LICENCIA_FILE_OPTIONS)),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_licencia_dto_1.CreateLicenciaDto, Object]),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('documento', LICENCIA_FILE_OPTIONS)),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, update_licencia_dto_1.UpdateLicenciaDto, Object]),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], LicenciasController.prototype, "remove", null);
exports.LicenciasController = LicenciasController = __decorate([
    (0, common_1.Controller)('licencias'),
    (0, roles_decorator_1.Roles)(...roles_flota_1.ROLES_FLOTA),
    __metadata("design:paramtypes", [licencias_service_1.LicenciasService])
], LicenciasController);
//# sourceMappingURL=licencias.controller.js.map
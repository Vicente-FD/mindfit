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
exports.AuditTrailController = void 0;
const common_1 = require("@nestjs/common");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const enums_1 = require("../common/enums");
const audit_trail_service_1 = require("./audit-trail.service");
const filter_audit_trail_dto_1 = require("./dto/filter-audit-trail.dto");
let AuditTrailController = class AuditTrailController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    findAll(query) {
        return this.auditService.findAll(query);
    }
};
exports.AuditTrailController = AuditTrailController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [filter_audit_trail_dto_1.FilterAuditTrailDto]),
    __metadata("design:returntype", void 0)
], AuditTrailController.prototype, "findAll", null);
exports.AuditTrailController = AuditTrailController = __decorate([
    (0, common_1.Controller)('audit-trail'),
    (0, roles_decorator_1.Roles)(enums_1.RolUsuario.ADMIN),
    __metadata("design:paramtypes", [audit_trail_service_1.AuditTrailService])
], AuditTrailController);
//# sourceMappingURL=audit-trail.controller.js.map
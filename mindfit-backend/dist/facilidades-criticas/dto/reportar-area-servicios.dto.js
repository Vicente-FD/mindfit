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
exports.ReportarAreaServiciosDto = exports.GENEROS_FACILIDAD = exports.AREAS_FACILIDAD = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
exports.AREAS_FACILIDAD = ['bano', 'camarin', 'ducha'];
exports.GENEROS_FACILIDAD = ['hombres', 'mujeres'];
class ReportarAreaServiciosDto {
    descripcionProblema;
    notasTecnicas;
    prioridad;
    esFallaGeneral;
    area;
    genero;
}
exports.ReportarAreaServiciosDto = ReportarAreaServiciosDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "descripcionProblema", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(2000),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "notasTecnicas", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.PrioridadOrden),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "prioridad", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsIn)(['true', 'false', '1', '0']),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "esFallaGeneral", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !['true', '1'].includes(String(o.esFallaGeneral ?? '').toLowerCase())),
    (0, class_validator_1.IsIn)(exports.AREAS_FACILIDAD),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "area", void 0);
__decorate([
    (0, class_validator_1.ValidateIf)((o) => !['true', '1'].includes(String(o.esFallaGeneral ?? '').toLowerCase())),
    (0, class_validator_1.IsIn)(exports.GENEROS_FACILIDAD),
    __metadata("design:type", String)
], ReportarAreaServiciosDto.prototype, "genero", void 0);
//# sourceMappingURL=reportar-area-servicios.dto.js.map
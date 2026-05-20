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
exports.CreateActivoDto = void 0;
const class_validator_1 = require("class-validator");
const enums_1 = require("../../common/enums");
class CreateActivoDto {
    nombre;
    marcaId;
    modelo;
    numeroSerie;
    categoria;
    sucursalId;
    fechaCompra;
    fechaVencimientoGarantia;
    costoAdquisicion;
    documentacionUrls;
    estadoOperacional;
}
exports.CreateActivoDto = CreateActivoDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(200),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "nombre", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateActivoDto.prototype, "marcaId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "modelo", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "numeroSerie", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(enums_1.CategoriaActivo),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "categoria", void 0);
__decorate([
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateActivoDto.prototype, "sucursalId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "fechaCompra", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "fechaVencimientoGarantia", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    __metadata("design:type", Number)
], CreateActivoDto.prototype, "costoAdquisicion", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsUrl)({}, { each: true }),
    __metadata("design:type", Array)
], CreateActivoDto.prototype, "documentacionUrls", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(enums_1.EstadoOperacionalActivo),
    __metadata("design:type", String)
], CreateActivoDto.prototype, "estadoOperacional", void 0);
//# sourceMappingURL=create-activo.dto.js.map
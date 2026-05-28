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
exports.ServicioAfectadoDetalleDto = exports.ElementoAfectadoDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const capacidades_servicios_types_1 = require("../../common/types/capacidades-servicios.types");
class ElementoAfectadoDto {
    tipo_elemento;
    cantidad;
}
exports.ElementoAfectadoDto = ElementoAfectadoDto;
__decorate([
    (0, class_validator_1.IsIn)(capacidades_servicios_types_1.TIPO_ELEMENTO_SERVICIO_VALUES),
    __metadata("design:type", String)
], ElementoAfectadoDto.prototype, "tipo_elemento", void 0);
__decorate([
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ElementoAfectadoDto.prototype, "cantidad", void 0);
class ServicioAfectadoDetalleDto {
    tipoFacilidad;
    elementos;
}
exports.ServicioAfectadoDetalleDto = ServicioAfectadoDetalleDto;
__decorate([
    (0, class_validator_1.IsIn)([
        'bano_hombres',
        'bano_mujeres',
        'camarin_hombres',
        'camarin_mujeres',
        'duchas_hombres',
        'duchas_mujeres',
    ]),
    __metadata("design:type", String)
], ServicioAfectadoDetalleDto.prototype, "tipoFacilidad", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ValidateNested)({ each: true }),
    (0, class_transformer_1.Type)(() => ElementoAfectadoDto),
    __metadata("design:type", Array)
], ServicioAfectadoDetalleDto.prototype, "elementos", void 0);
//# sourceMappingURL=elemento-afectado.dto.js.map
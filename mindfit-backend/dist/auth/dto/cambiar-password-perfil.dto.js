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
exports.CambiarPasswordPerfilDto = void 0;
const class_validator_1 = require("class-validator");
const PASSWORD_POLICY = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
class CambiarPasswordPerfilDto {
    passwordActual;
    nuevoPassword;
}
exports.CambiarPasswordPerfilDto = CambiarPasswordPerfilDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CambiarPasswordPerfilDto.prototype, "passwordActual", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    (0, class_validator_1.MinLength)(8, {
        message: 'La nueva contraseña debe tener al menos 8 caracteres',
    }),
    (0, class_validator_1.Matches)(PASSWORD_POLICY, {
        message: 'La nueva contraseña debe incluir al menos una mayúscula y un número',
    }),
    __metadata("design:type", String)
], CambiarPasswordPerfilDto.prototype, "nuevoPassword", void 0);
//# sourceMappingURL=cambiar-password-perfil.dto.js.map
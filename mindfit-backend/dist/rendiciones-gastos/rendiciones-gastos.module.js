"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RendicionesGastosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const rendicion_gasto_entity_1 = require("../entities/rendicion-gasto.entity");
const usuario_entity_1 = require("../entities/usuario.entity");
const rendiciones_gastos_controller_1 = require("./rendiciones-gastos.controller");
const rendiciones_gastos_service_1 = require("./rendiciones-gastos.service");
let RendicionesGastosModule = class RendicionesGastosModule {
};
exports.RendicionesGastosModule = RendicionesGastosModule;
exports.RendicionesGastosModule = RendicionesGastosModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([rendicion_gasto_entity_1.RendicionGasto, usuario_entity_1.Usuario])],
        controllers: [rendiciones_gastos_controller_1.RendicionesGastosController],
        providers: [rendiciones_gastos_service_1.RendicionesGastosService],
        exports: [rendiciones_gastos_service_1.RendicionesGastosService],
    })
], RendicionesGastosModule);
//# sourceMappingURL=rendiciones-gastos.module.js.map
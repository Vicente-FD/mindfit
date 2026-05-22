"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActivosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const activo_entity_1 = require("../entities/activo.entity");
const categoria_entity_1 = require("../entities/categoria.entity");
const marca_entity_1 = require("../entities/marca.entity");
const inventario_module_1 = require("../inventario/inventario.module");
const activos_controller_1 = require("./activos.controller");
const activos_service_1 = require("./activos.service");
const codigo_inventario_service_1 = require("./codigo-inventario.service");
let ActivosModule = class ActivosModule {
};
exports.ActivosModule = ActivosModule;
exports.ActivosModule = ActivosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([activo_entity_1.Activo, marca_entity_1.Marca, categoria_entity_1.Categoria]),
            inventario_module_1.InventarioModule,
        ],
        controllers: [activos_controller_1.ActivosController],
        providers: [activos_service_1.ActivosService, codigo_inventario_service_1.CodigoInventarioService],
        exports: [activos_service_1.ActivosService],
    })
], ActivosModule);
//# sourceMappingURL=activos.module.js.map
"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FacilidadesCriticasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const facilidad_critica_historial_entity_1 = require("../entities/facilidad-critica-historial.entity");
const facilidad_critica_entity_1 = require("../entities/facilidad-critica.entity");
const ordenes_trabajo_module_1 = require("../ordenes-trabajo/ordenes-trabajo.module");
const facilidades_criticas_controller_1 = require("./facilidades-criticas.controller");
const facilidades_criticas_service_1 = require("./facilidades-criticas.service");
let FacilidadesCriticasModule = class FacilidadesCriticasModule {
};
exports.FacilidadesCriticasModule = FacilidadesCriticasModule;
exports.FacilidadesCriticasModule = FacilidadesCriticasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([facilidad_critica_entity_1.FacilidadCritica, facilidad_critica_historial_entity_1.FacilidadCriticaHistorial]),
            ordenes_trabajo_module_1.OrdenesTrabajoModule,
        ],
        controllers: [facilidades_criticas_controller_1.FacilidadesCriticasController],
        providers: [facilidades_criticas_service_1.FacilidadesCriticasService],
        exports: [facilidades_criticas_service_1.FacilidadesCriticasService],
    })
], FacilidadesCriticasModule);
//# sourceMappingURL=facilidades-criticas.module.js.map
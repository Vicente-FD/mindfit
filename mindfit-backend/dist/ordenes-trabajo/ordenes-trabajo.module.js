"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdenesTrabajoModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const orden_trabajo_entity_1 = require("../entities/orden-trabajo.entity");
const evidencia_ot_entity_1 = require("../entities/evidencia-ot.entity");
const comentario_ot_entity_1 = require("../entities/comentario-ot.entity");
const ordenes_trabajo_controller_1 = require("./ordenes-trabajo.controller");
const ordenes_trabajo_service_1 = require("./ordenes-trabajo.service");
let OrdenesTrabajoModule = class OrdenesTrabajoModule {
};
exports.OrdenesTrabajoModule = OrdenesTrabajoModule;
exports.OrdenesTrabajoModule = OrdenesTrabajoModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([orden_trabajo_entity_1.OrdenTrabajo, evidencia_ot_entity_1.EvidenciaOt, comentario_ot_entity_1.ComentarioOt])],
        controllers: [ordenes_trabajo_controller_1.OrdenesTrabajoController],
        providers: [ordenes_trabajo_service_1.OrdenesTrabajoService],
    })
], OrdenesTrabajoModule);
//# sourceMappingURL=ordenes-trabajo.module.js.map
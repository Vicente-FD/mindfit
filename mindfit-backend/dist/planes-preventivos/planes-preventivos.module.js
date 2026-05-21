"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlanesPreventivosModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const plan_preventivo_entity_1 = require("../entities/plan-preventivo.entity");
const ordenes_trabajo_module_1 = require("../ordenes-trabajo/ordenes-trabajo.module");
const planes_preventivos_controller_1 = require("./planes-preventivos.controller");
const planes_preventivos_service_1 = require("./planes-preventivos.service");
const cron_scheduler_service_1 = require("./cron-scheduler.service");
let PlanesPreventivosModule = class PlanesPreventivosModule {
};
exports.PlanesPreventivosModule = PlanesPreventivosModule;
exports.PlanesPreventivosModule = PlanesPreventivosModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([plan_preventivo_entity_1.PlanPreventivo]),
            ordenes_trabajo_module_1.OrdenesTrabajoModule,
        ],
        controllers: [planes_preventivos_controller_1.PlanesPreventivosController],
        providers: [planes_preventivos_service_1.PlanesPreventivosService, cron_scheduler_service_1.CronSchedulerService],
    })
], PlanesPreventivosModule);
//# sourceMappingURL=planes-preventivos.module.js.map
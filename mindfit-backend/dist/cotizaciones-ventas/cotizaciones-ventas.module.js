"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CotizacionesVentasModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const cotizacion_venta_entity_1 = require("../entities/cotizacion-venta.entity");
const cotizacion_ventas_detalle_entity_1 = require("../entities/cotizacion-ventas-detalle.entity");
const clientes_module_1 = require("../clientes/clientes.module");
const divisas_module_1 = require("../divisas/divisas.module");
const cotizaciones_ventas_controller_1 = require("./cotizaciones-ventas.controller");
const cotizaciones_ventas_service_1 = require("./cotizaciones-ventas.service");
let CotizacionesVentasModule = class CotizacionesVentasModule {
};
exports.CotizacionesVentasModule = CotizacionesVentasModule;
exports.CotizacionesVentasModule = CotizacionesVentasModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([cotizacion_venta_entity_1.CotizacionVenta, cotizacion_ventas_detalle_entity_1.CotizacionVentasDetalle]),
            clientes_module_1.ClientesModule,
            divisas_module_1.DivisasModule,
        ],
        controllers: [cotizaciones_ventas_controller_1.CotizacionesVentasController],
        providers: [cotizaciones_ventas_service_1.CotizacionesVentasService],
        exports: [cotizaciones_ventas_service_1.CotizacionesVentasService],
    })
], CotizacionesVentasModule);
//# sourceMappingURL=cotizaciones-ventas.module.js.map